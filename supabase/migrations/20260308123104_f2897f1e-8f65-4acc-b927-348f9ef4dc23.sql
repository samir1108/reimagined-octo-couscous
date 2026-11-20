
-- Wellness Challenges
CREATE TABLE public.wellness_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  challenge_type TEXT NOT NULL DEFAULT 'streak',
  target_value INTEGER NOT NULL DEFAULT 7,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  created_by UUID,
  status TEXT NOT NULL DEFAULT 'active',
  rewards_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view challenges" ON public.wellness_challenges
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = wellness_challenges.org_id AND om.user_id = auth.uid() AND om.status = 'active')
  );

CREATE POLICY "Admins create challenges" ON public.wellness_challenges
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = wellness_challenges.org_id AND om.user_id = auth.uid() AND om.role IN ('admin', 'manager') AND om.status = 'active')
  );

CREATE POLICY "Admins update challenges" ON public.wellness_challenges
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = wellness_challenges.org_id AND om.user_id = auth.uid() AND om.role IN ('admin', 'manager') AND om.status = 'active')
  );

-- Challenge Participants
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.wellness_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members view participants" ON public.challenge_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wellness_challenges wc
      JOIN org_members om ON om.org_id = wc.org_id
      WHERE wc.id = challenge_participants.challenge_id AND om.user_id = auth.uid() AND om.status = 'active'
    )
  );

CREATE POLICY "Users join challenges" ON public.challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own participation" ON public.challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Mood Pulses (anonymous)
CREATE TABLE public.mood_pulses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL DEFAULT 3,
  energy_score INTEGER NOT NULL DEFAULT 3,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own mood" ON public.mood_pulses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own mood" ON public.mood_pulses
  FOR SELECT USING (auth.uid() = user_id);

-- Aggregated mood function for managers (no individual data exposed)
CREATE OR REPLACE FUNCTION public.get_team_mood_trends(p_org_id UUID, p_team_id UUID DEFAULT NULL, p_days INTEGER DEFAULT 30)
RETURNS TABLE(pulse_date DATE, avg_mood NUMERIC, avg_energy NUMERIC, response_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    DATE(mp.created_at) as pulse_date,
    ROUND(AVG(mp.mood_score)::numeric, 1) as avg_mood,
    ROUND(AVG(mp.energy_score)::numeric, 1) as avg_energy,
    COUNT(*) as response_count
  FROM mood_pulses mp
  JOIN org_members om ON om.user_id = mp.user_id AND om.org_id = mp.org_id
  WHERE mp.org_id = p_org_id
    AND mp.created_at > now() - (p_days || ' days')::interval
    AND (p_team_id IS NULL OR om.team_id = p_team_id)
  GROUP BY DATE(mp.created_at)
  HAVING COUNT(*) >= 3
  ORDER BY pulse_date DESC;
$$;

-- Manager Coaching Notes
CREATE TABLE public.manager_coaching_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  ai_talking_points JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.manager_coaching_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers view own coaching notes" ON public.manager_coaching_notes
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Managers insert coaching notes" ON public.manager_coaching_notes
  FOR INSERT WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers update own coaching notes" ON public.manager_coaching_notes
  FOR UPDATE USING (auth.uid() = manager_id);

-- Quarterly Reports
CREATE TABLE public.org_quarterly_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quarter INTEGER NOT NULL,
  year INTEGER NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_quarterly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins view quarterly reports" ON public.org_quarterly_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = org_quarterly_reports.org_id AND om.user_id = auth.uid() AND om.role IN ('admin', 'manager') AND om.status = 'active')
  );

CREATE POLICY "Admins insert quarterly reports" ON public.org_quarterly_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM org_members om WHERE om.org_id = org_quarterly_reports.org_id AND om.user_id = auth.uid() AND om.role IN ('admin', 'manager') AND om.status = 'active')
  );
