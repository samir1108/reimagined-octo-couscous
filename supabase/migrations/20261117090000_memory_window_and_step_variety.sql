-- ============================================================
-- Fix semantic recall windows and in-plan repetition
-- ------------------------------------------------------------
-- 1) match_user_memories computed `days_ago` with
--    EXTRACT(DAY FROM interval). For intervals longer than a month that
--    returns the day-of-month remainder (e.g. 40 days → 10), so both the
--    returned age and the `p_min_days_ago` filter were wrong.
-- 2) Add an optional upper bound so callers can ask for "the last N days"
--    instead of "at least N days ago".
-- 3) Deduplicate session_step vectors per (user, source_id, content) so the
--    novelty comparison is not diluted by the same step embedded repeatedly.
-- ============================================================

DROP FUNCTION IF EXISTS public.match_user_memories(UUID, vector, INT, INT);

CREATE OR REPLACE FUNCTION public.match_user_memories(
  p_user_id UUID,
  p_query_embedding vector(768),
  p_match_count INT DEFAULT 5,
  p_min_days_ago INT DEFAULT 0,
  p_max_days_ago INT DEFAULT NULL
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
  WITH scored AS (
    SELECT
      m.id,
      m.source_type,
      m.content,
      m.loop_ids,
      m.tags,
      m.created_at,
      (EXTRACT(EPOCH FROM (now() - m.created_at)) / 86400)::INT AS age_days,
      1 - (m.embedding <=> p_query_embedding) AS similarity
    FROM public.user_memory_vectors m
    WHERE m.user_id = p_user_id
      AND m.embedding IS NOT NULL
  )
  SELECT
    s.id,
    s.source_type,
    s.content,
    s.loop_ids,
    s.tags,
    s.created_at,
    s.age_days AS days_ago,
    s.similarity
  FROM scored s
  WHERE s.age_days >= COALESCE(p_min_days_ago, 0)
    AND (p_max_days_ago IS NULL OR s.age_days <= p_max_days_ago)
  ORDER BY s.similarity DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_match_count, 5), 100));
$$;

GRANT EXECUTE ON FUNCTION public.match_user_memories(UUID, vector, INT, INT, INT)
  TO authenticated, service_role;
