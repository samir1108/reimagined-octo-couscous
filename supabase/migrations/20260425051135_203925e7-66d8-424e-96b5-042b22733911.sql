-- Phase 1: Timeless Theme system — AI-decided depth + auto-spawn next theme

-- 1. Add max_depth (AI sets per theme, range 3-7)
ALTER TABLE public.daily_themes
  ADD COLUMN IF NOT EXISTS max_depth INTEGER NOT NULL DEFAULT 5;

-- 2. Add sequence_no to allow multiple themes per day (when one exhausts, next spawns)
ALTER TABLE public.daily_themes
  ADD COLUMN IF NOT EXISTS sequence_no INTEGER NOT NULL DEFAULT 1;

-- 3. Replace old unique constraint with one that includes sequence_no
ALTER TABLE public.daily_themes
  DROP CONSTRAINT IF EXISTS daily_themes_user_date_unique;

ALTER TABLE public.daily_themes
  ADD CONSTRAINT daily_themes_user_date_seq_unique
  UNIQUE (user_id, theme_date, sequence_no);

-- 4. Index for fast "latest open theme" lookup
CREATE INDEX IF NOT EXISTS idx_daily_themes_user_date_seq
  ON public.daily_themes (user_id, theme_date DESC, sequence_no DESC);

-- 5. Sanity check on max_depth bounds
ALTER TABLE public.daily_themes
  DROP CONSTRAINT IF EXISTS daily_themes_max_depth_check;

ALTER TABLE public.daily_themes
  ADD CONSTRAINT daily_themes_max_depth_check
  CHECK (max_depth BETWEEN 3 AND 7);