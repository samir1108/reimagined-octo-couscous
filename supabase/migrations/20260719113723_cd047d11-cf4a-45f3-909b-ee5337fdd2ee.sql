
CREATE TABLE public.personal_practice_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  source TEXT,
  duration_min INTEGER DEFAULT 0,
  notify BOOLEAN DEFAULT false,
  payload JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pps_user_day ON public.personal_practice_schedule(user_id, day_date);
CREATE INDEX idx_pps_scheduled_at ON public.personal_practice_schedule(scheduled_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_practice_schedule TO authenticated;
GRANT ALL ON public.personal_practice_schedule TO service_role;

ALTER TABLE public.personal_practice_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own schedule"
  ON public.personal_practice_schedule
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER pps_touch_updated_at
  BEFORE UPDATE ON public.personal_practice_schedule
  FOR EACH ROW EXECUTE FUNCTION public.daily_themes_touch_updated_at();
