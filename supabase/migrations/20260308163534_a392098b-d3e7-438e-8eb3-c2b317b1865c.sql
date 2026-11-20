
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Create is_admin shortcut
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 6. RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Seed admin role for samirsourav44@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'samirsourav44@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 8. Create admin stats functions (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
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
    'total_users', (SELECT count(*) FROM public.profiles),
    'onboarded_users', (SELECT count(*) FROM public.profiles WHERE onboarded = true),
    'total_sessions', (SELECT count(*) FROM public.sessions),
    'total_journals', (SELECT count(*) FROM public.journal_entries),
    'total_tasks', (SELECT count(*) FROM public.daily_tasks),
    'completed_tasks', (SELECT count(*) FROM public.daily_tasks WHERE status = 'completed'),
    'total_memories', (SELECT count(*) FROM public.guru_memory),
    'total_orgs', (SELECT count(*) FROM public.organizations),
    'active_challenges', (SELECT count(*) FROM public.wellness_challenges WHERE status = 'active'),
    'avg_consciousness_band', (SELECT COALESCE(round(avg(overall_band)::numeric, 2), 0) FROM public.user_consciousness_profile),
    'sessions_today', (SELECT count(*) FROM public.sessions WHERE session_date = CURRENT_DATE),
    'signups_last_30_days', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT date_trunc('day', created_at)::date as signup_date, count(*) as count
        FROM public.profiles
        WHERE created_at > now() - interval '30 days'
        GROUP BY date_trunc('day', created_at)::date
        ORDER BY signup_date
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 9. Admin function to list all users with their profiles
CREATE OR REPLACE FUNCTION public.get_admin_users(p_search text DEFAULT '', p_limit int DEFAULT 50, p_offset int DEFAULT 0)
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
    'users', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          p.id, p.user_id, p.display_name, p.avatar_url, p.onboarded, p.created_at,
          ucp.overall_band, ucp.journey_phase, ucp.journey_day, ucp.streak_current,
          ucp.total_sessions, ucp.total_journal_entries, ucp.v_level_current
        FROM public.profiles p
        LEFT JOIN public.user_consciousness_profile ucp ON ucp.user_id = p.user_id
        WHERE p_search = '' OR p.display_name ILIKE '%' || p_search || '%'
        ORDER BY p.created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) t
    ), '[]'::json),
    'total', (
      SELECT count(*) FROM public.profiles
      WHERE p_search = '' OR display_name ILIKE '%' || p_search || '%'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- 10. Admin function to get single user detail
CREATE OR REPLACE FUNCTION public.get_admin_user_detail(p_user_id uuid)
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
    'profile', (SELECT row_to_json(p) FROM public.profiles p WHERE p.user_id = p_user_id),
    'consciousness', (SELECT row_to_json(c) FROM public.user_consciousness_profile c WHERE c.user_id = p_user_id),
    'psyche', (SELECT row_to_json(ps) FROM public.user_psyche_profile ps WHERE ps.user_id = p_user_id),
    'loops', COALESCE((SELECT json_agg(row_to_json(l)) FROM public.user_loops l WHERE l.user_id = p_user_id), '[]'::json),
    'samskaras', COALESCE((SELECT json_agg(row_to_json(s)) FROM public.user_samskaras s WHERE s.user_id = p_user_id), '[]'::json),
    'recent_sessions', COALESCE((
      SELECT json_agg(row_to_json(s))
      FROM (SELECT * FROM public.sessions WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 20) s
    ), '[]'::json),
    'recent_journals', COALESCE((
      SELECT json_agg(row_to_json(j))
      FROM (SELECT id, title, mood, created_at FROM public.journal_entries WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 20) j
    ), '[]'::json),
    'memories_count', (SELECT count(*) FROM public.guru_memory WHERE user_id = p_user_id),
    'org_memberships', COALESCE((
      SELECT json_agg(json_build_object('org_name', o.name, 'role', om.role, 'status', om.status))
      FROM public.org_members om JOIN public.organizations o ON o.id = om.org_id
      WHERE om.user_id = p_user_id
    ), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$$;

-- 11. Admin analytics function
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
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
    'band_distribution', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          CASE 
            WHEN overall_band < 2 THEN '0-2'
            WHEN overall_band < 4 THEN '2-4'
            WHEN overall_band < 6 THEN '4-6'
            WHEN overall_band < 8 THEN '6-8'
            ELSE '8-10'
          END as band_range,
          count(*) as user_count
        FROM public.user_consciousness_profile
        GROUP BY band_range
        ORDER BY band_range
      ) t
    ), '[]'::json),
    'session_trends', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT session_date, count(*) as session_count
        FROM public.sessions
        WHERE session_date > CURRENT_DATE - 30
        GROUP BY session_date
        ORDER BY session_date
      ) t
    ), '[]'::json),
    'top_loops', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT loop_id, count(*) as user_count
        FROM public.user_loops
        WHERE status = 'active'
        GROUP BY loop_id
        ORDER BY user_count DESC
        LIMIT 10
      ) t
    ), '[]'::json),
    'orgs_summary', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT o.id, o.name, o.slug, o.created_at,
          (SELECT count(*) FROM public.org_members om WHERE om.org_id = o.id AND om.status = 'active') as member_count,
          (SELECT count(*) FROM public.wellness_challenges wc WHERE wc.org_id = o.id AND wc.status = 'active') as active_challenges
        FROM public.organizations o
        ORDER BY o.created_at DESC
      ) t
    ), '[]'::json),
    'retention_7d', (SELECT count(*) FROM public.sessions WHERE session_date > CURRENT_DATE - 7),
    'retention_30d', (SELECT count(DISTINCT user_id) FROM public.sessions WHERE session_date > CURRENT_DATE - 30),
    'retention_90d', (SELECT count(DISTINCT user_id) FROM public.sessions WHERE session_date > CURRENT_DATE - 90)
  ) INTO result;

  RETURN result;
END;
$$;
