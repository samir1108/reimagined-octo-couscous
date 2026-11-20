
-- Karma event log
CREATE TABLE IF NOT EXISTS public.karma_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_karma_events_user_created
  ON public.karma_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_karma_events_user_source_created
  ON public.karma_events(user_id, source, created_at DESC);

ALTER TABLE public.karma_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own karma events" ON public.karma_events;
CREATE POLICY "Users view their own karma events"
  ON public.karma_events FOR SELECT
  USING (auth.uid() = user_id);

-- Broad karma awarder (separate from rare 'award_karma' breakthrough function)
CREATE OR REPLACE FUNCTION public.award_karma_event(
  p_source text,
  p_base integer DEFAULT 1,
  p_weight numeric DEFAULT 1.0,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_award integer;
  v_throttle interval;
  v_recent timestamptz;
  v_new_points integer;
  v_new_lifetime integer;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Cap base to a reasonable range
  v_award := LEAST(25, GREATEST(1, ROUND(p_base * COALESCE(p_weight, 1.0))::int));

  -- Per-source throttle (anti-spam)
  v_throttle := CASE p_source
    WHEN 'app_open'         THEN interval '6 hours'
    WHEN 'ai_chat'          THEN interval '90 seconds'
    WHEN 'mood_pulse'       THEN interval '2 hours'
    WHEN 'journal_entry'    THEN interval '15 minutes'
    WHEN 'practice_complete' THEN interval '5 minutes'
    WHEN 'session_complete'  THEN interval '5 minutes'
    WHEN 'guru_session'      THEN interval '5 minutes'
    WHEN 'witness_session'   THEN interval '5 minutes'
    WHEN 'observation_task'  THEN interval '5 minutes'
    WHEN 'daily_task'        THEN interval '5 minutes'
    WHEN 'evening_reflection' THEN interval '4 hours'
    WHEN 'gratitude_logged'  THEN interval '2 hours'
    WHEN 'sankalpa_set'      THEN interval '12 hours'
    WHEN 'dream_logged'      THEN interval '4 hours'
    ELSE interval '60 seconds'
  END;

  SELECT created_at INTO v_recent
  FROM public.karma_events
  WHERE user_id = v_user AND source = p_source
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_recent IS NOT NULL AND v_recent > now() - v_throttle THEN
    RETURN jsonb_build_object(
      'awarded', 0,
      'reason', 'throttled',
      'next_eligible_at', v_recent + v_throttle
    );
  END IF;

  -- Ensure karma row exists
  INSERT INTO public.user_karma (user_id, points, lifetime_points)
  VALUES (v_user, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.user_karma
  SET points = points + v_award,
      lifetime_points = lifetime_points + v_award,
      last_event_at = now(),
      updated_at = now()
  WHERE user_id = v_user
  RETURNING points, lifetime_points INTO v_new_points, v_new_lifetime;

  INSERT INTO public.karma_events (user_id, source, points, metadata)
  VALUES (v_user, p_source, v_award, COALESCE(p_metadata, '{}'::jsonb));

  RETURN jsonb_build_object(
    'awarded', v_award,
    'points', v_new_points,
    'lifetime_points', v_new_lifetime,
    'source', p_source
  );
END;
$$;
