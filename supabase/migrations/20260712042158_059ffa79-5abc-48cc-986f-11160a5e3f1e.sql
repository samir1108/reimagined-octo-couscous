
ALTER TABLE public.daily_rituals ADD COLUMN IF NOT EXISTS user_engaged_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.find_anniversary_moments(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  id UUID,
  moment_type TEXT,
  title TEXT,
  user_words TEXT,
  occurred_at TIMESTAMPTZ,
  years_ago NUMERIC,
  months_ago NUMERIC,
  importance INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    sm.id, sm.moment_type, sm.title, sm.user_words, sm.occurred_at,
    ROUND(EXTRACT(EPOCH FROM (p_date::timestamptz - sm.occurred_at)) / 86400 / 365.25, 2) AS years_ago,
    ROUND(EXTRACT(EPOCH FROM (p_date::timestamptz - sm.occurred_at)) / 86400 / 30.44, 2) AS months_ago,
    sm.importance
  FROM public.sacred_moments sm
  WHERE sm.user_id = p_user_id
    AND sm.occurred_at < (p_date - INTERVAL '25 days')::timestamptz
    AND (
      EXTRACT(MONTH FROM sm.occurred_at) = EXTRACT(MONTH FROM p_date)
      AND EXTRACT(DAY FROM sm.occurred_at) BETWEEN EXTRACT(DAY FROM p_date) - 3 AND EXTRACT(DAY FROM p_date) + 3
    )
  ORDER BY sm.importance DESC, sm.occurred_at DESC
  LIMIT 5;
$$;
