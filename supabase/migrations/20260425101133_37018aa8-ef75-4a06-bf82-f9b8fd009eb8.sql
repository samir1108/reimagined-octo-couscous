CREATE TABLE IF NOT EXISTS public.practice_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id TEXT,
  primary_practice TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  planned_duration_sec INTEGER NOT NULL,
  actual_duration_sec INTEGER NOT NULL DEFAULT 0,
  completion_pct NUMERIC NOT NULL DEFAULT 0,
  quality TEXT,
  pause_count INTEGER NOT NULL DEFAULT 0,
  skip_count INTEGER NOT NULL DEFAULT 0,
  extend_count INTEGER NOT NULL DEFAULT 0,
  time_slot TEXT,
  mood_before TEXT,
  mood_after TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practice_runs_user ON public.practice_runs(user_id, started_at DESC);

ALTER TABLE public.practice_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own practice_runs"
  ON public.practice_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own practice_runs"
  ON public.practice_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own practice_runs"
  ON public.practice_runs FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_practice_runs_updated_at
  BEFORE UPDATE ON public.practice_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();