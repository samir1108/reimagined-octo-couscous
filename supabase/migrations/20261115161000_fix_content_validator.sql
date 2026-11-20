-- Align the SQL validator with the shared TS validator: practices and
-- reflections carry a caption (40 chars), micro actions 25, reads 60.
-- Then republish anything that now clears the bar.

CREATE OR REPLACE FUNCTION public.validate_content_ingredient(p_id TEXT)
RETURNS TABLE (field TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.content_ingredients;
  min_chars INT;
  txt_len INT;
BEGIN
  SELECT * INTO r FROM public.content_ingredients WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 'id'::TEXT, 'ingredient not found';
    RETURN;
  END IF;

  IF char_length(r.label) < 1 OR char_length(r.label) > 40 THEN
    RETURN QUERY SELECT 'label'::TEXT, 'label must be 1..40 chars';
  END IF;

  min_chars := CASE r.kind
    WHEN 'knowledge' THEN 60
    WHEN 'practice'  THEN 40
    WHEN 'reflection' THEN 40
    ELSE 25
  END;
  txt_len := char_length(COALESCE(r.body, r.summary, ''));
  IF txt_len < min_chars THEN
    RETURN QUERY SELECT 'summary'::TEXT,
      format('needs at least %s characters for %s', min_chars, r.kind);
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
  IF r.step_kind IS NOT NULL
     AND r.step_kind NOT IN ('wisdom-read','breathwork','journal','micro-act','reflection','practice','witness') THEN
    RETURN QUERY SELECT 'step_kind'::TEXT, 'unrenderable step kind';
  END IF;
END;
$$;

UPDATE public.content_ingredients
SET status = 'published', updated_at = now()
WHERE id LIKE 'loop:%'
  AND status = 'draft'
  AND NOT EXISTS (
    SELECT 1 FROM public.validate_content_ingredient(content_ingredients.id)
  );
