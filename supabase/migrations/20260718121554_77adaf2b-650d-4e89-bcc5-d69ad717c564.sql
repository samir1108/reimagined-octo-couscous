
CREATE TABLE public.mirror_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mirror_number INTEGER NOT NULL CHECK (mirror_number BETWEEN 1 AND 38),
  mirror_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  module TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  band TEXT NOT NULL DEFAULT 'preliminary' CHECK (band IN ('preliminary','inferred','read','locked')),
  evidence TEXT,
  reading_note TEXT,
  source TEXT NOT NULL DEFAULT 'elder_onboarding',
  day_zero BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mirror_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mirror_readings TO authenticated;
GRANT ALL ON public.mirror_readings TO service_role;

ALTER TABLE public.mirror_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own mirror readings"
ON public.mirror_readings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mirror_readings_user ON public.mirror_readings(user_id, mirror_number);

CREATE OR REPLACE FUNCTION public.mirror_readings_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER mirror_readings_updated
BEFORE UPDATE ON public.mirror_readings
FOR EACH ROW EXECUTE FUNCTION public.mirror_readings_touch_updated_at();
