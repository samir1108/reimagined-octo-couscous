-- USER KARMA TOTALS
CREATE TABLE IF NOT EXISTS public.user_karma (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  points integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  current_tier text NOT NULL DEFAULT 'seeker',
  breakthroughs jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_karma ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own karma"
  ON public.user_karma FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own karma"
  ON public.user_karma FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own karma"
  ON public.user_karma FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_karma_updated_at
  BEFORE UPDATE ON public.user_karma
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KARMA EVENTS LOG
CREATE TABLE IF NOT EXISTS public.karma_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  base_points integer NOT NULL DEFAULT 0,
  weight numeric NOT NULL DEFAULT 1.0,
  awarded integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.karma_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own karma events"
  ON public.karma_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own karma events"
  ON public.karma_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_karma_events_user_created
  ON public.karma_events(user_id, created_at DESC);

-- AWARD KARMA RPC
CREATE OR REPLACE FUNCTION public.award_karma(
  p_source text,
  p_base integer DEFAULT 10,
  p_weight numeric DEFAULT 1.0,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_award integer;
  v_prev integer;
  v_new integer;
  v_tier text;
  v_breakthroughs jsonb;
  v_new_breakthrough text := NULL;
  v_credit_bonus integer := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_award := GREATEST(1, ROUND(p_base * COALESCE(p_weight, 1.0))::int);

  -- Ensure row exists
  INSERT INTO public.user_karma (user_id, points, lifetime_points)
  VALUES (v_user, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT points, breakthroughs INTO v_prev, v_breakthroughs
  FROM public.user_karma WHERE user_id = v_user FOR UPDATE;

  v_new := v_prev + v_award;

  -- Detect newly crossed thresholds
  IF v_prev < 300 AND v_new >= 300 AND NOT (v_breakthroughs ? 'minor_300') THEN
    v_new_breakthrough := 'minor_300';
    v_credit_bonus := 500; -- 5 credits in paise (each credit = 100 paise)
    v_breakthroughs := v_breakthroughs || jsonb_build_object('minor_300', jsonb_build_object('at', now(), 'points', v_new));
  ELSIF v_prev < 1000 AND v_new >= 1000 AND NOT (v_breakthroughs ? 'major_1000') THEN
    v_new_breakthrough := 'major_1000';
    v_credit_bonus := 2000; -- 20 credits in paise
    v_breakthroughs := v_breakthroughs || jsonb_build_object('major_1000', jsonb_build_object('at', now(), 'points', v_new));
  END IF;

  -- Tier (cosmetic)
  v_tier := CASE
    WHEN v_new >= 5000 THEN 'sage'
    WHEN v_new >= 2500 THEN 'adept'
    WHEN v_new >= 1000 THEN 'practitioner'
    WHEN v_new >= 300  THEN 'seeker_plus'
    ELSE 'seeker'
  END;

  UPDATE public.user_karma
  SET points = v_new,
      lifetime_points = lifetime_points + v_award,
      current_tier = v_tier,
      breakthroughs = v_breakthroughs,
      last_event_at = now()
  WHERE user_id = v_user;

  INSERT INTO public.karma_events (user_id, source, base_points, weight, awarded, metadata)
  VALUES (v_user, p_source, p_base, p_weight, v_award, COALESCE(p_metadata, '{}'::jsonb));

  -- Award bonus credits if breakthrough crossed
  IF v_credit_bonus > 0 THEN
    INSERT INTO public.user_credits (user_id, balance_paise, total_purchased_paise)
    VALUES (v_user, v_credit_bonus, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET balance_paise = public.user_credits.balance_paise + v_credit_bonus;

    INSERT INTO public.credit_transactions (user_id, type, amount_paise, credits_paise, description)
    VALUES (v_user, 'bonus', 0, v_credit_bonus,
      CASE WHEN v_new_breakthrough = 'major_1000'
           THEN 'Major Breakthrough bonus: 20 credits'
           ELSE 'Minor Breakthrough bonus: 5 credits' END);
  END IF;

  RETURN jsonb_build_object(
    'awarded', v_award,
    'points', v_new,
    'tier', v_tier,
    'new_breakthrough', v_new_breakthrough,
    'credit_bonus_paise', v_credit_bonus
  );
END;
$$;