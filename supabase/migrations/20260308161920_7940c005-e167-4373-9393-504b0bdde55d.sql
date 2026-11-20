
-- Create a security definer function to check org membership without recursion
CREATE OR REPLACE FUNCTION public.is_org_member(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = p_user_id
      AND org_id = p_org_id
      AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_org_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id
  FROM public.org_members
  WHERE user_id = p_user_id
    AND status = 'active'
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin_or_manager(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = p_user_id
      AND org_id = p_org_id
      AND role IN ('admin', 'manager')
      AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_user_id uuid, p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.org_members
    WHERE user_id = p_user_id
      AND org_id = p_org_id
      AND role = 'admin'
      AND status = 'active'
  )
$$;

-- Fix org_members SELECT policy to avoid infinite recursion
DROP POLICY IF EXISTS "Org members can view other members" ON public.org_members;
CREATE POLICY "Org members can view other members"
ON public.org_members
FOR SELECT
USING (
  org_id IN (SELECT public.get_user_org_ids(auth.uid()))
);

-- Fix org_members INSERT policy 
DROP POLICY IF EXISTS "Admins can insert members" ON public.org_members;
CREATE POLICY "Admins can insert members"
ON public.org_members
FOR INSERT
WITH CHECK (
  public.is_org_admin(auth.uid(), org_id)
  OR NOT EXISTS (SELECT 1 FROM public.org_members WHERE org_id = org_members.org_id)
);

-- Fix org_members UPDATE policy
DROP POLICY IF EXISTS "Admins can update members" ON public.org_members;
CREATE POLICY "Admins can update members"
ON public.org_members
FOR UPDATE
USING (
  public.is_org_admin(auth.uid(), org_id)
);

-- Fix org_members DELETE policy
DROP POLICY IF EXISTS "Admins can delete members" ON public.org_members;
CREATE POLICY "Admins can delete members"
ON public.org_members
FOR DELETE
USING (
  public.is_org_admin(auth.uid(), org_id)
);

-- Fix sessions SELECT policy that references org_members
DROP POLICY IF EXISTS "Org admins view member sessions" ON public.sessions;
CREATE POLICY "Org admins view member sessions"
ON public.sessions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = sessions.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix evening_reflections SELECT policy
DROP POLICY IF EXISTS "Org admins view member reflections" ON public.evening_reflections;
CREATE POLICY "Org admins view member reflections"
ON public.evening_reflections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = evening_reflections.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix journal_entries SELECT policy
DROP POLICY IF EXISTS "Org admins view member journals" ON public.journal_entries;
CREATE POLICY "Org admins view member journals"
ON public.journal_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = journal_entries.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix user_consciousness_profile SELECT policy
DROP POLICY IF EXISTS "Org admins view member consciousness" ON public.user_consciousness_profile;
CREATE POLICY "Org admins view member consciousness"
ON public.user_consciousness_profile
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_consciousness_profile.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix user_loops SELECT policy
DROP POLICY IF EXISTS "Org admins view member loops" ON public.user_loops;
CREATE POLICY "Org admins view member loops"
ON public.user_loops
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_loops.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix user_psyche_profile SELECT policy
DROP POLICY IF EXISTS "Org admins view member psyche" ON public.user_psyche_profile;
CREATE POLICY "Org admins view member psyche"
ON public.user_psyche_profile
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_psyche_profile.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix organizations SELECT policy
DROP POLICY IF EXISTS "Org members can view their org" ON public.organizations;
CREATE POLICY "Org members can view their org"
ON public.organizations
FOR SELECT
USING (
  public.is_org_member(auth.uid(), id)
);

-- Fix organizations UPDATE policy
DROP POLICY IF EXISTS "Admins can update their org" ON public.organizations;
CREATE POLICY "Admins can update their org"
ON public.organizations
FOR UPDATE
USING (
  public.is_org_admin(auth.uid(), id)
);

-- Fix teams policies
DROP POLICY IF EXISTS "Org members can view teams" ON public.teams;
CREATE POLICY "Org members can view teams"
ON public.teams
FOR SELECT
USING (
  public.is_org_member(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins and managers can manage teams" ON public.teams;
CREATE POLICY "Admins and managers can manage teams"
ON public.teams
FOR INSERT
WITH CHECK (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
CREATE POLICY "Admins can update teams"
ON public.teams
FOR UPDATE
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins can delete teams" ON public.teams;
CREATE POLICY "Admins can delete teams"
ON public.teams
FOR DELETE
USING (
  public.is_org_admin(auth.uid(), org_id)
);

-- Fix enterprise_notifications policies
DROP POLICY IF EXISTS "Org admins view enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Org admins view enterprise notifications"
ON public.enterprise_notifications
FOR SELECT
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Org admins update enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Org admins update enterprise notifications"
ON public.enterprise_notifications
FOR UPDATE
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Service inserts enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Service inserts enterprise notifications"
ON public.enterprise_notifications
FOR INSERT
WITH CHECK (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

-- Fix org_invites policies
DROP POLICY IF EXISTS "Admins can create invites" ON public.org_invites;
CREATE POLICY "Admins can create invites"
ON public.org_invites
FOR INSERT
WITH CHECK (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins can view invites" ON public.org_invites;
CREATE POLICY "Admins can view invites"
ON public.org_invites
FOR SELECT
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

-- Fix org_activity_log policies
DROP POLICY IF EXISTS "Org members view activity" ON public.org_activity_log;
CREATE POLICY "Org members view activity"
ON public.org_activity_log
FOR SELECT
USING (
  public.is_org_member(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins insert activity" ON public.org_activity_log;
CREATE POLICY "Admins insert activity"
ON public.org_activity_log
FOR INSERT
WITH CHECK (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

-- Fix org_quarterly_reports policies
DROP POLICY IF EXISTS "Org admins view quarterly reports" ON public.org_quarterly_reports;
CREATE POLICY "Org admins view quarterly reports"
ON public.org_quarterly_reports
FOR SELECT
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

DROP POLICY IF EXISTS "Admins insert quarterly reports" ON public.org_quarterly_reports;
CREATE POLICY "Admins insert quarterly reports"
ON public.org_quarterly_reports
FOR INSERT
WITH CHECK (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);

-- Fix challenge_participants SELECT policy
DROP POLICY IF EXISTS "Org members view participants" ON public.challenge_participants;
CREATE POLICY "Org members view participants"
ON public.challenge_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wellness_challenges wc
    WHERE wc.id = challenge_participants.challenge_id
      AND public.is_org_member(auth.uid(), wc.org_id)
  )
);

-- Fix wellness_challenges policies
DROP POLICY IF EXISTS "wellness_challenges_select" ON public.wellness_challenges;
DROP POLICY IF EXISTS "wellness_challenges_insert" ON public.wellness_challenges;

-- Fix mood_pulses SELECT - add org admin visibility
DROP POLICY IF EXISTS "Org admins view mood pulses" ON public.mood_pulses;
CREATE POLICY "Org admins view mood pulses"
ON public.mood_pulses
FOR SELECT
USING (
  public.is_org_admin_or_manager(auth.uid(), org_id)
);
