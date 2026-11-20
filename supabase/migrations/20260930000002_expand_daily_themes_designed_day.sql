
-- Expand daily_themes: persist all AI-generated fields + arc + quality
-- This is the "designed day" foundation — the day exists as a rich object,
-- not just a title + description.

ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS sequence_no integer NOT NULL DEFAULT 1;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS max_depth integer NOT NULL DEFAULT 5;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS current_depth integer NOT NULL DEFAULT 0;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS evolution_status text NOT NULL DEFAULT 'active';
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS sub_angle text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS deepened_wisdom text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS deepened_reasoning text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS deepened_practice text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS deepened_identity text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS theme_rationale jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS daily_intentions jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS action_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS felt_sense_opener text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS inner_inquiry text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS engagement_question text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS micro_practice jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS micro_prompt text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS real_life_trigger text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS resistance_warning text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS forbidden_thing text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS evening_close text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS tradition_lens text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS chakra_focus text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS spiral_marker text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS yesterday_bridge text;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS theme_quality numeric(3,2) DEFAULT NULL;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS day_arc jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.daily_themes ADD COLUMN IF NOT EXISTS handoffs jsonb DEFAULT '[]'::jsonb;

-- Index for fast day lookups
CREATE INDEX IF NOT EXISTS idx_daily_themes_user_date ON public.daily_themes(user_id, theme_date);

-- Relax INSERT policy to allow the service role to persist the full day object
DROP POLICY IF EXISTS "Service can insert themes" ON public.daily_themes;
CREATE POLICY "Service can insert themes"
  ON public.daily_themes FOR INSERT
  TO authenticated
  WITH CHECK (true);
