
DROP FUNCTION IF EXISTS public.is_org_member(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_circle_member(uuid, uuid) CASCADE;

ALTER TABLE public.org_members ADD COLUMN IF NOT EXISTS department TEXT;
CREATE INDEX IF NOT EXISTS org_members_org_dept ON public.org_members (org_id, department);

CREATE TABLE IF NOT EXISTS public.workplace_loop_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department TEXT,
  loop_id TEXT NOT NULL,
  loop_name TEXT NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  context TEXT NOT NULL DEFAULT 'work' CHECK (context IN ('work','personal')),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wll_org_loop_date ON public.workplace_loop_logs (org_id, loop_id, log_date);
CREATE INDEX IF NOT EXISTS wll_user_date ON public.workplace_loop_logs (user_id, log_date);
ALTER TABLE public.workplace_loop_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own loop logs" ON public.workplace_loop_logs;
CREATE POLICY "Users insert own loop logs" ON public.workplace_loop_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own loop logs" ON public.workplace_loop_logs;
CREATE POLICY "Users view own loop logs" ON public.workplace_loop_logs FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.peer_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  theme TEXT,
  band_min INTEGER NOT NULL DEFAULT 0,
  band_max INTEGER NOT NULL DEFAULT 10,
  max_members INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peer_circles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.peer_circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_handle TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);
ALTER TABLE public.peer_circle_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.peer_circle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.peer_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_handle TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.peer_circle_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS pcm_circle_created ON public.peer_circle_messages (circle_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.peer_circle_members WHERE circle_id = _circle_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = _org_id AND user_id = _user_id AND status = 'active');
$$;

DROP POLICY IF EXISTS "Org members can view circles in their org" ON public.peer_circles;
CREATE POLICY "Org members can view circles in their org" ON public.peer_circles FOR SELECT USING (public.is_org_member(org_id, auth.uid()));
DROP POLICY IF EXISTS "Org members can create circles" ON public.peer_circles;
CREATE POLICY "Org members can create circles" ON public.peer_circles FOR INSERT WITH CHECK (public.is_org_member(org_id, auth.uid()));

DROP POLICY IF EXISTS "Members can view own circle membership" ON public.peer_circle_members;
CREATE POLICY "Members can view own circle membership" ON public.peer_circle_members FOR SELECT USING (auth.uid() = user_id OR public.is_circle_member(circle_id, auth.uid()));
DROP POLICY IF EXISTS "Users can join circles" ON public.peer_circle_members;
CREATE POLICY "Users can join circles" ON public.peer_circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave circles" ON public.peer_circle_members;
CREATE POLICY "Users can leave circles" ON public.peer_circle_members FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Circle members read messages" ON public.peer_circle_messages;
CREATE POLICY "Circle members read messages" ON public.peer_circle_messages FOR SELECT USING (public.is_circle_member(circle_id, auth.uid()));
DROP POLICY IF EXISTS "Circle members post messages" ON public.peer_circle_messages;
CREATE POLICY "Circle members post messages" ON public.peer_circle_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_circle_member(circle_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.org_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  duration_days INTEGER NOT NULL DEFAULT 21,
  daily_practices JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_by_ai BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','archived')),
  starts_on DATE,
  ends_on DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.org_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members view programs" ON public.org_programs;
CREATE POLICY "Org members view programs" ON public.org_programs FOR SELECT USING (public.is_org_member(org_id, auth.uid()));
DROP POLICY IF EXISTS "Admins/managers create programs" ON public.org_programs;
CREATE POLICY "Admins/managers create programs" ON public.org_programs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.org_members WHERE org_id = org_programs.org_id AND user_id = auth.uid() AND role IN ('admin','manager') AND status = 'active'));
DROP POLICY IF EXISTS "Admins/managers update programs" ON public.org_programs;
CREATE POLICY "Admins/managers update programs" ON public.org_programs FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.org_members WHERE org_id = org_programs.org_id AND user_id = auth.uid() AND role IN ('admin','manager') AND status = 'active'));

CREATE TABLE IF NOT EXISTS public.org_program_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.org_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  days_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE (program_id, user_id)
);
ALTER TABLE public.org_program_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own participation" ON public.org_program_participants;
CREATE POLICY "Users see own participation" ON public.org_program_participants FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users join programs" ON public.org_program_participants;
CREATE POLICY "Users join programs" ON public.org_program_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own progress" ON public.org_program_participants;
CREATE POLICY "Users update own progress" ON public.org_program_participants FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.org_consciousness_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_month DATE NOT NULL,
  consciousness_index NUMERIC(6,2),
  active_members INTEGER NOT NULL DEFAULT 0,
  avg_band NUMERIC(4,2),
  avg_streak NUMERIC(5,2),
  burnout_risk_pct NUMERIC(5,2),
  retention_risk_pct NUMERIC(5,2),
  band_distribution JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, snapshot_month)
);
ALTER TABLE public.org_consciousness_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins/managers view snapshots" ON public.org_consciousness_snapshots;
CREATE POLICY "Admins/managers view snapshots" ON public.org_consciousness_snapshots FOR SELECT
USING (EXISTS (SELECT 1 FROM public.org_members WHERE org_id = org_consciousness_snapshots.org_id AND user_id = auth.uid() AND role IN ('admin','manager') AND status = 'active'));

CREATE OR REPLACE FUNCTION public.get_org_loop_epidemiology(_org_id UUID, _days INTEGER DEFAULT 30)
RETURNS TABLE (loop_id TEXT, loop_name TEXT, user_count INTEGER, occurrences INTEGER, avg_intensity NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.loop_id, MAX(l.loop_name) AS loop_name,
    COUNT(DISTINCT l.user_id)::int AS user_count,
    COUNT(*)::int AS occurrences,
    ROUND(AVG(l.intensity)::numeric, 2) AS avg_intensity
  FROM public.workplace_loop_logs l
  WHERE l.org_id = _org_id
    AND l.log_date >= (CURRENT_DATE - _days)
    AND EXISTS (SELECT 1 FROM public.org_members m WHERE m.org_id = _org_id AND m.user_id = auth.uid() AND m.role IN ('admin','manager') AND m.status = 'active')
  GROUP BY l.loop_id
  HAVING COUNT(DISTINCT l.user_id) >= 5
  ORDER BY user_count DESC, occurrences DESC
  LIMIT 25;
$$;

CREATE OR REPLACE FUNCTION public.get_org_department_pulse(_org_id UUID, _days INTEGER DEFAULT 7)
RETURNS TABLE (department TEXT, user_count INTEGER, avg_mood NUMERIC, avg_energy NUMERIC, sufficient BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE(m.department, 'Unassigned') AS department,
    COUNT(DISTINCT p.user_id)::int,
    CASE WHEN COUNT(DISTINCT p.user_id) >= 5 THEN ROUND(AVG(p.mood_score)::numeric, 2) ELSE NULL END,
    CASE WHEN COUNT(DISTINCT p.user_id) >= 5 THEN ROUND(AVG(p.energy_score)::numeric, 2) ELSE NULL END,
    (COUNT(DISTINCT p.user_id) >= 5)
  FROM public.mood_pulses p
  JOIN public.org_members m ON m.org_id = p.org_id AND m.user_id = p.user_id
  WHERE p.org_id = _org_id AND p.context = 'work'
    AND p.pulse_date >= (CURRENT_DATE - _days)
    AND EXISTS (SELECT 1 FROM public.org_members mm WHERE mm.org_id = _org_id AND mm.user_id = auth.uid() AND mm.role IN ('admin','manager') AND mm.status = 'active')
  GROUP BY COALESCE(m.department, 'Unassigned');
$$;

CREATE OR REPLACE FUNCTION public.get_org_consciousness_history(_org_id UUID)
RETURNS TABLE (snapshot_month DATE, consciousness_index NUMERIC, active_members INTEGER, avg_band NUMERIC, burnout_risk_pct NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.snapshot_month, s.consciousness_index, s.active_members, s.avg_band, s.burnout_risk_pct
  FROM public.org_consciousness_snapshots s
  WHERE s.org_id = _org_id
    AND EXISTS (SELECT 1 FROM public.org_members m WHERE m.org_id = _org_id AND m.user_id = auth.uid() AND m.role IN ('admin','manager') AND m.status = 'active')
  ORDER BY s.snapshot_month DESC LIMIT 12;
$$;
