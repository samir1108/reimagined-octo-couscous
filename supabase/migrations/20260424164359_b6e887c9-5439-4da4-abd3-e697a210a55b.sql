-- 1. Reset all karma data
TRUNCATE TABLE public.karma_events;

UPDATE public.user_karma
SET points = 0,
    lifetime_points = 0,
    current_tier = 'seeker',
    breakthroughs = '{}'::jsonb,
    last_event_at = NULL;

-- 2. Add cap-tracking columns
ALTER TABLE public.user_karma
  ADD COLUMN IF NOT EXISTS today_event_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS week_event_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_event_date date,
  ADD COLUMN IF NOT EXISTS week_anchor_date date;

-- 3. Karma verification log table
CREATE TABLE IF NOT EXISTS public.karma_verification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_text text,
  source_type text,
  source_id uuid,
  verified boolean NOT NULL DEFAULT false,
  breakthrough_id text,
  rarity text,
  reasoning text,
  ai_model text,
  awarded integer NOT NULL DEFAULT 0,
  reject_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.karma_verification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification log"
  ON public.karma_verification_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can view all verification logs"
  ON public.karma_verification_log FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_karma_verification_log_user_created
  ON public.karma_verification_log(user_id, created_at DESC);

-- 4. New sacred award_karma function
CREATE OR REPLACE FUNCTION public.award_karma(
  p_source text,
  p_base integer DEFAULT 10,
  p_weight numeric DEFAULT 1.0,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_award integer;
  v_prev integer;
  v_new integer;
  v_tier text;
  v_breakthroughs jsonb;
  v_today date := CURRENT_DATE;
  v_week_start date := date_trunc('week', CURRENT_DATE)::date;
  v_today_count integer;
  v_week_count integer;
  v_last_date date;
  v_week_anchor date;
  v_bt_id text;
  v_last_bt_at timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- ALLOWLIST: only two sources earn karma now.
  IF p_source NOT IN ('breakthrough_verified', 'weekly_integration') THEN
    RETURN jsonb_build_object(
      'awarded', 0,
      'reason', 'source_not_eligible',
      'source', p_source
    );
  END IF;

  -- Award amount: trust the caller's base (server-side verifier sets it from rarity).
  -- Cap at 50 to prevent runaway values.
  v_award := LEAST(50, GREATEST(1, ROUND(p_base * COALESCE(p_weight, 1.0))::int));

  -- Ensure row exists
  INSERT INTO public.user_karma (user_id, points, lifetime_points)
  VALUES (v_user, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT points, breakthroughs, today_event_count, week_event_count, last_event_date, week_anchor_date
    INTO v_prev, v_breakthroughs, v_today_count, v_week_count, v_last_date, v_week_anchor
  FROM public.user_karma WHERE user_id = v_user FOR UPDATE;

  -- Roll daily counter
  IF v_last_date IS DISTINCT FROM v_today THEN
    v_today_count := 0;
  END IF;

  -- Roll weekly counter
  IF v_week_anchor IS DISTINCT FROM v_week_start THEN
    v_week_count := 0;
  END IF;

  -- DAILY CAP: 1 karma event per day
  IF v_today_count >= 1 THEN
    RETURN jsonb_build_object('awarded', 0, 'reason', 'daily_cap_reached', 'cap', 1);
  END IF;

  -- WEEKLY CAP: 3 karma events per week
  IF v_week_count >= 3 THEN
    RETURN jsonb_build_object('awarded', 0, 'reason', 'weekly_cap_reached', 'cap', 3);
  END IF;

  -- Per-breakthrough cooldown (30 days)
  v_bt_id := p_metadata->>'breakthrough_id';
  IF v_bt_id IS NOT NULL THEN
    v_last_bt_at := (v_breakthroughs->v_bt_id->>'at')::timestamptz;
    IF v_last_bt_at IS NOT NULL AND v_last_bt_at > now() - interval '30 days' THEN
      RETURN jsonb_build_object(
        'awarded', 0,
        'reason', 'breakthrough_cooldown',
        'breakthrough_id', v_bt_id,
        'next_eligible_at', v_last_bt_at + interval '30 days'
      );
    END IF;
  END IF;

  v_new := v_prev + v_award;

  -- Record breakthrough seen
  IF v_bt_id IS NOT NULL THEN
    v_breakthroughs := COALESCE(v_breakthroughs, '{}'::jsonb)
      || jsonb_build_object(v_bt_id, jsonb_build_object('at', now(), 'points', v_award));
  END IF;

  -- New tier thresholds (lifetime-based, scaled to scarcity)
  v_tier := CASE
    WHEN v_new >= 300 THEN 'sage'
    WHEN v_new >= 150 THEN 'adept'
    WHEN v_new >= 75  THEN 'practitioner'
    WHEN v_new >= 30  THEN 'seeker_plus'
    ELSE 'seeker'
  END;

  UPDATE public.user_karma
  SET points = v_new,
      lifetime_points = lifetime_points + v_award,
      current_tier = v_tier,
      breakthroughs = v_breakthroughs,
      last_event_at = now(),
      today_event_count = v_today_count + 1,
      week_event_count = v_week_count + 1,
      last_event_date = v_today,
      week_anchor_date = v_week_start
  WHERE user_id = v_user;

  INSERT INTO public.karma_events (user_id, source, base_points, weight, awarded, metadata)
  VALUES (v_user, p_source, p_base, p_weight, v_award, COALESCE(p_metadata, '{}'::jsonb));

  RETURN jsonb_build_object(
    'awarded', v_award,
    'points', v_new,
    'tier', v_tier,
    'today_count', v_today_count + 1,
    'week_count', v_week_count + 1
  );
END;
$function$;