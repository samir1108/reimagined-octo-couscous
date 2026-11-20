-- daily_sankalpa: one seed-intention per user per day
CREATE TABLE public.daily_sankalpa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sankalpa_date DATE NOT NULL DEFAULT CURRENT_DATE,
  intention TEXT NOT NULL,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'ritual_session',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sankalpa_date)
);

ALTER TABLE public.daily_sankalpa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sankalpa"
  ON public.daily_sankalpa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sankalpa"
  ON public.daily_sankalpa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sankalpa"
  ON public.daily_sankalpa FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own sankalpa"
  ON public.daily_sankalpa FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_daily_sankalpa
  BEFORE UPDATE ON public.daily_sankalpa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- journey_harvest: AI-extracted insight per ritual session
CREATE TABLE public.journey_harvest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  insight TEXT NOT NULL,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  session_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_harvest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own harvest"
  ON public.journey_harvest FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own harvest"
  ON public.journey_harvest FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own harvest"
  ON public.journey_harvest FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own harvest"
  ON public.journey_harvest FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_daily_sankalpa_user_date ON public.daily_sankalpa(user_id, sankalpa_date DESC);
CREATE INDEX idx_journey_harvest_user_date ON public.journey_harvest(user_id, harvest_date DESC);