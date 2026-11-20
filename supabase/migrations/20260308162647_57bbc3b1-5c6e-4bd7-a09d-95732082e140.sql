
-- Fix org_members INSERT policy to be permissive for bootstrapping
DROP POLICY IF EXISTS "Admins can insert members" ON public.org_members;
CREATE POLICY "Admins can insert members"
ON public.org_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_org_admin(auth.uid(), org_id)
  OR NOT EXISTS (SELECT 1 FROM public.org_members om WHERE om.org_id = org_members.org_id)
);

-- Fix other restrictive policies that should be permissive
-- org_members SELECT
DROP POLICY IF EXISTS "Org members can view other members" ON public.org_members;
CREATE POLICY "Org members can view other members"
ON public.org_members
FOR SELECT
TO authenticated
USING (
  org_id IN (SELECT public.get_user_org_ids(auth.uid()))
);

-- org_members UPDATE
DROP POLICY IF EXISTS "Admins can update members" ON public.org_members;
CREATE POLICY "Admins can update members"
ON public.org_members
FOR UPDATE
TO authenticated
USING (
  public.is_org_admin(auth.uid(), org_id)
);

-- org_members DELETE
DROP POLICY IF EXISTS "Admins can delete members" ON public.org_members;
CREATE POLICY "Admins can delete members"
ON public.org_members
FOR DELETE
TO authenticated
USING (
  public.is_org_admin(auth.uid(), org_id)
);

-- Fix organizations policies to be permissive
DROP POLICY IF EXISTS "Org members can view their org" ON public.organizations;
CREATE POLICY "Org members can view their org"
ON public.organizations
FOR SELECT
TO authenticated
USING (
  public.is_org_member(auth.uid(), id)
);

DROP POLICY IF EXISTS "Admins can update their org" ON public.organizations;
CREATE POLICY "Admins can update their org"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  public.is_org_admin(auth.uid(), id)
);

-- Fix all enterprise table policies to be permissive
DROP POLICY IF EXISTS "Org members can view teams" ON public.teams;
CREATE POLICY "Org members can view teams"
ON public.teams
FOR SELECT
TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins and managers can manage teams" ON public.teams;
CREATE POLICY "Admins and managers can manage teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins can update teams" ON public.teams;
CREATE POLICY "Admins can update teams"
ON public.teams
FOR UPDATE
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins can delete teams" ON public.teams;
CREATE POLICY "Admins can delete teams"
ON public.teams
FOR DELETE
TO authenticated
USING (public.is_org_admin(auth.uid(), org_id));

-- Enterprise notifications
DROP POLICY IF EXISTS "Org admins view enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Org admins view enterprise notifications"
ON public.enterprise_notifications
FOR SELECT
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Org admins update enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Org admins update enterprise notifications"
ON public.enterprise_notifications
FOR UPDATE
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Service inserts enterprise notifications" ON public.enterprise_notifications;
CREATE POLICY "Service inserts enterprise notifications"
ON public.enterprise_notifications
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_or_manager(auth.uid(), org_id));

-- Org invites
DROP POLICY IF EXISTS "Admins can create invites" ON public.org_invites;
CREATE POLICY "Admins can create invites"
ON public.org_invites
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins can view invites" ON public.org_invites;
CREATE POLICY "Admins can view invites"
ON public.org_invites
FOR SELECT
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

-- Activity log
DROP POLICY IF EXISTS "Org members view activity" ON public.org_activity_log;
CREATE POLICY "Org members view activity"
ON public.org_activity_log
FOR SELECT
TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins insert activity" ON public.org_activity_log;
CREATE POLICY "Admins insert activity"
ON public.org_activity_log
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_or_manager(auth.uid(), org_id));

-- Quarterly reports
DROP POLICY IF EXISTS "Org admins view quarterly reports" ON public.org_quarterly_reports;
CREATE POLICY "Org admins view quarterly reports"
ON public.org_quarterly_reports
FOR SELECT
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

DROP POLICY IF EXISTS "Admins insert quarterly reports" ON public.org_quarterly_reports;
CREATE POLICY "Admins insert quarterly reports"
ON public.org_quarterly_reports
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin_or_manager(auth.uid(), org_id));

-- Fix challenge_participants
DROP POLICY IF EXISTS "Org members view participants" ON public.challenge_participants;
CREATE POLICY "Org members view participants"
ON public.challenge_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.wellness_challenges wc
    WHERE wc.id = challenge_participants.challenge_id
      AND public.is_org_member(auth.uid(), wc.org_id)
  )
);

-- Mood pulses org admin view
DROP POLICY IF EXISTS "Org admins view mood pulses" ON public.mood_pulses;
CREATE POLICY "Org admins view mood pulses"
ON public.mood_pulses
FOR SELECT
TO authenticated
USING (public.is_org_admin_or_manager(auth.uid(), org_id));

-- Sessions org admin view
DROP POLICY IF EXISTS "Org admins view member sessions" ON public.sessions;
CREATE POLICY "Org admins view member sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = sessions.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Fix remaining cross-table org policies
DROP POLICY IF EXISTS "Org admins view member reflections" ON public.evening_reflections;
CREATE POLICY "Org admins view member reflections"
ON public.evening_reflections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = evening_reflections.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

DROP POLICY IF EXISTS "Org admins view member journals" ON public.journal_entries;
CREATE POLICY "Org admins view member journals"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = journal_entries.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

DROP POLICY IF EXISTS "Org admins view member consciousness" ON public.user_consciousness_profile;
CREATE POLICY "Org admins view member consciousness"
ON public.user_consciousness_profile
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_consciousness_profile.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

DROP POLICY IF EXISTS "Org admins view member loops" ON public.user_loops;
CREATE POLICY "Org admins view member loops"
ON public.user_loops
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_loops.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

DROP POLICY IF EXISTS "Org admins view member psyche" ON public.user_psyche_profile;
CREATE POLICY "Org admins view member psyche"
ON public.user_psyche_profile
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.org_members target
    WHERE target.user_id = user_psyche_profile.user_id
      AND target.status = 'active'
      AND public.is_org_admin_or_manager(auth.uid(), target.org_id)
  )
);

-- Coaching notes
DROP POLICY IF EXISTS "Managers insert coaching notes" ON public.manager_coaching_notes;
CREATE POLICY "Managers insert coaching notes"
ON public.manager_coaching_notes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Managers update own coaching notes" ON public.manager_coaching_notes;
CREATE POLICY "Managers update own coaching notes"
ON public.manager_coaching_notes
FOR UPDATE
TO authenticated
USING (auth.uid() = manager_id);

DROP POLICY IF EXISTS "Managers view own coaching notes" ON public.manager_coaching_notes;
CREATE POLICY "Managers view own coaching notes"
ON public.manager_coaching_notes
FOR SELECT
TO authenticated
USING (auth.uid() = manager_id);
