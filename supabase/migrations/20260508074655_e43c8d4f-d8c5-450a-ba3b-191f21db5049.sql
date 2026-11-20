
CREATE TABLE IF NOT EXISTS public.user_daily_routine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  wake_time TEXT,
  sleep_time TEXT,
  morning_activities TEXT,
  midday_activities TEXT,
  evening_activities TEXT,
  night_activities TEXT,
  weekend_pattern TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_daily_routine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own routine" ON public.user_daily_routine
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own routine" ON public.user_daily_routine
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own routine" ON public.user_daily_routine
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own routine" ON public.user_daily_routine
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_daily_routine_updated_at
BEFORE UPDATE ON public.user_daily_routine
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
