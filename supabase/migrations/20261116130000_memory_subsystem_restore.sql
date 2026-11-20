-- ============================================================
-- LONG-TERM MEMORY SUBSYSTEM — restore missing objects
-- ------------------------------------------------------------
-- 20260518070725 was never applied to the remote database, so every
-- embed-memory insert failed with PGRST205 ("Could not find the table
-- public.user_memory_vectors") and the edge function returned 500.
-- recall/build-long-term-memory then silently degraded as well.
--
-- This migration is self-contained and idempotent: it can be applied to
-- a database that never had these objects and re-applied safely.
--
-- It also allows source_type = 'session_step', which the orchestrator and
-- compose-session-v3 write for novelty checks but the original CHECK
-- rejected.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 1) user_memory_vectors — embedded utterances + session steps
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_memory_vectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  content TEXT NOT NULL,
  embedding vector(768),
  tags TEXT[] DEFAULT '{}',
  loop_ids TEXT[] DEFAULT '{}',
  occurrence_count INT NOT NULL DEFAULT 1,
  last_referenced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_memory_vectors
  DROP CONSTRAINT IF EXISTS user_memory_vectors_source_type_check;

ALTER TABLE public.user_memory_vectors
  ADD CONSTRAINT user_memory_vectors_source_type_check
  CHECK (source_type IN (
    'journal',
    'chat',
    'reflection',
    'session',
    'session_step',
    'observation',
    'pulse',
    'synthesis'
  ));

CREATE INDEX IF NOT EXISTS idx_umv_user_created ON public.user_memory_vectors (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_umv_user_source ON public.user_memory_vectors (user_id, source_type);
CREATE INDEX IF NOT EXISTS idx_umv_loops ON public.user_memory_vectors USING GIN (loop_ids);
CREATE INDEX IF NOT EXISTS idx_umv_embedding ON public.user_memory_vectors USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.user_memory_vectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "umv_select_own" ON public.user_memory_vectors;
CREATE POLICY "umv_select_own" ON public.user_memory_vectors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "umv_insert_own" ON public.user_memory_vectors;
CREATE POLICY "umv_insert_own" ON public.user_memory_vectors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "umv_update_own" ON public.user_memory_vectors;
CREATE POLICY "umv_update_own" ON public.user_memory_vectors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "umv_delete_own" ON public.user_memory_vectors;
CREATE POLICY "umv_delete_own" ON public.user_memory_vectors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memory_vectors TO authenticated;
GRANT ALL ON public.user_memory_vectors TO service_role;

-- ============================================================
-- 2) daily_memory_synthesis — nightly 3-sentence doc
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_memory_synthesis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  synthesis_date DATE NOT NULL,
  summary TEXT NOT NULL,
  key_themes TEXT[] DEFAULT '{}',
  loops_touched TEXT[] DEFAULT '{}',
  mood_signal TEXT,
  v_level_at_time NUMERIC,
  source_counts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, synthesis_date)
);

CREATE INDEX IF NOT EXISTS idx_dms_user_date ON public.daily_memory_synthesis (user_id, synthesis_date DESC);

ALTER TABLE public.daily_memory_synthesis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dms_select_own" ON public.daily_memory_synthesis;
CREATE POLICY "dms_select_own" ON public.daily_memory_synthesis
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dms_insert_own" ON public.daily_memory_synthesis;
CREATE POLICY "dms_insert_own" ON public.daily_memory_synthesis
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.daily_memory_synthesis TO authenticated;
GRANT ALL ON public.daily_memory_synthesis TO service_role;

-- ============================================================
-- 3) ai_callback_log — track felt-continuity callbacks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_callback_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  referenced_memory_id UUID REFERENCES public.user_memory_vectors(id) ON DELETE SET NULL,
  referenced_date DATE,
  days_ago INT,
  callback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acl_user_created ON public.ai_callback_log (user_id, created_at DESC);

ALTER TABLE public.ai_callback_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acl_select_own" ON public.ai_callback_log;
CREATE POLICY "acl_select_own" ON public.ai_callback_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "acl_insert_own" ON public.ai_callback_log;
CREATE POLICY "acl_insert_own" ON public.ai_callback_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.ai_callback_log TO authenticated;
GRANT ALL ON public.ai_callback_log TO service_role;

-- ============================================================
-- 4) match_user_memories — semantic recall
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_user_memories(
  p_user_id UUID,
  p_query_embedding vector(768),
  p_match_count INT DEFAULT 5,
  p_min_days_ago INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  content TEXT,
  loop_ids TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ,
  days_ago INT,
  similarity FLOAT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    m.id,
    m.source_type,
    m.content,
    m.loop_ids,
    m.tags,
    m.created_at,
    EXTRACT(DAY FROM (now() - m.created_at))::INT AS days_ago,
    1 - (m.embedding <=> p_query_embedding) AS similarity
  FROM public.user_memory_vectors m
  WHERE m.user_id = p_user_id
    AND m.embedding IS NOT NULL
    AND EXTRACT(DAY FROM (now() - m.created_at))::INT >= p_min_days_ago
  ORDER BY m.embedding <=> p_query_embedding
  LIMIT p_match_count;
$$;

-- ============================================================
-- 5) count_loop_occurrences — pattern recurrence over a window
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_loop_occurrences(
  p_user_id UUID,
  p_loop_id TEXT,
  p_days INT DEFAULT 60
)
RETURNS TABLE (
  total_count INT,
  first_seen_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  distinct_days INT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(*)::INT AS total_count,
    MIN(created_at) AS first_seen_at,
    MAX(created_at) AS last_seen_at,
    COUNT(DISTINCT DATE(created_at))::INT AS distinct_days
  FROM public.user_memory_vectors
  WHERE user_id = p_user_id
    AND p_loop_id = ANY(loop_ids)
    AND created_at >= now() - (p_days || ' days')::INTERVAL;
$$;

GRANT EXECUTE ON FUNCTION public.match_user_memories(UUID, vector, INT, INT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.count_loop_occurrences(UUID, TEXT, INT) TO authenticated, service_role;
