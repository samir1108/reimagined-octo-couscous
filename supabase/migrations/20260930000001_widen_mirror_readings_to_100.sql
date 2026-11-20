-- ═══════════════════════════════════════════════════════════════════════════
-- MIRROR READINGS — widen to the full 100-checkpoint library + adaptive
-- history payload
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Two problems this fixes:
--
-- 1. `mirror_readings.mirror_number` was constrained to 1..38. The Library
--    has grown to 100 checkpoints, so mirrors 39-100 were physically
--    unstorable — the 100-mirror journey could never record a reading past
--    the 38th checkpoint. The bound is widened to match
--    src/data/pre-journey/mirrors.ts (MIRROR_TOTAL).
--
-- 2. The adaptive engine needs to know what was measured before, not just
--    the headline score. The new columns carry the per-sub-score
--    percentages, the tags a reading emitted, which depth tier it was asked
--    at, and how many questions were skipped as already-covered. That is
--    what lets the same mirror ask a harder question on the second attempt.

BEGIN;

-- ─── 1. Widen the mirror number bound ───
ALTER TABLE public.mirror_readings
  DROP CONSTRAINT IF EXISTS mirror_readings_mirror_number_check;

ALTER TABLE public.mirror_readings
  ADD CONSTRAINT mirror_readings_mirror_number_check
  CHECK (mirror_number BETWEEN 1 AND 100);

-- ─── 2. Adaptive history payload ───

-- Per-sub-score percentages, 0..100, keyed by the bank's own dimension names.
-- e.g. { "threshold": 41, "emergence": 22, "consolidation": 29, "dissolution": 8 }
ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Tags the reading emitted, consumed by mirrorCalibration to build the
-- whole-journey constellation.
ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Which depth tier this attempt was asked at: surface | deep | core.
ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS tier TEXT;

ALTER TABLE public.mirror_readings
  ADD CONSTRAINT mirror_readings_tier_check
  CHECK (tier IS NULL OR tier IN ('surface', 'deep', 'core'));

-- Questions left out because the user had already answered that dimension
-- consistently in earlier mirrors.
ALTER TABLE public.mirror_readings
  ADD COLUMN IF NOT EXISTS pruned_count INTEGER NOT NULL DEFAULT 0;

-- ─── 3. Indexing the adaptive read path ───
-- planMirror() loads the whole history for a user in mirror order, then does
-- per-dimension saturation counting. Tag lookups are used for tension finding.
CREATE INDEX IF NOT EXISTS idx_mirror_readings_user_slug
  ON public.mirror_readings(user_id, mirror_slug);

CREATE INDEX IF NOT EXISTS idx_mirror_readings_user_band
  ON public.mirror_readings(user_id, band);

-- Tags are queried with && and @>; GIN is the right index for containment.
CREATE INDEX IF NOT EXISTS idx_mirror_readings_tags
  ON public.mirror_readings USING GIN (tags);

-- ─── 4. Source vocabulary ───
-- The default is 'elder_onboarding', which is how the conversational Elder
-- records a reading during onboarding. Mirrors the user takes themselves in
-- the Library write 'user_mirror'. Widening the vocabulary here means the
-- column is self-describing rather than an enum in disguise.
ALTER TABLE public.mirror_readings
  DROP CONSTRAINT IF EXISTS mirror_readings_source_check;

COMMENT ON COLUMN public.mirror_readings.source IS
  'How the reading was produced: elder_onboarding | user_mirror | engine_inferred';

COMMENT ON COLUMN public.mirror_readings.band IS
  'preliminary = thin evidence, inferred = carried by adjacent mirrors, read = read directly from this mirror at depth, locked = not yet taken';

COMMIT;
