-- Arc progress — one row per completed sit.
-- Separate from session_outcomes so an arc sit does not need a session FK.

CREATE TABLE IF NOT EXISTS public.arc_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  arc_id TEXT NOT NULL,
  sit_index INTEGER NOT NULL,
  quality NUMERIC,
  felt_shift TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, arc_id, sit_index)
);

CREATE INDEX IF NOT EXISTS arc_progress_user_arc_idx
  ON public.arc_progress (user_id, arc_id, sit_index);

ALTER TABLE public.arc_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own arc progress" ON public.arc_progress;
CREATE POLICY "Users read own arc progress" ON public.arc_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users write own arc progress" ON public.arc_progress;
CREATE POLICY "Users write own arc progress" ON public.arc_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own arc progress" ON public.arc_progress;
CREATE POLICY "Users update own arc progress" ON public.arc_progress
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.arc_progress TO authenticated;
