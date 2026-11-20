-- Add missing columns that were dropped or never applied during schema resets

-- profiles: lifestyle and related context
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifestyle jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wake_time text,
  ADD COLUMN IF NOT EXISTS sleep_time text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS preferred_theme text NOT NULL DEFAULT 'sunrise',
  ADD COLUMN IF NOT EXISTS ai_mode text NOT NULL DEFAULT 'fast'
  CHECK (ai_mode IN ('fast', 'premium'));

-- observation_tasks: task_date and theme linkage
ALTER TABLE public.observation_tasks
  ADD COLUMN IF NOT EXISTS task_date date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_topic text;

-- daily_themes: evolution state
ALTER TABLE public.daily_themes
  ADD COLUMN IF NOT EXISTS current_depth integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sub_angle text,
  ADD COLUMN IF NOT EXISTS evolution_status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS deepened_explore jsonb,
  ADD COLUMN IF NOT EXISTS deepened_wisdom text,
  ADD COLUMN IF NOT EXISTS deepened_reasoning text,
  ADD COLUMN IF NOT EXISTS recommended_practice jsonb,
  ADD COLUMN IF NOT EXISTS last_evolved_at timestamptz;

-- sessions: ended_at alias for backwards compatibility (completed_at is the canonical column)
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS ended_at timestamptz;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_observation_tasks_task_date ON public.observation_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_observation_tasks_user_theme ON public.observation_tasks(user_id, theme_id) WHERE theme_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_themes_user_date ON public.daily_themes(user_id, theme_date);
