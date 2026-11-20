
CREATE TABLE IF NOT EXISTS public.personal_practice_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_date DATE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'in_app',
  source TEXT,
  duration_min INT DEFAULT 5,
  notify BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pps_user_day ON public.personal_practice_schedule(user_id, day_date);
CREATE INDEX IF NOT EXISTS idx_pps_user_time ON public.personal_practice_schedule(user_id, scheduled_at);

ALTER TABLE public.personal_practice_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rhythm"
  ON public.personal_practice_schedule FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own rhythm"
  ON public.personal_practice_schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own rhythm"
  ON public.personal_practice_schedule FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own rhythm"
  ON public.personal_practice_schedule FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER touch_personal_practice_schedule
  BEFORE UPDATE ON public.personal_practice_schedule
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
