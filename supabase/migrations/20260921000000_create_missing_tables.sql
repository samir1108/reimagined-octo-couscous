-- Create missing tables that should exist based on earlier migrations
-- These tables were created in earlier migrations but don't exist in the database

-- observation_tasks
CREATE TABLE IF NOT EXISTS public.observation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  domain text NOT NULL,
  chain_order int NOT NULL DEFAULT 0,
  parent_task_id uuid REFERENCES public.observation_tasks(id),
  status text NOT NULL DEFAULT 'active',
  reflection text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.observation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own obs tasks" ON public.observation_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own obs tasks" ON public.observation_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own obs tasks" ON public.observation_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- daily_tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  time_slot text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own daily tasks" ON public.daily_tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own daily tasks" ON public.daily_tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own daily tasks" ON public.daily_tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- user_orientation_progress
CREATE TABLE IF NOT EXISTS public.user_orientation_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_session int NOT NULL DEFAULT 1,
  completed_sessions int[] NOT NULL DEFAULT '{}',
  current_act int NOT NULL DEFAULT 1,
  last_session_at timestamptz,
  completed_at timestamptz,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_orientation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.user_orientation_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.user_orientation_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.user_orientation_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_orientation_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_orientation_updated_at
  BEFORE UPDATE ON public.user_orientation_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_orientation_updated_at();

-- Backfill existing users as already complete so course only appears for new users
INSERT INTO public.user_orientation_progress (user_id, current_session, current_act, completed_at, skipped)
SELECT user_id, 31, 6, now(), true FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;