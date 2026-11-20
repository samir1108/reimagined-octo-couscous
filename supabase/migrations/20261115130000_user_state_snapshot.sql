-- ============================================================
-- USER STATE SNAPSHOT
-- ------------------------------------------------------------
-- Every session start re-aggregated ~13 tables. This caches the
-- DB-derived context per user so a warm start is one read.
-- TTL is short (10 minutes) and the row is invalidated on session
-- completion, so staleness cannot survive a sitting.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_state_snapshot (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_state_snapshot_computed_idx
  ON public.user_state_snapshot (computed_at DESC);

ALTER TABLE public.user_state_snapshot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own snapshot" ON public.user_state_snapshot;
CREATE POLICY "Users view own snapshot"
  ON public.user_state_snapshot FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own snapshot" ON public.user_state_snapshot;
CREATE POLICY "Users delete own snapshot"
  ON public.user_state_snapshot FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, DELETE ON public.user_state_snapshot TO authenticated;
GRANT ALL ON public.user_state_snapshot TO service_role;

-- Fresh-enough snapshot for this user, or null. Security definer so the
-- client can ask without exposing another user's row.
CREATE OR REPLACE FUNCTION public.get_user_snapshot(p_max_age_minutes INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payload JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT payload INTO v_payload
  FROM public.user_state_snapshot
  WHERE user_id = auth.uid()
    AND computed_at > now() - make_interval(mins => GREATEST(1, p_max_age_minutes));

  RETURN v_payload;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_snapshot(INT) TO authenticated;
