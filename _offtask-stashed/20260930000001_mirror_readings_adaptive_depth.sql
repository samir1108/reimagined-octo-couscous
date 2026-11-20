-- ═══════════════════════════════════════════════════════════════════════════
-- MIRROR READINGS — widen to 100 checkpoints, add adaptive depth metadata
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Two problems this fixes:
--
-- 1. mirror_number was CHECK-constrained to 1..38, so the 100-checkpoint
--    journey in src/data/pre-journey/mirrors.ts could not store a single
--    reading past mirror 38. Completion past that point would have failed on
--    insert, silently, for every user on the second half of the journey.
--
-- 2. The adaptive engine needs more than a single 0..100 score. To decide how
--    deep to go on the next mirror it needs the full sub-score breakdown (to
--    know which dimensions are already saturated and which were never
--    measured), the tags the reading carried, and the tier the reading was
--    taken at. None of that was stored.
--
-- All additions are nullable or defaulted, so existing rows are untouched.

-- 1. Widen the checkpoint range.
ALTER TABLE public.mirror_readings
  DROP CONSTRAINT IF EXISTS mirror_readings_mirror_number_check;

ALTER TABLE public.mirror_readings
  ADD CONSTRAINT mirror_readings_mirror_number_check
  CHECK (mirror_number BETWEEN 1 AND 100);

-- 2. Adaptive depth metadata.
ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb;
  -- { "witness-capacity": { "still": 12, "moving": 88 } } — 0..100 per
  -- sub-score, normalised across the questions actually asked.

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[];
  -- Tags carried by the reading, e.g. { 'anxious', 'high-baseline-alertness' }.
  -- Later mirrors branch on these.

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS tier TEXT
  CHECK (tier IS NULL OR tier IN ('surface','deep','core'));
  -- Depth tier the reading was taken at.

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS pruned_count INTEGER NOT NULL DEFAULT 0
  CHECK (pruned_count >= 0);
  -- Questions skipped because the user had already answered them consistently.
  -- Surfaced in the reveal so the skip is honest rather than invisible.

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS insight JSONB;
  -- The built reading: { headline, reading, cards[], tension, nextAction,
  --                     confidenceNote }. Deterministic, written at completion.

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS question_count INTEGER NOT NULL DEFAULT 0
  CHECK (question_count >= 0);
  -- How many questions were actually asked (post-pruning).

ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS completion NUMERIC(3,2) NOT NULL DEFAULT 0
  CHECK (completion BETWEEN 0 AND 1);
  -- Fraction of the offered questions that were answered.

-- 3. Index the recency-weighted read path. The aggregate calibration walks
--    every reading newest-first, so an index on (user_id, mirror_number DESC)
--    is the one this query actually wants.
DROP INDEX IF EXISTS public.idx_mirror_readings_user;
CREATE INDEX idx_mirror_readings_user ON public.mirror_readings(user_id, mirror_number DESC);

-- 4. Support cross-mirror saturation checks, which scan by slug.
CREATE INDEX IF NOT EXISTS idx_mirror_readings_slug
  ON public.mirror_readings(user_id, mirror_slug);
