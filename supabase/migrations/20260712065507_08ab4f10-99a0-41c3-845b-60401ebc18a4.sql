-- Only create function if user_karma table exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_karma' AND schemaname = 'public') THEN
    CREATE OR REPLACE FUNCTION public.award_karma_event(p_source text, p_base integer DEFAULT 1, p_weight numeric DEFAULT 1.0, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_award integer;
  v_throttle interval;
  v_recent timestamptz;
  v_new_points integer;
  v_new_lifetime integer;
  v_prev_lifetime integer;
  v_karma_row public.user_karma%ROWTYPE;
  v_new_breakthrough text := NULL;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_award := LEAST(25, GREATEST(1, ROUND(p_base * COALESCE(p_weight, 1.0))::int));

  v_throttle := CASE p_source
    WHEN 'app_open'          THEN interval '6 hours'
    WHEN 'ai_chat'           THEN interval '90 seconds'
    WHEN 'mood_pulse'        THEN interval '2 hours'
    WHEN 'journal_open'      THEN interval '2 hours'
    WHEN 'journal_entry'     THEN interval '15 minutes'
    WHEN 'temple_enter'      THEN interval '4 hours'
    WHEN 'practice_start'    THEN interval '30 minutes'
    WHEN 'practice_complete' THEN interval '5 minutes'
    WHEN 'session_complete'  THEN interval '5 minutes'
    WHEN 'game_complete'     THEN interval '3 minutes'
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

  INSERT INTO public.user_karma (user_id, points, lifetime_points)
  VALUES (v_user, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_karma_row FROM public.user_karma WHERE user_id = v_user;
  v_prev_lifetime := COALESCE(v_karma_row.lifetime_points, 0);

  UPDATE public.user_karma
     SET points = points + v_award,
         lifetime_points = lifetime_points + v_award,
         last_event_at = now(),
         today_event_count = CASE
           WHEN last_event_date = CURRENT_DATE THEN today_event_count + 1
           ELSE 1
         END,
         week_event_count = CASE
           WHEN week_anchor_date IS NOT NULL AND week_anchor_date > CURRENT_DATE - interval '7 days' THEN week_event_count + 1
           ELSE 1
         END,
         last_event_date = CURRENT_DATE,
         week_anchor_date = COALESCE(
           CASE WHEN week_anchor_date IS NOT NULL AND week_anchor_date > CURRENT_DATE - interval '7 days' THEN week_anchor_date END,
           CURRENT_DATE
         )
   WHERE user_id = v_user
   RETURNING points, lifetime_points INTO v_new_points, v_new_lifetime;

  IF v_prev_lifetime < 300 AND v_new_lifetime >= 300 THEN
    v_new_breakthrough := 'minor_300';
  ELSIF v_prev_lifetime < 1000 AND v_new_lifetime >= 1000 THEN
    v_new_breakthrough := 'major_1000';
  END IF;

  INSERT INTO public.karma_events (user_id, source, base_points, weight, awarded, metadata)
  VALUES (v_user, p_source, p_base, COALESCE(p_weight, 1.0), v_award, COALESCE(p_metadata, '{}'::jsonb));

  RETURN jsonb_build_object(
    'awarded', v_award,
    'points', v_new_points,
    'lifetime_points', v_new_lifetime,
    'new_breakthrough', v_new_breakthrough
  );
END;
$function$;
  END IF;
END $$;