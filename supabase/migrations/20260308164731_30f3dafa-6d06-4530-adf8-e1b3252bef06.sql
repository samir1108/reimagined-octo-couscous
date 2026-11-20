
-- Function to get all sessions with messages for admin AI training view
CREATE OR REPLACE FUNCTION public.get_admin_sessions(
  p_search text DEFAULT '',
  p_type text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'sessions', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          s.id, s.user_id, s.session_date, s.time_slot, s.type, s.status,
          s.started_at, s.ended_at, s.summary, s.created_at,
          p.display_name, p.avatar_url,
          (SELECT count(*) FROM session_messages sm WHERE sm.session_id = s.id) as message_count,
          EXTRACT(EPOCH FROM COALESCE(s.ended_at, now()) - s.started_at) / 60 as duration_minutes
        FROM sessions s
        LEFT JOIN profiles p ON p.user_id = s.user_id
        WHERE (p_search = '' OR p.display_name ILIKE '%' || p_search || '%' OR s.summary ILIKE '%' || p_search || '%')
          AND (p_type IS NULL OR s.type = p_type)
        ORDER BY s.created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) t
    ), '[]'::json),
    'total', (
      SELECT count(*) FROM sessions s
      LEFT JOIN profiles p ON p.user_id = s.user_id
      WHERE (p_search = '' OR p.display_name ILIKE '%' || p_search || '%' OR s.summary ILIKE '%' || p_search || '%')
        AND (p_type IS NULL OR s.type = p_type)
    )
  ) INTO result;

  RETURN result;
END;
$function$;

-- Function to get session messages for admin
CREATE OR REPLACE FUNCTION public.get_admin_session_messages(p_session_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at), '[]'::json) INTO result
  FROM (
    SELECT sm.id, sm.role, sm.content, sm.created_at
    FROM session_messages sm
    WHERE sm.session_id = p_session_id
    ORDER BY sm.created_at ASC
  ) t;

  RETURN result;
END;
$function$;

-- Function to get conversion funnel data
CREATE OR REPLACE FUNCTION public.get_admin_funnel()
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_signups', (SELECT count(*) FROM profiles),
    'onboarded', (SELECT count(*) FROM profiles WHERE onboarded = true),
    'had_first_session', (SELECT count(DISTINCT user_id) FROM sessions),
    'had_3_sessions', (SELECT count(*) FROM (SELECT user_id FROM sessions GROUP BY user_id HAVING count(*) >= 3) t),
    'had_journal', (SELECT count(DISTINCT user_id) FROM journal_entries),
    'active_7d', (SELECT count(DISTINCT user_id) FROM sessions WHERE session_date > CURRENT_DATE - 7),
    'active_30d', (SELECT count(DISTINCT user_id) FROM sessions WHERE session_date > CURRENT_DATE - 30),
    'streak_3plus', (SELECT count(*) FROM user_consciousness_profile WHERE streak_current >= 3),
    'completed_task', (SELECT count(DISTINCT user_id) FROM daily_tasks WHERE status = 'completed'),
    'band_above_3', (SELECT count(*) FROM user_consciousness_profile WHERE overall_band >= 3),
    'top_session_types', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (SELECT type, count(*) as cnt FROM sessions GROUP BY type ORDER BY cnt DESC LIMIT 5) t
    ), '[]'::json),
    'avg_session_duration_min', (
      SELECT COALESCE(round(AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60)::numeric, 1), 0)
      FROM sessions WHERE ended_at IS NOT NULL
    ),
    'sessions_per_user_avg', (
      SELECT COALESCE(round(AVG(cnt)::numeric, 1), 0)
      FROM (SELECT user_id, count(*) as cnt FROM sessions GROUP BY user_id) t
    )
  ) INTO result;

  RETURN result;
END;
$function$;
