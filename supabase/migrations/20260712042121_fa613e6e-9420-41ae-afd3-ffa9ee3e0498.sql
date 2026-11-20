
ALTER TABLE public.daily_rituals ADD COLUMN IF NOT EXISTS user_engaged BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.daily_rituals ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.sacred_moments ADD COLUMN IF NOT EXISTS emotional_tone TEXT;
ALTER TABLE public.sacred_moments ADD COLUMN IF NOT EXISTS source_type TEXT;

DROP FUNCTION IF EXISTS public.find_life_event_anniversaries(UUID);

CREATE OR REPLACE FUNCTION public.find_life_event_anniversaries(_user_id UUID)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  title TEXT,
  description TEXT,
  event_date DATE,
  is_recurring BOOLEAN,
  emotional_weight INTEGER,
  related_people TEXT[],
  years_ago INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    le.id, le.event_type, le.title, le.description, le.event_date,
    le.is_recurring, le.emotional_weight, le.related_people,
    (EXTRACT(YEAR FROM age(CURRENT_DATE, le.event_date)))::INT AS years_ago
  FROM public.life_events le
  WHERE le.user_id = _user_id
    AND le.is_recurring = true
    AND EXTRACT(MONTH FROM le.event_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(DAY FROM le.event_date) BETWEEN EXTRACT(DAY FROM CURRENT_DATE) - 3 AND EXTRACT(DAY FROM CURRENT_DATE) + 3
    AND le.event_date < CURRENT_DATE
  ORDER BY le.event_date;
$$;
