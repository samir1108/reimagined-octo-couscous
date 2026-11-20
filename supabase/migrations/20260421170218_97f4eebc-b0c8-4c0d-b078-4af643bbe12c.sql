-- ═══════════════════════════════════════════════════════════════
-- BAND PRACTICE ANCHORS — static long-form practice per band
-- One "anchor" practice per band level (0-10) that stays for 30+ days
-- as the foundation while AI rotates daily picks around it.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.band_practice_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  band_level integer NOT NULL CHECK (band_level >= 0 AND band_level <= 10),
  practice_type text NOT NULL,
  practice_level integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 10,
  rationale text,
  -- progressive curriculum within the band: week 1, week 2, etc.
  curriculum jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- toolkit of supporting practices to rotate within
  toolkit jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_week integer NOT NULL DEFAULT 1,
  started_at timestamptz NOT NULL DEFAULT now(),
  last_practiced_at timestamptz,
  total_sessions integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_band_anchors_user_active 
  ON public.band_practice_anchors(user_id, is_active);

ALTER TABLE public.band_practice_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view their own band anchors"
  ON public.band_practice_anchors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert their own band anchors"
  ON public.band_practice_anchors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update their own band anchors"
  ON public.band_practice_anchors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users delete their own band anchors"
  ON public.band_practice_anchors FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_band_anchors_updated_at
  BEFORE UPDATE ON public.band_practice_anchors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- TODAY PRACTICE PACKS — cached daily AI-composed practice mix
-- Theme-aware + 30/50/20 formula. One pack per user per day.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.today_practice_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pack_date date NOT NULL DEFAULT CURRENT_DATE,
  theme_id uuid,
  arc_id uuid,
  -- the composed practices: [{practice, level, allocation, title, why, duration}]
  practices jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- meta about composition
  formula text NOT NULL DEFAULT '30/50/20',
  band_level integer,
  arc_phase text,
  bypassing_check jsonb,
  cross_pollination jsonb,
  rationale text,
  -- status tracking
  completed_practices jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_date)
);

CREATE INDEX IF NOT EXISTS idx_today_packs_user_date 
  ON public.today_practice_packs(user_id, pack_date DESC);

ALTER TABLE public.today_practice_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view their own today packs"
  ON public.today_practice_packs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert their own today packs"
  ON public.today_practice_packs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update their own today packs"
  ON public.today_practice_packs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_today_packs_updated_at
  BEFORE UPDATE ON public.today_practice_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();