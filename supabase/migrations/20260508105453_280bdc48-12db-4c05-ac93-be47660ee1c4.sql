-- ===== ENTERPRISE PRIVACY HARDENING + AGGREGATION (n>=5 floor) =====

-- 1. Add work/personal context to mood pulses (dual identity)
ALTER TABLE public.mood_pulses
  ADD COLUMN IF NOT EXISTS context text NOT NULL DEFAULT 'work'
    CHECK (context IN ('work', 'personal')),
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pulse_date date NOT NULL DEFAULT CURRENT_DATE;

-- One pulse per user/day/context (idempotent — replace earlier in day)
CREATE UNIQUE INDEX IF NOT EXISTS mood_pulses_unique_daily
  ON public.mood_pulses(user_id, pulse_date, context);

CREATE INDEX IF NOT EXISTS mood_pulses_org_team_date
  ON public.mood_pulses(org_id, team_id, pulse_date);

-- 2. CRITICAL: Remove admin direct read of individual pulses (privacy violation)
DROP POLICY IF EXISTS "Org admins view mood pulses" ON public.mood_pulses;

-- 3. Keep: users insert/view their own; that's it. All admin/manager access goes
--    through SECURITY DEFINER aggregators with n>=5 floor below.

-- 4. Privacy floor constant + aggregator functions
CREATE OR REPLACE FUNCTION public.org_min_cohort()
RETURNS integer LANGUAGE sql IMMUTABLE AS $$ SELECT 5 $$;

-- Aggregated team pulse — returns NULL fields if cohort < 5
CREATE OR REPLACE FUNCTION public.get_team_pulse_aggregate(
  _org_id uuid,
  _team_id uuid DEFAULT NULL,
  _days integer DEFAULT 7
)
RETURNS TABLE(
  pulse_date date,
  cohort_size integer,
  avg_mood numeric,
  avg_energy numeric,
  sufficient boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Caller must be admin or manager of this org
  IF NOT public.is_org_admin_or_manager(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT
    p.pulse_date,
    COUNT(DISTINCT p.user_id)::int AS cohort_size,
    CASE WHEN COUNT(DISTINCT p.user_id) >= public.org_min_cohort()
         THEN ROUND(AVG(p.mood_score)::numeric, 2) ELSE NULL END AS avg_mood,
    CASE WHEN COUNT(DISTINCT p.user_id) >= public.org_min_cohort()
         THEN ROUND(AVG(p.energy_score)::numeric, 2) ELSE NULL END AS avg_energy,
    (COUNT(DISTINCT p.user_id) >= public.org_min_cohort()) AS sufficient
  FROM public.mood_pulses p
  WHERE p.org_id = _org_id
    AND p.context = 'work'
    AND (_team_id IS NULL OR p.team_id = _team_id)
    AND p.pulse_date >= CURRENT_DATE - (_days - 1)
  GROUP BY p.pulse_date
  ORDER BY p.pulse_date DESC;
END;
$$;

-- Org-wide consciousness index (composite signal, n>=5)
CREATE OR REPLACE FUNCTION public.get_org_consciousness_snapshot(_org_id uuid)
RETURNS TABLE(
  cohort_size integer,
  avg_mood_7d numeric,
  avg_energy_7d numeric,
  pulse_participation_pct numeric,
  total_active_members integer,
  sufficient boolean
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  active_count integer;
BEGIN
  IF NOT public.is_org_admin_or_manager(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT COUNT(*) INTO active_count
  FROM public.org_members WHERE org_id = _org_id AND status = 'active';

  RETURN QUERY
  WITH recent AS (
    SELECT user_id, mood_score, energy_score
    FROM public.mood_pulses
    WHERE org_id = _org_id
      AND context = 'work'
      AND pulse_date >= CURRENT_DATE - 6
  )
  SELECT
    COUNT(DISTINCT user_id)::int AS cohort_size,
    CASE WHEN COUNT(DISTINCT user_id) >= public.org_min_cohort()
         THEN ROUND(AVG(mood_score)::numeric, 2) ELSE NULL END,
    CASE WHEN COUNT(DISTINCT user_id) >= public.org_min_cohort()
         THEN ROUND(AVG(energy_score)::numeric, 2) ELSE NULL END,
    CASE WHEN active_count > 0 AND COUNT(DISTINCT user_id) >= public.org_min_cohort()
         THEN ROUND((COUNT(DISTINCT user_id)::numeric / active_count) * 100, 1)
         ELSE NULL END,
    active_count,
    (COUNT(DISTINCT user_id) >= public.org_min_cohort())
  FROM recent;
END;
$$;

-- Team distribution (band buckets) — also n>=5 gated
CREATE OR REPLACE FUNCTION public.get_team_mood_distribution(
  _org_id uuid,
  _team_id uuid DEFAULT NULL,
  _days integer DEFAULT 7
)
RETURNS TABLE(band text, member_count integer, sufficient boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  total integer;
BEGIN
  IF NOT public.is_org_admin_or_manager(auth.uid(), _org_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT COUNT(DISTINCT user_id) INTO total
  FROM public.mood_pulses
  WHERE org_id = _org_id AND context = 'work'
    AND (_team_id IS NULL OR team_id = _team_id)
    AND pulse_date >= CURRENT_DATE - (_days - 1);

  IF total < public.org_min_cohort() THEN
    RETURN QUERY SELECT 'insufficient'::text, 0, false;
    RETURN;
  END IF;

  RETURN QUERY
  WITH user_avg AS (
    SELECT user_id, AVG(mood_score) AS m
    FROM public.mood_pulses
    WHERE org_id = _org_id AND context = 'work'
      AND (_team_id IS NULL OR team_id = _team_id)
      AND pulse_date >= CURRENT_DATE - (_days - 1)
    GROUP BY user_id
  )
  SELECT
    CASE
      WHEN m >= 4.5 THEN 'thriving'
      WHEN m >= 3.5 THEN 'steady'
      WHEN m >= 2.5 THEN 'strained'
      ELSE 'struggling'
    END,
    COUNT(*)::int,
    true
  FROM user_avg
  GROUP BY 1;
END;
$$;

-- 5. Org weekly briefings table (AI-generated, cached weekly)
CREATE TABLE IF NOT EXISTS public.org_weekly_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  briefing_text text NOT NULL,
  data_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  cohort_size integer NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, team_id, week_start)
);

ALTER TABLE public.org_weekly_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins/managers view org briefings"
ON public.org_weekly_briefings FOR SELECT TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

-- 6. Workplace context flag in invites (already has team; add work email domain enforcement helper)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS allowed_email_domains text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS privacy_min_cohort integer NOT NULL DEFAULT 5;