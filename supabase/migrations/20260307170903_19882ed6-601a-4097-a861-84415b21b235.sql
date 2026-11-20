
-- Daily themes
CREATE TABLE public.daily_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text NOT NULL,
  focus_areas jsonb DEFAULT '[]'::jsonb,
  affirmation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Themes viewable by authenticated" ON public.daily_themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can insert themes" ON public.daily_themes FOR INSERT TO authenticated WITH CHECK (true);

-- Sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  time_slot text NOT NULL,
  type text NOT NULL DEFAULT 'guide',
  status text NOT NULL DEFAULT 'active',
  theme_id uuid REFERENCES public.daily_themes(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Session messages
CREATE TABLE public.session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own messages" ON public.session_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_messages.session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users insert own messages" ON public.session_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_messages.session_id AND s.user_id = auth.uid())
);

-- Observation tasks (chained)
CREATE TABLE public.observation_tasks (
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

-- Daily tasks (time-based)
CREATE TABLE public.daily_tasks (
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

-- Journal entries
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid REFERENCES public.sessions(id),
  title text,
  content text NOT NULL,
  mood text,
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own entries" ON public.journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own entries" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own entries" ON public.journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own entries" ON public.journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Evening reflections
CREATE TABLE public.evening_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reflection_date date NOT NULL DEFAULT CURRENT_DATE,
  mood int,
  energy int,
  gratitudes jsonb DEFAULT '[]'::jsonb,
  highlights text,
  challenges text,
  lessons text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);
ALTER TABLE public.evening_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reflections" ON public.evening_reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reflections" ON public.evening_reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reflections" ON public.evening_reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Trigger for journal updated_at
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
