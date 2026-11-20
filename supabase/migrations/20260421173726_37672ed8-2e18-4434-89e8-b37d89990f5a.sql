-- ─────────────────────────────────────────────────────────
-- 1. CURATED TEACHING BANK (global library)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_teachings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  loop_tag TEXT,                    -- e.g. 'anxiety', 'meaninglessness'; NULL = generic
  day_min INT NOT NULL DEFAULT 1,   -- earliest journey day this is appropriate
  day_max INT NOT NULL DEFAULT 9999,
  teaching TEXT NOT NULL,           -- the spoken/displayed wisdom line
  practice_instruction TEXT NOT NULL, -- "Notice 5 things you see, 4 you hear..."
  off_app_cue TEXT,                 -- "When anxiety comes — count 3 breaths."
  duration_minutes INT NOT NULL DEFAULT 5,
  archetype_bias TEXT,              -- 'bhakti'|'jnana'|'karma'|'raja'|NULL
  weight INT NOT NULL DEFAULT 1,    -- ranking when multiple match
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pt_lookup ON public.practice_teachings (practice, level, loop_tag);
CREATE INDEX IF NOT EXISTS idx_pt_day ON public.practice_teachings (day_min, day_max);

ALTER TABLE public.practice_teachings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachings readable by authenticated"
  ON public.practice_teachings FOR SELECT
  TO authenticated
  USING (true);

-- No insert/update/delete policies => clients cannot modify

-- ─────────────────────────────────────────────────────────
-- 2. PER-USER EFFECTIVENESS MAP (learning loop)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practice_effectiveness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice TEXT NOT NULL,           -- the practice that was offered
  loop_tag TEXT,                    -- the loop it was targeted at (NULL = general)
  cross_from TEXT,                  -- if this was cross-pollination, the source practice
  sessions_count INT NOT NULL DEFAULT 0,
  total_quality NUMERIC NOT NULL DEFAULT 0,    -- sum of quality scores
  avg_quality NUMERIC NOT NULL DEFAULT 0,      -- maintained denormalised
  loop_resolutions INT NOT NULL DEFAULT 0,     -- times loop went inactive after this practice
  effectiveness_score NUMERIC NOT NULL DEFAULT 0, -- 0-1, computed from above
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, practice, loop_tag)
);

CREATE INDEX IF NOT EXISTS idx_pe_user ON public.practice_effectiveness (user_id, effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_pe_loop ON public.practice_effectiveness (user_id, loop_tag);

ALTER TABLE public.practice_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own effectiveness"
  ON public.practice_effectiveness FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own effectiveness"
  ON public.practice_effectiveness FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own effectiveness"
  ON public.practice_effectiveness FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_pe_updated_at
  BEFORE UPDATE ON public.practice_effectiveness
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─────────────────────────────────────────────────────────
-- 3. RPC: record a practice outcome (called from session completion)
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_practice_outcome(
  p_practice TEXT,
  p_loop_tag TEXT,
  p_quality NUMERIC,
  p_loop_resolved BOOLEAN DEFAULT false,
  p_cross_from TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.practice_effectiveness AS pe
    (user_id, practice, loop_tag, cross_from, sessions_count, total_quality,
     avg_quality, loop_resolutions, effectiveness_score, last_used_at)
  VALUES
    (v_user, p_practice, p_loop_tag, p_cross_from, 1,
     COALESCE(p_quality, 0), COALESCE(p_quality, 0),
     CASE WHEN p_loop_resolved THEN 1 ELSE 0 END,
     COALESCE(p_quality, 0),
     now())
  ON CONFLICT (user_id, practice, loop_tag) DO UPDATE
  SET sessions_count    = pe.sessions_count + 1,
      total_quality     = pe.total_quality + COALESCE(p_quality, 0),
      avg_quality       = (pe.total_quality + COALESCE(p_quality, 0)) / (pe.sessions_count + 1),
      loop_resolutions  = pe.loop_resolutions + CASE WHEN p_loop_resolved THEN 1 ELSE 0 END,
      effectiveness_score = LEAST(1.0,
        ((pe.total_quality + COALESCE(p_quality, 0)) / (pe.sessions_count + 1))
        + (pe.loop_resolutions + CASE WHEN p_loop_resolved THEN 1 ELSE 0 END) * 0.15
      ),
      last_used_at = now(),
      cross_from   = COALESCE(pe.cross_from, p_cross_from)
  RETURNING pe.id INTO v_id;

  RETURN v_id;
END;
$$;