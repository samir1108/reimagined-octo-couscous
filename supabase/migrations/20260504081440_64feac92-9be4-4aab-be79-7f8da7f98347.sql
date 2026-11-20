
-- 1. user_credits
DROP POLICY IF EXISTS "Users update own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users insert own credits" ON public.user_credits;

-- 2. user_karma
DROP POLICY IF EXISTS "Users can update their own karma" ON public.user_karma;
DROP POLICY IF EXISTS "Users can insert their own karma" ON public.user_karma;

-- 3. karma_events
DROP POLICY IF EXISTS "Users can insert their own karma events" ON public.karma_events;
DROP POLICY IF EXISTS "Users view their own karma events" ON public.karma_events;

-- 4. admin_activity_log
DROP POLICY IF EXISTS "Service inserts activity" ON public.admin_activity_log;
CREATE POLICY "Admins insert activity"
  ON public.admin_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()) AND auth.uid() = user_id);

-- 5. profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. journey_group_members
DROP POLICY IF EXISTS "Members view group members" ON public.journey_group_members;
CREATE POLICY "Members view their own groups members"
  ON public.journey_group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM public.journey_group_members WHERE user_id = auth.uid()
    )
  );

-- 7. witness_circle_members
DROP POLICY IF EXISTS "Anyone authenticated reads circle members" ON public.witness_circle_members;
CREATE POLICY "Members view their own circles members"
  ON public.witness_circle_members
  FOR SELECT
  TO authenticated
  USING (
    circle_id IN (
      SELECT circle_id FROM public.witness_circle_members WHERE user_id = auth.uid()
    )
  );

-- 8. collective_meditation_participants
DROP POLICY IF EXISTS "Anyone authenticated reads participants" ON public.collective_meditation_participants;
CREATE POLICY "Participants view their own meditations"
  ON public.collective_meditation_participants
  FOR SELECT
  TO authenticated
  USING (
    meditation_id IN (
      SELECT meditation_id FROM public.collective_meditation_participants WHERE user_id = auth.uid()
    )
  );

-- 9. org_members: hide email from non-admins
DROP POLICY IF EXISTS "Org members can view other members" ON public.org_members;

CREATE POLICY "Org admins view full member rows"
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (public.is_org_admin_or_manager(auth.uid(), org_id));

CREATE POLICY "Members view their own org row"
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Safe directory view (no email) for fellow org members
CREATE OR REPLACE VIEW public.org_members_directory
WITH (security_invoker = true)
AS
SELECT id, org_id, user_id, team_id, role, status, invited_at, joined_at
FROM public.org_members
WHERE org_id IN (SELECT public.get_user_org_ids(auth.uid()));

GRANT SELECT ON public.org_members_directory TO authenticated;
