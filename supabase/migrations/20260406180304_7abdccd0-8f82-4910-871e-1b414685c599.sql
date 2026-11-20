
-- Daily dimension summary for end-of-day calibration roll-ups
CREATE TABLE public.daily_dimension_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  thought_score NUMERIC NOT NULL DEFAULT 0,
  emotion_score NUMERIC NOT NULL DEFAULT 0,
  body_score NUMERIC NOT NULL DEFAULT 0,
  awareness_score NUMERIC NOT NULL DEFAULT 0,
  signal_count INTEGER NOT NULL DEFAULT 0,
  confidence_avg NUMERIC NOT NULL DEFAULT 0,
  is_calibration_day BOOLEAN NOT NULL DEFAULT false,
  calibration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, summary_date)
);

ALTER TABLE public.daily_dimension_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own daily summaries"
ON public.daily_dimension_summary FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily summaries"
ON public.daily_dimension_summary FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily summaries"
ON public.daily_dimension_summary FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_dimension_summary_updated_at
BEFORE UPDATE ON public.daily_dimension_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_daily_dimension_summary_user_date ON public.daily_dimension_summary(user_id, summary_date DESC);
