-- ============================================================
-- CONTENT INGREDIENTS
-- ------------------------------------------------------------
-- Content used to live inside composer.ts. At 48 entries that was fine; at
-- 480 it is not reviewable, versionable or safe. This table is the source of
-- truth for authored content; the in-file bank stays the offline fallback.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_ingredients (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                         -- practice | knowledge | reflection | micro_action
  label TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  practice TEXT,
  depth TEXT NOT NULL,                        -- light | medium | deep
  step_kind TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon TEXT,
  default_minutes INT,
  gate_fit TEXT[] NOT NULL DEFAULT '{}',
  energy_fit TEXT[] NOT NULL DEFAULT '{}',
  paths TEXT[] NOT NULL DEFAULT '{}',
  dimensions TEXT[] NOT NULL DEFAULT '{}',
  settles_chitta TEXT[] NOT NULL DEFAULT '{}',
  loop_targets TEXT[] NOT NULL DEFAULT '{}',
  loop_families TEXT[] NOT NULL DEFAULT '{}',
  min_journey_day INT,
  safety_class TEXT NOT NULL DEFAULT 'B',     -- A = never auto-selected
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  requires_witness_stability NUMERIC,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',       -- draft | review | published | retired
  version INT NOT NULL DEFAULT 1,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_ingredients_status_idx
  ON public.content_ingredients (status, kind);
CREATE INDEX IF NOT EXISTS content_ingredients_families_idx
  ON public.content_ingredients USING GIN (loop_families);
CREATE INDEX IF NOT EXISTS content_ingredients_dims_idx
  ON public.content_ingredients USING GIN (dimensions);

ALTER TABLE public.content_ingredients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published content is readable" ON public.content_ingredients;
CREATE POLICY "Published content is readable"
  ON public.content_ingredients FOR SELECT TO authenticated, anon
  USING (status = 'published');

GRANT SELECT ON public.content_ingredients TO authenticated, anon;
GRANT ALL ON public.content_ingredients TO service_role;

-- Validation the authoring pipeline calls before flipping status to published.
CREATE OR REPLACE FUNCTION public.validate_content_ingredient(p_id TEXT)
RETURNS TABLE (field TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.content_ingredients;
BEGIN
  SELECT * INTO r FROM public.content_ingredients WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'id'::TEXT, 'ingredient not found';
    RETURN;
  END IF;

  IF char_length(r.label) < 1 OR char_length(r.label) > 40 THEN
    RETURN QUERY SELECT 'label'::TEXT, 'label must be 1..40 chars';
  END IF;
  IF char_length(COALESCE(r.body, r.summary, '')) < 60 THEN
    RETURN QUERY SELECT 'summary'::TEXT, 'needs at least 60 characters of instruction';
  END IF;
  IF array_length(r.dimensions, 1) IS NULL THEN
    RETURN QUERY SELECT 'dimensions'::TEXT, 'at least one dimension';
  END IF;
  IF COALESCE(array_length(r.loop_families, 1), 0) < 2
     AND COALESCE(array_length(r.loop_targets, 1), 0) = 0 THEN
    RETURN QUERY SELECT 'loop_families'::TEXT, 'needs 2+ families or an explicit target';
  END IF;
  IF r.depth NOT IN ('light', 'medium', 'deep') THEN
    RETURN QUERY SELECT 'depth'::TEXT, 'unknown depth';
  END IF;
  IF r.kind NOT IN ('practice', 'knowledge', 'reflection', 'micro_action') THEN
    RETURN QUERY SELECT 'kind'::TEXT, 'unknown kind';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_content_ingredient(TEXT) TO authenticated, service_role;
