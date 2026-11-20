-- Add theme evolution state to daily_themes
ALTER TABLE public.daily_themes
  ADD COLUMN IF NOT EXISTS current_depth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sub_angle text,
  ADD COLUMN IF NOT EXISTS evolution_status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS deepened_explore jsonb,
  ADD COLUMN IF NOT EXISTS deepened_wisdom text,
  ADD COLUMN IF NOT EXISTS deepened_reasoning text,
  ADD COLUMN IF NOT EXISTS recommended_practice jsonb,
  ADD COLUMN IF NOT EXISTS last_evolved_at timestamptz;

-- Theme evolution log: every micro-shift recorded
CREATE TABLE IF NOT EXISTS public.theme_evolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_id uuid NOT NULL REFERENCES public.daily_themes(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  depth_before integer NOT NULL DEFAULT 0,
  depth_after integer NOT NULL DEFAULT 0,
  sub_angle_before text,
  sub_angle_after text,
  decision text NOT NULL DEFAULT 'deepen', -- deepen | hold | close
  rationale text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.theme_evolution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own theme evolution"
  ON public.theme_evolution_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own theme evolution"
  ON public.theme_evolution_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_theme_evolution_user_theme
  ON public.theme_evolution_log(user_id, theme_id, created_at DESC);
