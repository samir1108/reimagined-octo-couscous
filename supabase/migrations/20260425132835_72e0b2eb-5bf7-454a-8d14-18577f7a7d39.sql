-- Pre-Journey Foundation Course progress
CREATE TABLE public.pre_journey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pace TEXT NOT NULL DEFAULT 'balanced' CHECK (pace IN ('slow', 'balanced', 'intense')),
  completed_session_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  current_session_id TEXT NOT NULL DEFAULT 'pj-001',
  module_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  reflections JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graduated_at TIMESTAMP WITH TIME ZONE,
  last_session_at TIMESTAMP WITH TIME ZONE,
  today_count INTEGER NOT NULL DEFAULT 0,
  today_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pre_journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pre-journey progress"
  ON public.pre_journey_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own pre-journey progress"
  ON public.pre_journey_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pre-journey progress"
  ON public.pre_journey_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own pre-journey progress"
  ON public.pre_journey_progress FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_pre_journey_progress_updated_at
  BEFORE UPDATE ON public.pre_journey_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pre_journey_progress_user ON public.pre_journey_progress(user_id);