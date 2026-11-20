-- ============================================================
-- Session ingredient learning loop
-- ------------------------------------------------------------
-- session_ingredients records what the composer PROPOSED. These
-- columns record what actually HAPPENED, so the composer can learn
-- which steps this user finishes and what they rate well.
-- ============================================================

ALTER TABLE public.session_ingredients
  ADD COLUMN IF NOT EXISTS completed BOOLEAN,
  ADD COLUMN IF NOT EXISTS seconds_spent INTEGER,
  ADD COLUMN IF NOT EXISTS quality NUMERIC;

-- Users may write the outcome of their own rows (client-side completion).
DROP POLICY IF EXISTS "Users update own session ingredients" ON public.session_ingredients;
CREATE POLICY "Users update own session ingredients"
  ON public.session_ingredients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- One row per (session, ingredient) keeps learning clean.
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_ingredients_session_ingredient
  ON public.session_ingredients(session_id, ingredient_id);

-- Aggregation view — per-user ingredient performance, newest first.
CREATE OR REPLACE VIEW public.session_ingredient_performance AS
SELECT
  user_id,
  ingredient_id,
  COUNT(*) FILTER (WHERE completed IS NOT NULL) AS attempts,
  COUNT(*) FILTER (WHERE completed)               AS completions,
  AVG(quality)   FILTER (WHERE quality IS NOT NULL)     AS avg_quality,
  AVG(seconds_spent) FILTER (WHERE completed)            AS avg_seconds,
  MAX(created_at) AS last_seen_at
FROM public.session_ingredients
WHERE completed IS NOT NULL
GROUP BY user_id, ingredient_id;

GRANT SELECT ON public.session_ingredient_performance TO authenticated;
GRANT SELECT ON public.session_ingredient_performance TO service_role;
