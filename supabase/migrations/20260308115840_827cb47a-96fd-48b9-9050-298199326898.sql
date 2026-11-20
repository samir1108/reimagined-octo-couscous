
-- Enterprise visibility: Allow org admins/managers to view employee consciousness profiles
CREATE POLICY "Org admins view member consciousness"
ON user_consciousness_profile FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = user_consciousness_profile.user_id
    AND target.status = 'active'
  )
);

-- Enterprise visibility: Allow org admins/managers to view employee sessions
CREATE POLICY "Org admins view member sessions"
ON sessions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = sessions.user_id
    AND target.status = 'active'
  )
);

-- Enterprise visibility: Allow org admins/managers to view employee journal entries
CREATE POLICY "Org admins view member journals"
ON journal_entries FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = journal_entries.user_id
    AND target.status = 'active'
  )
);

-- Enterprise visibility: Allow org admins/managers to view employee loops
CREATE POLICY "Org admins view member loops"
ON user_loops FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = user_loops.user_id
    AND target.status = 'active'
  )
);

-- Enterprise visibility: Allow org admins/managers to view employee psyche profiles
CREATE POLICY "Org admins view member psyche"
ON user_psyche_profile FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = user_psyche_profile.user_id
    AND target.status = 'active'
  )
);

-- Enterprise visibility: Allow org admins/managers to view employee evening reflections
CREATE POLICY "Org admins view member reflections"
ON evening_reflections FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM org_members viewer
    JOIN org_members target ON viewer.org_id = target.org_id
    WHERE viewer.user_id = auth.uid()
    AND viewer.role IN ('admin', 'manager')
    AND viewer.status = 'active'
    AND target.user_id = evening_reflections.user_id
    AND target.status = 'active'
  )
);
