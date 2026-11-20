-- ============================================================
-- OBSERVATION RUNS — one row per sitting on the 100-session ladder
-- ============================================================
-- Local-first logging lives in src/lib/practice/observationProgress.ts.
-- This table mirrors those runs once a user is signed in, so the picker's
-- no-repeat window and the lens/level progress survive a device change.
--
-- seed_id comes from src/data/observationSessions.ts (obs-l1-01 … obs-l7-16).
-- session_number is the deterministic picker input (day number + same-day
-- repeat count), so a row can be reproduced exactly.

CREATE TABLE IF NOT EXISTS public.observation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seed_id TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 7),
  lens TEXT NOT NULL,
  method TEXT NOT NULL,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  felt_shift TEXT CHECK (felt_shift IN ('lighter', 'same', 'heavier')),
  arrival_state TEXT,
  journal_line TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS observation_runs_user_created_idx
  ON public.observation_runs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS observation_runs_user_seed_idx
  ON public.observation_runs (user_id, seed_id);

CREATE INDEX IF NOT EXISTS observation_runs_user_level_idx
  ON public.observation_runs (user_id, level);

ALTER TABLE public.observation_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own observation runs" ON public.observation_runs;
CREATE POLICY "Users view own observation runs" ON public.observation_runs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own observation runs" ON public.observation_runs;
CREATE POLICY "Users insert own observation runs" ON public.observation_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own observation runs" ON public.observation_runs;
CREATE POLICY "Users update own observation runs" ON public.observation_runs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.observation_runs TO authenticated;

-- Progress rollup: distinct seeds completed per level and lens.
CREATE OR REPLACE VIEW public.observation_progress AS
SELECT
  user_id,
  level,
  lens,
  COUNT(DISTINCT seed_id) AS seeds_completed,
  COUNT(*) AS sittings,
  MAX(created_at) AS last_sat_at
FROM public.observation_runs
WHERE completed = TRUE
GROUP BY user_id, level, lens;

GRANT SELECT ON public.observation_progress TO authenticated;
