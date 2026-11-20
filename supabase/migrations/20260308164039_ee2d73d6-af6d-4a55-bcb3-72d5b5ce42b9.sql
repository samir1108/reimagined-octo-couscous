
-- 1. Admin activity log for live feed
CREATE TABLE public.admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'action',
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view
CREATE POLICY "Admins view activity log"
  ON public.admin_activity_log FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Service/triggers can insert
CREATE POLICY "Service inserts activity"
  ON public.admin_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enable realtime for live feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;

-- 2. User health scores table
CREATE TABLE public.user_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  engagement_score NUMERIC NOT NULL DEFAULT 0,
  churn_risk NUMERIC NOT NULL DEFAULT 0,
  health_score NUMERIC NOT NULL DEFAULT 50,
  risk_level TEXT NOT NULL DEFAULT 'healthy',
  risk_factors JSONB DEFAULT '[]'::jsonb,
  last_active_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view health scores"
  ON public.user_health_scores FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Service upserts health scores"
  ON public.user_health_scores FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 3. Function to compute health scores for all users
CREATE OR REPLACE FUNCTION public.compute_user_health_scores()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer := 0;
  r RECORD;
  eng_score numeric;
  c_risk numeric;
  h_score numeric;
  r_level text;
  r_factors jsonb;
  last_act timestamptz;
  days_inactive numeric;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  FOR r IN SELECT p.user_id, p.created_at as joined_at FROM profiles p
  LOOP
    -- Last activity
    SELECT MAX(s.created_at) INTO last_act
    FROM sessions s WHERE s.user_id = r.user_id;
    
    days_inactive := COALESCE(EXTRACT(EPOCH FROM (now() - COALESCE(last_act, r.joined_at))) / 86400, 999);
    
    -- Engagement score (0-100): sessions + journals + tasks + streak
    SELECT LEAST(100, (
      COALESCE((SELECT count(*) FROM sessions WHERE user_id = r.user_id AND session_date > CURRENT_DATE - 30), 0) * 3 +
      COALESCE((SELECT count(*) FROM journal_entries WHERE user_id = r.user_id AND created_at > now() - interval '30 days'), 0) * 5 +
      COALESCE((SELECT count(*) FROM daily_tasks WHERE user_id = r.user_id AND status = 'completed' AND task_date > CURRENT_DATE - 30), 0) * 2 +
      COALESCE((SELECT streak_current FROM user_consciousness_profile WHERE user_id = r.user_id), 0) * 2
    )) INTO eng_score;
    
    -- Churn risk (0-100)
    c_risk := LEAST(100, GREATEST(0,
      CASE
        WHEN days_inactive > 30 THEN 95
        WHEN days_inactive > 14 THEN 75
        WHEN days_inactive > 7 THEN 50
        WHEN days_inactive > 3 THEN 25
        ELSE GREATEST(0, 15 - eng_score * 0.15)
      END
    ));
    
    -- Health score (0-100) 
    h_score := GREATEST(0, LEAST(100, eng_score * 0.6 + (100 - c_risk) * 0.4));
    
    -- Risk level
    r_level := CASE
      WHEN c_risk >= 75 THEN 'critical'
      WHEN c_risk >= 50 THEN 'at_risk'
      WHEN c_risk >= 25 THEN 'warning'
      ELSE 'healthy'
    END;
    
    -- Risk factors
    r_factors := '[]'::jsonb;
    IF days_inactive > 7 THEN
      r_factors := r_factors || jsonb_build_array(jsonb_build_object('factor', 'inactive', 'days', round(days_inactive)));
    END IF;
    IF eng_score < 20 THEN
      r_factors := r_factors || jsonb_build_array(jsonb_build_object('factor', 'low_engagement', 'score', eng_score));
    END IF;
    
    INSERT INTO user_health_scores (user_id, engagement_score, churn_risk, health_score, risk_level, risk_factors, last_active_at, computed_at)
    VALUES (r.user_id, eng_score, c_risk, h_score, r_level, r_factors, last_act, now())
    ON CONFLICT (user_id) DO UPDATE SET
      engagement_score = EXCLUDED.engagement_score,
      churn_risk = EXCLUDED.churn_risk,
      health_score = EXCLUDED.health_score,
      risk_level = EXCLUDED.risk_level,
      risk_factors = EXCLUDED.risk_factors,
      last_active_at = EXCLUDED.last_active_at,
      computed_at = now();
    
    affected := affected + 1;
  END LOOP;
  
  RETURN affected;
END;
$$;

-- 4. Function to log user activity (to be called from edge functions/triggers)
CREATE OR REPLACE FUNCTION public.log_user_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_activity_log (user_id, event_type, event_name, metadata)
  VALUES (
    COALESCE(NEW.user_id, auth.uid()),
    TG_ARGV[0],
    TG_ARGV[1],
    jsonb_build_object('table', TG_TABLE_NAME, 'id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Don't fail the original operation
END;
$$;

-- 5. Attach activity logging triggers
CREATE TRIGGER log_session_activity
  AFTER INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity('session', 'session_started');

CREATE TRIGGER log_journal_activity
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity('journal', 'journal_created');

CREATE TRIGGER log_task_complete_activity
  AFTER UPDATE ON daily_tasks
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION log_user_activity('task', 'task_completed');

CREATE TRIGGER log_signup_activity
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_activity('auth', 'user_signed_up');

-- 6. Get activity feed function
CREATE OR REPLACE FUNCTION public.get_admin_activity_feed(p_limit int DEFAULT 50)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    SELECT a.id, a.event_type, a.event_name, a.metadata, a.created_at,
      p.display_name, p.avatar_url
    FROM admin_activity_log a
    LEFT JOIN profiles p ON p.user_id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit
  ) t;

  RETURN result;
END;
$$;

-- 7. Get health scores summary
CREATE OR REPLACE FUNCTION public.get_admin_health_overview()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_scored', (SELECT count(*) FROM user_health_scores),
    'healthy', (SELECT count(*) FROM user_health_scores WHERE risk_level = 'healthy'),
    'warning', (SELECT count(*) FROM user_health_scores WHERE risk_level = 'warning'),
    'at_risk', (SELECT count(*) FROM user_health_scores WHERE risk_level = 'at_risk'),
    'critical', (SELECT count(*) FROM user_health_scores WHERE risk_level = 'critical'),
    'avg_engagement', (SELECT COALESCE(round(avg(engagement_score)::numeric, 1), 0) FROM user_health_scores),
    'avg_churn_risk', (SELECT COALESCE(round(avg(churn_risk)::numeric, 1), 0) FROM user_health_scores),
    'at_risk_users', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT h.user_id, h.health_score, h.churn_risk, h.risk_level, h.risk_factors, h.last_active_at,
          p.display_name, p.avatar_url
        FROM user_health_scores h
        JOIN profiles p ON p.user_id = h.user_id
        WHERE h.risk_level IN ('at_risk', 'critical')
        ORDER BY h.churn_risk DESC
        LIMIT 20
      ) t
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- 8. Get user timeline
CREATE OR REPLACE FUNCTION public.get_admin_user_timeline(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO result
  FROM (
    -- Signup
    SELECT 'signup' as event_type, 'Joined ConsciousOS' as event_name, created_at, '{}'::jsonb as metadata
    FROM profiles WHERE user_id = p_user_id
    UNION ALL
    -- Sessions
    SELECT 'session', 'Session: ' || type, created_at, jsonb_build_object('time_slot', time_slot, 'status', status)
    FROM sessions WHERE user_id = p_user_id
    UNION ALL
    -- Journal entries
    SELECT 'journal', 'Journal: ' || COALESCE(title, 'Untitled'), created_at, jsonb_build_object('mood', mood)
    FROM journal_entries WHERE user_id = p_user_id
    UNION ALL
    -- Tasks completed
    SELECT 'task', 'Completed: ' || title, completed_at, jsonb_build_object('domain', domain)
    FROM daily_tasks WHERE user_id = p_user_id AND status = 'completed' AND completed_at IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 100
  ) t;

  RETURN result;
END;
$$;
