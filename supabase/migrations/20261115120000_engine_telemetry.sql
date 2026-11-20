-- ============================================================
-- ENGINE TELEMETRY
-- ------------------------------------------------------------
-- The brain decided things but never recorded why. This adds the
-- decision log, the crisis log, and the per-session provenance columns
-- the learning loop and funnel both need.
-- ============================================================

-- 1. engine_decisions — one row per composition decision
CREATE TABLE IF NOT EXISTS public.engine_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  engine TEXT NOT NULL,                     -- 'consciousness-orchestrator' | 'compose-session-v3'
  brain_mode TEXT NOT NULL,                 -- 'local' | 'hybrid' | 'cloud'
  policy_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  chosen JSONB NOT NULL DEFAULT '{}'::jsonb,
  alternatives JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC,
  latency_ms INTEGER,
  crisis BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS engine_decisions_user_created_idx
  ON public.engine_decisions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS engine_decisions_session_idx
  ON public.engine_decisions (session_id);
CREATE INDEX IF NOT EXISTS engine_decisions_policy_idx
  ON public.engine_decisions (policy_version, created_at DESC);
CREATE INDEX IF NOT EXISTS engine_decisions_input_hash_idx
  ON public.engine_decisions (input_hash);

GRANT SELECT, INSERT ON public.engine_decisions TO authenticated;
GRANT ALL ON public.engine_decisions TO service_role;

ALTER TABLE public.engine_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own engine decisions"
  ON public.engine_decisions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own engine decisions"
  ON public.engine_decisions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. crisis_events — the safety gate must be measurable
CREATE TABLE IF NOT EXISTS public.crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  surface TEXT NOT NULL,                    -- guide-chat | temple-chat | compose-session-v3 | orchestrator
  severity TEXT NOT NULL,                   -- 'acute' | 'elevated'
  matched TEXT[] NOT NULL DEFAULT '{}',
  action TEXT NOT NULL,                     -- 'short_circuit' | 'directive'
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crisis_events_created_idx
  ON public.crisis_events (created_at DESC);
CREATE INDEX IF NOT EXISTS crisis_events_surface_idx
  ON public.crisis_events (surface, created_at DESC);
CREATE INDEX IF NOT EXISTS crisis_events_user_idx
  ON public.crisis_events (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.crisis_events TO authenticated;
GRANT ALL ON public.crisis_events TO service_role;

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own crisis events"
  ON public.crisis_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own crisis events"
  ON public.crisis_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Provenance on the session itself
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS brain_mode TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS policy_version TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS decision_id UUID;
