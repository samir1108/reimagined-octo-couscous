-- ============================================================
-- SESSION SPINE — allow the composed session to persist its spine
-- ------------------------------------------------------------
-- The orchestrator runs in the browser and inserts the spine row for
-- the signed-in user right after composition. The table only had a
-- SELECT policy, so every insert was rejected by RLS and the session
-- silently fell back to a non-spine plan. Scope writes to the owner.
-- ============================================================

DROP POLICY IF EXISTS "Users insert own session spine" ON public.session_spine;
CREATE POLICY "Users insert own session spine"
  ON public.session_spine FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own session spine" ON public.session_spine;
CREATE POLICY "Users update own session spine"
  ON public.session_spine FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.session_spine TO authenticated;
GRANT ALL ON public.session_spine TO service_role;
