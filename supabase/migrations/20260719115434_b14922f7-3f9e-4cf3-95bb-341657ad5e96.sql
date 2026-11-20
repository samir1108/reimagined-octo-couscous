
-- ============================================================
-- 1. sessions — one row per composed session
-- ============================================================
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The full composed SessionPlan (intent, intro, atoms[]).
  plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Denormalized top-line fields (also present in plan) for cheap queries.
  intent TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT,                       -- morning | midday | evening | night
  type TEXT,                            -- generative | program | practice | onboarding | ...
  user_chosen_topic TEXT,
  master_id TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'planned', -- planned | active | completed | abandoned
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  v_level_start NUMERIC,
  v_level_delta NUMERIC,
  karma_earned INTEGER NOT NULL DEFAULT 0,
  quality_score NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_date_idx ON public.sessions (user_id, session_date DESC);
CREATE INDEX sessions_user_created_idx ON public.sessions (user_id, created_at DESC);
CREATE INDEX sessions_user_status_idx ON public.sessions (user_id, status);
CREATE INDEX sessions_user_master_idx ON public.sessions (user_id, master_id) WHERE master_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own sessions"
  ON public.sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger (reuse existing helper if present, else create)
CREATE OR REPLACE FUNCTION public.sessions_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER sessions_touch_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.sessions_touch_updated_at();


-- ============================================================
-- 2. session_step_events — one row per atom the user hit
-- ============================================================
CREATE TABLE public.session_step_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  kind TEXT NOT NULL,           -- the StepAtom.kind (breath | witness | game | master-chat | ...)
  atom_ref TEXT,                -- e.g. gameId, masterId, sourceId, loopId
  title TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  skipped BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER,               -- 1..5 optional
  quality_score NUMERIC,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_step_events_session_idx ON public.session_step_events (session_id, step_index);
CREATE INDEX session_step_events_user_created_idx ON public.session_step_events (user_id, created_at DESC);
CREATE INDEX session_step_events_user_kind_idx ON public.session_step_events (user_id, kind);
CREATE INDEX session_step_events_user_atom_idx ON public.session_step_events (user_id, atom_ref) WHERE atom_ref IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_step_events TO authenticated;
GRANT ALL ON public.session_step_events TO service_role;

ALTER TABLE public.session_step_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own session step events"
  ON public.session_step_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
