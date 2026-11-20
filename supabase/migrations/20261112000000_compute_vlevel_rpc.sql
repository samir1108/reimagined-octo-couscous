-- ============================================================
-- COMPUTE V-LEVEL RPC â€” Server-Authoritative V-Level Calculation
-- ============================================================
-- Single source of truth for V-Level across client and server.
-- Mirrors supabase/functions/_shared/vLevel.ts and src/lib/shared/vLevel.ts exactly.

-- Helper: get dimension cap based on journey day
CREATE OR REPLACE FUNCTION get_dimension_cap(p_journey_day integer, p_is_calibration boolean)
RETURNS numeric AS $$
DECLARE
  cap numeric := 1.5;
BEGIN
  IF p_is_calibration THEN
    RETURN 3.5;
  END IF;
  
  IF p_journey_day >= 180 THEN cap := 7.0;
  ELSIF p_journey_day >= 90 THEN cap := 6.5;
  ELSIF p_journey_day >= 60 THEN cap := 5.5;
  ELSIF p_journey_day >= 30 THEN cap := 4.5;
  ELSIF p_journey_day >= 14 THEN cap := 3.5;
  ELSIF p_journey_day >= 7 THEN cap := 2.5;
  ELSE cap := 1.5;
  END IF;
  
  RETURN cap;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Compute witness quality (40% gap + 35% stability + 25% depth)
CREATE OR REPLACE FUNCTION compute_witness_quality(
  p_witness_gap numeric DEFAULT 0,
  p_witness_stability numeric DEFAULT 0,
  p_witness_depth numeric DEFAULT 0
)
RETURNS numeric AS $$
BEGIN
  RETURN 0.4 * p_witness_gap + 0.35 * p_witness_stability + 0.25 * p_witness_depth;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Compute loop penalty (floor 0.50, -0.05 per acute, -0.02 per active)
CREATE OR REPLACE FUNCTION compute_loop_penalty(p_loop_severity jsonb)
RETURNS numeric AS $$
DECLARE
  acute_count integer := 0;
  active_count integer := 0;
  severity_text text;
BEGIN
  IF p_loop_severity IS NULL THEN
    RETURN 1.0;
  END IF;
  
  FOR severity_text IN SELECT value FROM jsonb_each_text(p_loop_severity)
  LOOP
    IF severity_text = 'acute' THEN
      acute_count := acute_count + 1;
    ELSIF severity_text = 'active' THEN
      active_count := active_count + 1;
    END IF;
  END LOOP;
  
  RETURN GREATEST(0.50, 1.0 - (0.05 * acute_count) - (0.02 * active_count));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Compute integration score v2
CREATE OR REPLACE FUNCTION compute_integration_score_v2(
  p_v_level_baseline numeric DEFAULT 0,
  p_v_level_peak numeric DEFAULT 0,
  p_journey_day integer DEFAULT 1,
  p_total_sessions integer DEFAULT 0,
  p_dark_night_count integer DEFAULT 0,
  p_baseline_highest numeric DEFAULT 0,
  p_dimension_bands jsonb DEFAULT '{}'::jsonb
)
RETURNS numeric AS $$
DECLARE
  peak_proximity numeric := 0;
  testing_depth numeric := 0;
  consistency_ratio numeric := 0;
  balance_score numeric := 0;
  dim_vals numeric[];
  dim_max numeric;
  dim_min numeric;
BEGIN
  -- Peak proximity (30%)
  IF p_v_level_peak > 0 THEN
    peak_proximity := GREATEST(0, 1 - ((p_v_level_peak - p_v_level_baseline) / GREATEST(p_v_level_peak, 0.01)));
  END IF;

  -- Testing depth (25%)
  IF p_dark_night_count > 0 THEN
    IF p_baseline_highest > p_v_level_baseline * 0.8 THEN
      testing_depth := LEAST(1, 0.8 + (p_dark_night_count * 0.05));
    ELSE
      testing_depth := 0.4;
    END IF;
  ELSE
    testing_depth := LEAST(0.3, p_journey_day / 100.0);
  END IF;

  -- Consistency (25%)
  consistency_ratio := LEAST(1, p_total_sessions / GREATEST(1, p_journey_day * 0.5));

  -- Balance (20%)
  dim_vals := ARRAY[
    COALESCE((p_dimension_bands->>'thought')::numeric, 0),
    COALESCE((p_dimension_bands->>'emotion')::numeric, 0),
    COALESCE((p_dimension_bands->>'body')::numeric, 0),
    COALESCE((p_dimension_bands->>'awareness')::numeric, 0)
  ];
  dim_max := (SELECT max(v) FROM unnest(dim_vals) v);
  dim_min := (SELECT min(v) FROM unnest(dim_vals) v);
  balance_score := CASE WHEN dim_max > 0 THEN dim_min / dim_max ELSE 0 END;

  RETURN ROUND(
    0.30 * peak_proximity
    + 0.25 * testing_depth
    + 0.25 * consistency_ratio
    + 0.20 * balance_score
  , 3);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Apply time decay to dimensions
CREATE OR REPLACE FUNCTION apply_time_decay(
  p_dimension_bands jsonb,
  p_last_session_at timestamptz
)
RETURNS jsonb AS $$
DECLARE
  days_since integer;
  decay_rate numeric;
  dim text;
  result jsonb := p_dimension_bands;
BEGIN
  IF p_last_session_at IS NULL THEN
    RETURN p_dimension_bands;
  END IF;

  days_since := FLOOR(EXTRACT(EPOCH FROM (NOW() - p_last_session_at)) / 86400);
  IF days_since <= 1 THEN
    RETURN p_dimension_bands;
  END IF;

  decay_rate := 0.01 * LEAST(days_since, 50);
  
  FOR dim IN SELECT unnest(ARRAY['thought', 'emotion', 'body', 'awareness'])
  LOOP
    IF result ? dim THEN
      result := jsonb_set(result, ARRAY[dim], to_jsonb(GREATEST(0, (result->>dim)::numeric - decay_rate)));
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- MAIN RPC: Compute V-Level
CREATE OR REPLACE FUNCTION compute_vlevel(
  p_dimension_scores jsonb,
  p_profile jsonb
)
RETURNS jsonb AS $$
DECLARE
  dims jsonb;
  is_calibration_period boolean;
  dim_cap numeric;
  vals numeric[];
  min_val numeric;
  max_val numeric;
  epsilon numeric := 0.01;
  safe_vals numeric[];
  geometric_mean numeric;
  harmonic_mean numeric;
  blended_score numeric;
  witness_quality numeric;
  witness_modifier numeric;
  loop_penalty numeric;
  integration_score numeric;
  integration_bonus numeric;
  v_level numeric;
  clamped_value numeric;
  final_value numeric;
  value numeric;
  band integer;
  fractional numeric;
  micro_level text;
  dim text;
  result jsonb;
BEGIN
  -- Apply time decay
  dims := apply_time_decay(p_dimension_scores, (p_profile->>'last_session_at')::timestamptz);

  -- Calibration period check
  is_calibration_period := COALESCE((p_profile->>'journey_day')::int, 1) <= 30;
  dim_cap := get_dimension_cap(COALESCE((p_profile->>'journey_day')::int, 1), is_calibration_period);

  -- Apply dimension caps
  FOR dim IN SELECT unnest(ARRAY['thought', 'emotion', 'body', 'awareness'])
  LOOP
    IF dims ? dim THEN
      IF (dims->>dim)::numeric > dim_cap THEN
        dims := jsonb_set(dims, ARRAY[dim], to_jsonb(dim_cap));
      END IF;
    END IF;
  END LOOP;

  -- Extract values
  vals := ARRAY[
    COALESCE((dims->>'thought')::numeric, 0),
    COALESCE((dims->>'emotion')::numeric, 0),
    COALESCE((dims->>'body')::numeric, 0),
    COALESCE((dims->>'awareness')::numeric, 0)
  ];

  min_val := (SELECT min(v) FROM unnest(vals) v);
  max_val := (SELECT max(v) FROM unnest(vals) v);

  -- Geometric mean (with epsilon)
  safe_vals := ARRAY(SELECT v + epsilon FROM unnest(vals) v);
  geometric_mean := POWER(
    (SELECT EXP(SUM(LN(v))) FROM unnest(safe_vals) v),
    0.25
  ) - epsilon;

  -- Harmonic mean
  IF (SELECT bool_and(v > 0) FROM unnest(vals) v) THEN
    harmonic_mean := 4 / (SELECT SUM(1 / GREATEST(0.01, v)) FROM unnest(vals) v);
  ELSE
    harmonic_mean := 0;
  END IF;

  -- Blended score: 40% geo + 30% harmonic + 20% min + 10% max
  blended_score := 0.40 * GREATEST(0, geometric_mean)
    + 0.30 * harmonic_mean
    + 0.20 * min_val
    + 0.10 * max_val;

  -- Witness modifier
  witness_quality := compute_witness_quality(
    COALESCE((p_profile->>'witness_gap')::numeric, 0),
    COALESCE((p_profile->>'witness_stability')::numeric, 0),
    COALESCE((p_profile->>'witness_depth')::numeric, 0)
  );
  witness_modifier := 0.70 + (0.30 * witness_quality);

  -- Loop penalty
  loop_penalty := compute_loop_penalty(p_profile->'loop_severity');

  -- Integration bonus
  integration_score := compute_integration_score_v2(
    COALESCE((p_profile->>'v_level_baseline')::numeric, 0),
    COALESCE((p_profile->>'v_level_peak')::numeric, 0),
    COALESCE((p_profile->>'journey_day')::int, 1),
    COALESCE((p_profile->>'total_sessions')::int, 0),
    COALESCE((p_profile->'regression'->>'dark_night_count')::int, 0),
    COALESCE((p_profile->'regression'->>'baseline_highest')::numeric, 0),
    p_profile->'dimension_bands'
  );
  integration_bonus := 1.0 + (0.10 * integration_score);

  -- Final V-Level
  v_level := blended_score * witness_modifier * loop_penalty * integration_bonus;
  clamped_value := GREATEST(0, LEAST(7.0, ROUND(v_level, 2)));

  -- Calibration cap
  IF is_calibration_period THEN
    final_value := LEAST(clamped_value, 1.0);
  ELSE
    final_value := clamped_value;
  END IF;

  value := ROUND(final_value * 10) / 10;
  band := FLOOR(value);
  fractional := value - band;

  IF fractional < 0.3 THEN micro_level := 'entering';
  ELSIF fractional < 0.7 THEN micro_level := 'deepening';
  ELSE micro_level := 'mastery';
  END IF;

  result := jsonb_build_object(
    'value', value,
    'band', band,
    'microLevel', micro_level,
    'dimensionScores', dims,
    'calculatedAt', NOW(),
    'witnessQuality', witness_quality,
    'loopPenalty', loop_penalty,
    'integrationScore', integration_score
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION compute_vlevel(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_vlevel(jsonb, jsonb) TO service_role;

-- Also grant the helper functions
GRANT EXECUTE ON FUNCTION get_dimension_cap(integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_witness_quality(numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_loop_penalty(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_integration_score_v2(numeric, numeric, integer, integer, integer, numeric, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_time_decay(jsonb, timestamptz) TO authenticated;