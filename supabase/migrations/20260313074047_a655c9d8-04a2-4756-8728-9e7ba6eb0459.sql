
-- Add task_date, theme_id, user_topic to observation_tasks
ALTER TABLE public.observation_tasks 
  ADD COLUMN IF NOT EXISTS task_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_topic TEXT;

-- Add user_chosen_topic to sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS user_chosen_topic TEXT;

-- Backfill existing observation_tasks task_date from created_at
UPDATE public.observation_tasks SET task_date = DATE(created_at) WHERE task_date IS NULL;
