
-- Enable scheduling + HTTP extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- ============= active_loops =============
CREATE TABLE IF NOT EXISTS public.active_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  loop_name TEXT,
  severity NUMERIC DEFAULT 0.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, loop_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.active_loops TO authenticated;
GRANT ALL ON public.active_loops TO service_role;
ALTER TABLE public.active_loops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own active_loops" ON public.active_loops FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_active_loops_user ON public.active_loops(user_id, is_active);

-- ============= sacred_moments =============
CREATE TABLE IF NOT EXISTS public.sacred_moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moment_type TEXT NOT NULL,
  title TEXT,
  user_words TEXT,
  importance INTEGER NOT NULL DEFAULT 5,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  voice_url TEXT,
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  linked_loop_ids TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sacred_moments TO authenticated;
GRANT ALL ON public.sacred_moments TO service_role;
ALTER TABLE public.sacred_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sacred_moments" ON public.sacred_moments FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_sacred_moments_user_occurred ON public.sacred_moments(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_sacred_moments_user_type ON public.sacred_moments(user_id, moment_type);
CREATE INDEX IF NOT EXISTS idx_sacred_moments_user_words_trgm ON public.sacred_moments USING gin (user_words gin_trgm_ops);

-- ============= trust_milestones =============
CREATE TABLE IF NOT EXISTS public.trust_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_key TEXT NOT NULL,
  milestone_label TEXT,
  letter_content TEXT,
  reached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_read BOOLEAN NOT NULL DEFAULT false,
  user_read_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trust_milestones TO authenticated;
GRANT ALL ON public.trust_milestones TO service_role;
ALTER TABLE public.trust_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trust_milestones" ON public.trust_milestones FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============= life_events =============
CREATE TABLE IF NOT EXISTS public.life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  emotional_weight INTEGER NOT NULL DEFAULT 5,
  related_people TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_events TO authenticated;
GRANT ALL ON public.life_events TO service_role;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own life_events" ON public.life_events FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============= user_practice_levels =============
CREATE TABLE IF NOT EXISTS public.user_practice_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  practice_type TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 0,
  sessions_at_level INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  emotional_healing INTEGER NOT NULL DEFAULT 0,
  loop_dissolution INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, practice_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_practice_levels TO authenticated;
GRANT ALL ON public.user_practice_levels TO service_role;
ALTER TABLE public.user_practice_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own practice levels" ON public.user_practice_levels FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
DROP TRIGGER IF EXISTS trg_active_loops_updated ON public.active_loops;
CREATE TRIGGER trg_active_loops_updated BEFORE UPDATE ON public.active_loops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_sacred_moments_updated ON public.sacred_moments;
CREATE TRIGGER trg_sacred_moments_updated BEFORE UPDATE ON public.sacred_moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_life_events_updated ON public.life_events;
CREATE TRIGGER trg_life_events_updated BEFORE UPDATE ON public.life_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_upl_updated ON public.user_practice_levels;
CREATE TRIGGER trg_upl_updated BEFORE UPDATE ON public.user_practice_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anniversary finder: matches month+day of recurring life events
CREATE OR REPLACE FUNCTION public.find_life_event_anniversaries(_user_id UUID)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  title TEXT,
  description TEXT,
  event_date DATE,
  years_ago INTEGER,
  emotional_weight INTEGER,
  related_people TEXT[]
)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT
    e.id,
    e.event_type,
    e.title,
    e.description,
    e.event_date,
    GREATEST(0, EXTRACT(YEAR FROM age(CURRENT_DATE, e.event_date))::INTEGER) AS years_ago,
    e.emotional_weight,
    e.related_people
  FROM public.life_events e
  WHERE e.user_id = _user_id
    AND e.is_recurring = true
    AND EXTRACT(MONTH FROM e.event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM e.event_date) = EXTRACT(DAY FROM CURRENT_DATE)
    AND e.event_date < CURRENT_DATE
  ORDER BY e.emotional_weight DESC;
$$;

-- Anniversary helper — used by "Remember when..." engine
CREATE OR REPLACE FUNCTION public.find_anniversary_moments(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  id UUID,
  moment_type TEXT,
  title TEXT,
  user_words TEXT,
  occurred_at TIMESTAMPTZ,
  years_ago NUMERIC,
  months_ago NUMERIC,
  importance INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sm.id, sm.moment_type, sm.title, sm.user_words, sm.occurred_at,
    EXTRACT(YEAR FROM age(p_date::timestamptz, sm.occurred_at))::numeric AS years_ago,
    (EXTRACT(YEAR FROM age(p_date::timestamptz, sm.occurred_at)) * 12
      + EXTRACT(MONTH FROM age(p_date::timestamptz, sm.occurred_at)))::numeric AS months_ago,
    sm.importance
  FROM public.sacred_moments sm
  WHERE sm.user_id = p_user_id
    AND sm.occurred_at < (p_date - INTERVAL '25 days')::timestamptz
    AND (
      (EXTRACT(MONTH FROM sm.occurred_at) = EXTRACT(MONTH FROM p_date)
       AND EXTRACT(DAY FROM sm.occurred_at) = EXTRACT(DAY FROM p_date))
      OR ABS(EXTRACT(EPOCH FROM (p_date::timestamptz - sm.occurred_at))/86400 - 30)  < 2
      OR ABS(EXTRACT(EPOCH FROM (p_date::timestamptz - sm.occurred_at))/86400 - 90)  < 2
      OR ABS(EXTRACT(EPOCH FROM (p_date::timestamptz - sm.occurred_at))/86400 - 180) < 2
    )
  ORDER BY sm.importance DESC, sm.occurred_at DESC
  LIMIT 5;
$$;
