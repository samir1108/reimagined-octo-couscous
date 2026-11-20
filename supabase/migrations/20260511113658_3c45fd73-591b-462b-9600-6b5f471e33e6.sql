
CREATE TABLE IF NOT EXISTS public.user_kundli (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  date_of_birth DATE,
  time_of_birth TIME,
  time_unknown BOOLEAN DEFAULT false,
  place_of_birth TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT,
  ayanamsa NUMERIC,
  sun_longitude NUMERIC,
  moon_longitude NUMERIC,
  ascendant_longitude NUMERIC,
  rashi TEXT,
  rashi_lord TEXT,
  nakshatra TEXT,
  nakshatra_lord TEXT,
  pada INT,
  yoni TEXT,
  gana TEXT,
  nadi TEXT,
  varna TEXT,
  vashya TEXT,
  tithi TEXT,
  karana TEXT,
  nitya_yoga TEXT,
  current_mahadasha TEXT,
  current_mahadasha_end DATE,
  planets JSONB DEFAULT '{}'::jsonb,
  houses JSONB DEFAULT '{}'::jsonb,
  numerology JSONB DEFAULT '{}'::jsonb,
  insights JSONB DEFAULT '{}'::jsonb,
  confidence NUMERIC DEFAULT 0.6,
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_kundli ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own kundli"
  ON public.user_kundli FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own kundli"
  ON public.user_kundli FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own kundli"
  ON public.user_kundli FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER touch_user_kundli
  BEFORE UPDATE ON public.user_kundli
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
