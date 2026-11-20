-- ============================================================
-- SOULSCAPE COMPLETE DATABASE SCHEMA
-- ============================================================

-- ENUMS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'journey_status') THEN
    CREATE TYPE public.journey_status AS ENUM ('morning_pending','tasks_active','evening_pending','practice_pending','completed');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE public.task_status AS ENUM ('pending','in_progress','completed','skipped');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'practice_type') THEN
    CREATE TYPE public.practice_type AS ENUM ('meditation','breathwork','movement','journaling');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_segment') THEN
    CREATE TYPE public.time_segment AS ENUM ('morning','afternoon','evening','night');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END $$;

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$ BEGIN RETURN GREATEST(1, FLOOR(xp_amount / 100)::INTEGER + 1); END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.clamp_capacity_values()
RETURNS TRIGGER AS $$
BEGIN
  NEW.attention := GREATEST(0, LEAST(10, COALESCE(NEW.attention, 1)));
  NEW.observation := GREATEST(0, LEAST(10, COALESCE(NEW.observation, 1)));
  NEW.presence := GREATEST(0, LEAST(10, COALESCE(NEW.presence, 1)));
  NEW.body_awareness := GREATEST(0, LEAST(10, COALESCE(NEW.body_awareness, 1)));
  NEW.emotional_mastery := GREATEST(0, LEAST(10, COALESCE(NEW.emotional_mastery, 1)));
  NEW.pattern_recognition := GREATEST(0, LEAST(10, COALESCE(NEW.pattern_recognition, 1)));
  NEW.self_inquiry := GREATEST(0, LEAST(10, COALESCE(NEW.self_inquiry, 1)));
  NEW.disidentification := GREATEST(0, LEAST(10, COALESCE(NEW.disidentification, 1)));
  NEW.shadow_integration := GREATEST(0, LEAST(10, COALESCE(NEW.shadow_integration, 1)));
  NEW.equanimity := GREATEST(0, LEAST(10, COALESCE(NEW.equanimity, 1)));
  NEW.surrender := GREATEST(0, LEAST(10, COALESCE(NEW.surrender, 1)));
  NEW.unification := GREATEST(0, LEAST(10, COALESCE(NEW.unification, 1)));
  RETURN NEW;
END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.initialize_life_domains(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.life_domains (user_id, domain_key, domain_name) VALUES
    (p_user_id,'work','Work & Career'),(p_user_id,'relationships','Relationships'),
    (p_user_id,'health','Health & Body'),(p_user_id,'mind','Mind & Learning'),
    (p_user_id,'creativity','Creativity'),(p_user_id,'spirit','Spirit & Purpose'),
    (p_user_id,'environment','Environment'),(p_user_id,'play','Play & Recreation')
  ON CONFLICT DO NOTHING;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
END; $$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================
-- TABLES + GRANTS + RLS + POLICIES
-- ============================================================

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  consciousness_level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_freezes INTEGER DEFAULT 3 CHECK (streak_freezes >= 0),
  curriculum_mode BOOLEAN NOT NULL DEFAULT false,
  adaptive_mode BOOLEAN DEFAULT false,
  journey_path TEXT DEFAULT 'structured',
  current_phase INTEGER DEFAULT 1,
  v_level INTEGER DEFAULT 1,
  v_level_name TEXT DEFAULT 'Awakening Seeker',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  level_0_completed BOOLEAN DEFAULT false,
  level_start_date TIMESTAMPTZ,
  phase_2_started_at TIMESTAMPTZ,
  phase_4_graduated_at TIMESTAMPTZ,
  last_vlevel_check TIMESTAMPTZ,
  last_lesson_reminder TIMESTAMPTZ,
  assessment_answers JSONB,
  preferred_traditions JSONB,
  programming_awareness TEXT[],
  curriculum_readiness_score INTEGER,
  depth_understanding_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_mode_exclusive CHECK (NOT (curriculum_mode = true AND adaptive_mode = true))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- domains
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.domains TO authenticated, anon;
GRANT ALL ON public.domains TO service_role;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Domains viewable by all" ON public.domains;
CREATE POLICY "Domains viewable by all" ON public.domains FOR SELECT USING (true);

-- pillars
CREATE TABLE IF NOT EXISTS public.pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sanskrit TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.pillars TO authenticated, anon;
GRANT ALL ON public.pillars TO service_role;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pillars viewable by all" ON public.pillars;
CREATE POLICY "Pillars viewable by all" ON public.pillars FOR SELECT USING (true);

-- traditions
CREATE TABLE IF NOT EXISTS public.traditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  origin TEXT,
  icon TEXT,
  color TEXT,
  key_teachings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.traditions TO authenticated, anon;
GRANT ALL ON public.traditions TO service_role;
ALTER TABLE public.traditions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Traditions viewable by all" ON public.traditions;
CREATE POLICY "Traditions viewable by all" ON public.traditions FOR SELECT USING (true);

-- practices
CREATE TABLE IF NOT EXISTS public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type practice_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.practices TO authenticated, anon;
GRANT ALL ON public.practices TO service_role;
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Practices viewable by all" ON public.practices;
CREATE POLICY "Practices viewable by all" ON public.practices FOR SELECT USING (true);

-- wisdom_library
CREATE TABLE IF NOT EXISTS public.wisdom_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  tradition TEXT,
  category TEXT,
  pillar_id UUID REFERENCES public.pillars(id),
  tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT ON public.wisdom_library TO authenticated, anon;
GRANT ALL ON public.wisdom_library TO service_role;
ALTER TABLE public.wisdom_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wisdom viewable by all" ON public.wisdom_library;
CREATE POLICY "Wisdom viewable by all" ON public.wisdom_library FOR SELECT USING (true);

-- curriculum_modules
CREATE TABLE IF NOT EXISTS public.curriculum_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 14,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.curriculum_modules TO authenticated, anon;
GRANT ALL ON public.curriculum_modules TO service_role;
ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Modules viewable by all" ON public.curriculum_modules;
CREATE POLICY "Modules viewable by all" ON public.curriculum_modules FOR SELECT USING (true);

-- curriculum_lessons
CREATE TABLE IF NOT EXISTS public.curriculum_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.curriculum_modules(id),
  pillar_id UUID NOT NULL REFERENCES public.pillars(id),
  title TEXT NOT NULL,
  teaching_content TEXT NOT NULL,
  practice_instructions JSONB DEFAULT '[]',
  reflection_prompts JSONB DEFAULT '[]',
  tasks JSONB DEFAULT '[]',
  practice_duration_minutes INTEGER NOT NULL DEFAULT 15,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT curriculum_lessons_module_order_unique UNIQUE (module_id, order_index)
);
GRANT SELECT ON public.curriculum_lessons TO authenticated, anon;
GRANT ALL ON public.curriculum_lessons TO service_role;
ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lessons viewable by all" ON public.curriculum_lessons;
CREATE POLICY "Lessons viewable by all" ON public.curriculum_lessons FOR SELECT USING (true);

-- chat_sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.chat_sessions;
CREATE POLICY "Users can view own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own sessions" ON public.chat_sessions;
CREATE POLICY "Users can create own sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own messages" ON public.chat_messages;
CREATE POLICY "Users can create own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_journeys
CREATE TABLE IF NOT EXISTS public.daily_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_session_id UUID REFERENCES public.chat_sessions(id),
  evening_session_id UUID REFERENCES public.chat_sessions(id),
  status journey_status NOT NULL DEFAULT 'morning_pending',
  theme TEXT,
  mood TEXT,
  analysis JSONB,
  practice_type practice_type,
  practice_duration INTEGER,
  practice_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_journeys_user_date_unique UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_journeys TO authenticated;
GRANT ALL ON public.daily_journeys TO service_role;
ALTER TABLE public.daily_journeys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own journeys" ON public.daily_journeys;
CREATE POLICY "Users can view own journeys" ON public.daily_journeys FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own journeys" ON public.daily_journeys;
CREATE POLICY "Users can create own journeys" ON public.daily_journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own journeys" ON public.daily_journeys;
CREATE POLICY "Users can update own journeys" ON public.daily_journeys FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_daily_journeys_user_date ON public.daily_journeys(user_id, date);

-- adaptive_days
CREATE TABLE IF NOT EXISTS public.adaptive_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_mood TEXT,
  energy_level INTEGER,
  intention TEXT,
  time_available INTEGER,
  day_package JSONB,
  completed_blocks JSONB DEFAULT '[]',
  capacity_changes JSONB DEFAULT '{}',
  evening_reflection JSONB,
  theme_accepted BOOLEAN DEFAULT FALSE,
  theme_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT adaptive_days_user_date_unique UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adaptive_days TO authenticated;
GRANT ALL ON public.adaptive_days TO service_role;
ALTER TABLE public.adaptive_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own adaptive days" ON public.adaptive_days;
CREATE POLICY "Users can view own adaptive days" ON public.adaptive_days FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own adaptive days" ON public.adaptive_days;
CREATE POLICY "Users can create own adaptive days" ON public.adaptive_days FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own adaptive days" ON public.adaptive_days;
CREATE POLICY "Users can update own adaptive days" ON public.adaptive_days FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_days_user_date ON public.adaptive_days(user_id, date);

-- day_chains
CREATE TABLE IF NOT EXISTS public.day_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.daily_journeys(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme TEXT NOT NULL,
  intention TEXT,
  blocks JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_chains TO authenticated;
GRANT ALL ON public.day_chains TO service_role;
ALTER TABLE public.day_chains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own chains" ON public.day_chains;
CREATE POLICY "Users can view own chains" ON public.day_chains FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own chains" ON public.day_chains;
CREATE POLICY "Users can create own chains" ON public.day_chains FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own chains" ON public.day_chains;
CREATE POLICY "Users can update own chains" ON public.day_chains FOR UPDATE USING (auth.uid() = user_id);

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.daily_journeys(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES public.domains(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.curriculum_lessons(id),
  pillar_id UUID REFERENCES public.pillars(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  status task_status NOT NULL DEFAULT 'pending',
  time_segment time_segment NOT NULL DEFAULT 'morning',
  sequence_order INTEGER,
  chain_mode BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,
  ai_response TEXT,
  feedback TEXT,
  reflection TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

-- journal_entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.daily_journeys(id) ON DELETE SET NULL,
  pillar_id UUID REFERENCES public.pillars(id),
  content TEXT NOT NULL,
  mood TEXT,
  tags JSONB,
  word_count INTEGER,
  ai_prompts JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own entries" ON public.journal_entries;
CREATE POLICY "Users can view own entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own entries" ON public.journal_entries;
CREATE POLICY "Users can create own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own entries" ON public.journal_entries;
CREATE POLICY "Users can update own entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own entries" ON public.journal_entries;
CREATE POLICY "Users can delete own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- user_capacities
CREATE TABLE IF NOT EXISTS public.user_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  attention INTEGER DEFAULT 1,
  observation INTEGER DEFAULT 1,
  presence INTEGER DEFAULT 1,
  body_awareness INTEGER DEFAULT 1,
  emotional_mastery INTEGER DEFAULT 1,
  pattern_recognition INTEGER DEFAULT 1,
  self_inquiry INTEGER DEFAULT 1,
  disidentification INTEGER DEFAULT 1,
  shadow_integration INTEGER DEFAULT 1,
  equanimity INTEGER DEFAULT 1,
  surrender INTEGER DEFAULT 1,
  unification INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_capacities TO authenticated;
GRANT ALL ON public.user_capacities TO service_role;
ALTER TABLE public.user_capacities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own capacities" ON public.user_capacities;
CREATE POLICY "Users can view own capacities" ON public.user_capacities FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own capacities" ON public.user_capacities;
CREATE POLICY "Users can update own capacities" ON public.user_capacities FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own capacities" ON public.user_capacities;
CREATE POLICY "Users can insert own capacities" ON public.user_capacities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_capacities_user_id ON public.user_capacities(user_id);
DROP TRIGGER IF EXISTS clamp_capacities_trigger ON public.user_capacities; CREATE TRIGGER clamp_capacities_trigger BEFORE INSERT OR UPDATE ON public.user_capacities FOR EACH ROW EXECUTE FUNCTION public.clamp_capacity_values();

-- user_loops
CREATE TABLE IF NOT EXISTS public.user_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loop_type TEXT NOT NULL,
  intensity_level INTEGER DEFAULT 5,
  detected_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  active_since TIMESTAMPTZ,
  integrated_at TIMESTAMPTZ,
  current_inquiry TEXT,
  patterns_identified JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_loops_user_type_unique UNIQUE (user_id, loop_type)
);
-- Add missing columns if table already existed
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'integrated_at') THEN
    ALTER TABLE public.user_loops ADD COLUMN integrated_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'intensity_level') THEN
    ALTER TABLE public.user_loops ADD COLUMN intensity_level INTEGER DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'detected_at') THEN
    ALTER TABLE public.user_loops ADD COLUMN detected_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'acknowledged_at') THEN
    ALTER TABLE public.user_loops ADD COLUMN acknowledged_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'active_since') THEN
    ALTER TABLE public.user_loops ADD COLUMN active_since TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'current_inquiry') THEN
    ALTER TABLE public.user_loops ADD COLUMN current_inquiry TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'patterns_identified') THEN
    ALTER TABLE public.user_loops ADD COLUMN patterns_identified JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_loops' AND column_name = 'notes') THEN
    ALTER TABLE public.user_loops ADD COLUMN notes TEXT;
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_loops TO authenticated;
GRANT ALL ON public.user_loops TO service_role;
ALTER TABLE public.user_loops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own loops" ON public.user_loops;
CREATE POLICY "Users can view own loops" ON public.user_loops FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own loops" ON public.user_loops;
CREATE POLICY "Users can create own loops" ON public.user_loops FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own loops" ON public.user_loops;
CREATE POLICY "Users can update own loops" ON public.user_loops FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own loops" ON public.user_loops;
CREATE POLICY "Users can delete own loops" ON public.user_loops FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_user_loops_user_active ON public.user_loops(user_id, integrated_at) WHERE integrated_at IS NULL;

-- life_domains
CREATE TABLE IF NOT EXISTS public.life_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_key TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  last_worked TIMESTAMPTZ,
  breakthroughs INTEGER DEFAULT 0,
  patterns_identified JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_domains TO authenticated;
GRANT ALL ON public.life_domains TO service_role;
ALTER TABLE public.life_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own domains" ON public.life_domains;
CREATE POLICY "Users can view own domains" ON public.life_domains FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own domains" ON public.life_domains;
CREATE POLICY "Users can create own domains" ON public.life_domains FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own domains" ON public.life_domains;
CREATE POLICY "Users can update own domains" ON public.life_domains FOR UPDATE USING (auth.uid() = user_id);

-- user_curriculum_progress
CREATE TABLE IF NOT EXISTS public.user_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_module_id UUID REFERENCES public.curriculum_modules(id),
  current_lesson_id UUID REFERENCES public.curriculum_lessons(id),
  modules_completed JSONB NOT NULL DEFAULT '[]',
  lessons_completed JSONB NOT NULL DEFAULT '[]',
  lesson_started_at JSONB,
  lesson_completed_at JSONB,
  reading_time_minutes JSONB,
  curriculum_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_curriculum_progress TO authenticated;
GRANT ALL ON public.user_curriculum_progress TO service_role;
ALTER TABLE public.user_curriculum_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_curriculum_progress;
CREATE POLICY "Users can view own progress" ON public.user_curriculum_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own progress" ON public.user_curriculum_progress;
CREATE POLICY "Users can create own progress" ON public.user_curriculum_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_curriculum_progress;
CREATE POLICY "Users can update own progress" ON public.user_curriculum_progress FOR UPDATE USING (auth.uid() = user_id);

-- lesson_task_progress
CREATE TABLE IF NOT EXISTS public.lesson_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id),
  task_index INTEGER NOT NULL,
  reflection TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_task_progress TO authenticated;
GRANT ALL ON public.lesson_task_progress TO service_role;
ALTER TABLE public.lesson_task_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own task progress" ON public.lesson_task_progress;
CREATE POLICY "Users can view own task progress" ON public.lesson_task_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own task progress" ON public.lesson_task_progress;
CREATE POLICY "Users can create own task progress" ON public.lesson_task_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own task progress" ON public.lesson_task_progress;
CREATE POLICY "Users can update own task progress" ON public.lesson_task_progress FOR UPDATE USING (auth.uid() = user_id);

-- practice_history
CREATE TABLE IF NOT EXISTS public.practice_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES public.practices(id),
  duration_minutes INTEGER NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_history TO authenticated;
GRANT ALL ON public.practice_history TO service_role;
ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own history" ON public.practice_history;
CREATE POLICY "Users can view own history" ON public.practice_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own history" ON public.practice_history;
CREATE POLICY "Users can create own history" ON public.practice_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_achievements TO service_role;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own achievements" ON public.user_achievements;
CREATE POLICY "Users can create own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_favorites
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES public.practices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT ALL ON public.user_favorites TO service_role;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own favorites" ON public.user_favorites;
CREATE POLICY "Users can create own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- tradition_progress
CREATE TABLE IF NOT EXISTS public.tradition_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tradition_id UUID NOT NULL REFERENCES public.traditions(id),
  practices_completed INTEGER DEFAULT 0,
  teachings_read JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tradition_progress TO authenticated;
GRANT ALL ON public.tradition_progress TO service_role;
ALTER TABLE public.tradition_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tradition progress" ON public.tradition_progress;
CREATE POLICY "Users can view own tradition progress" ON public.tradition_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own tradition progress" ON public.tradition_progress;
CREATE POLICY "Users can create own tradition progress" ON public.tradition_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tradition progress" ON public.tradition_progress;
CREATE POLICY "Users can update own tradition progress" ON public.tradition_progress FOR UPDATE USING (auth.uid() = user_id);

-- guru_memory
CREATE TABLE IF NOT EXISTS public.guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  context JSONB,
  importance INTEGER DEFAULT 5,
  last_referenced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add missing columns if table already existed
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guru_memory' AND column_name = 'memory_type') THEN
    ALTER TABLE public.guru_memory ADD COLUMN memory_type TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guru_memory' AND column_name = 'content') THEN
    ALTER TABLE public.guru_memory ADD COLUMN content TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guru_memory' AND column_name = 'context') THEN
    ALTER TABLE public.guru_memory ADD COLUMN context JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guru_memory' AND column_name = 'importance') THEN
    ALTER TABLE public.guru_memory ADD COLUMN importance INTEGER DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'guru_memory' AND column_name = 'last_referenced') THEN
    ALTER TABLE public.guru_memory ADD COLUMN last_referenced TIMESTAMPTZ;
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guru_memory TO authenticated;
GRANT ALL ON public.guru_memory TO service_role;
ALTER TABLE public.guru_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memory" ON public.guru_memory;
CREATE POLICY "Users can view own memory" ON public.guru_memory FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own memory" ON public.guru_memory;
CREATE POLICY "Users can create own memory" ON public.guru_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own memory" ON public.guru_memory;
CREATE POLICY "Users can update own memory" ON public.guru_memory FOR UPDATE USING (auth.uid() = user_id);

-- pattern_insights
CREATE TABLE IF NOT EXISTS public.pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  confidence_score NUMERIC,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pattern_insights TO authenticated;
GRANT ALL ON public.pattern_insights TO service_role;
ALTER TABLE public.pattern_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own insights" ON public.pattern_insights;
CREATE POLICY "Users can view own insights" ON public.pattern_insights FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own insights" ON public.pattern_insights;
CREATE POLICY "Users can create own insights" ON public.pattern_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- capacity_history
CREATE TABLE IF NOT EXISTS public.capacity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity_key TEXT NOT NULL,
  from_value INTEGER,
  to_value INTEGER NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capacity_history TO authenticated;
GRANT ALL ON public.capacity_history TO service_role;
ALTER TABLE public.capacity_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own capacity history" ON public.capacity_history;
CREATE POLICY "Users can view own capacity history" ON public.capacity_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own capacity history" ON public.capacity_history;
CREATE POLICY "Users can create own capacity history" ON public.capacity_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- v_level_history
CREATE TABLE IF NOT EXISTS public.v_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_level INTEGER,
  to_level INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  triggered_by TEXT,
  markers_detected JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.v_level_history TO authenticated;
GRANT ALL ON public.v_level_history TO service_role;
ALTER TABLE public.v_level_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own vlevel history" ON public.v_level_history;
CREATE POLICY "Users can view own vlevel history" ON public.v_level_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own vlevel history" ON public.v_level_history;
CREATE POLICY "Users can create own vlevel history" ON public.v_level_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- streak_history
CREATE TABLE IF NOT EXISTS public.streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  action TEXT NOT NULL,
  streak_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.streak_history TO authenticated;
GRANT ALL ON public.streak_history TO service_role;
ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own streak history" ON public.streak_history;
CREATE POLICY "Users can view own streak history" ON public.streak_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own streak history" ON public.streak_history;
CREATE POLICY "Users can create own streak history" ON public.streak_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- xp_transactions
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  multiplier NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.xp_transactions TO authenticated;
GRANT ALL ON public.xp_transactions TO service_role;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own xp" ON public.xp_transactions;
CREATE POLICY "Users can view own xp" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own xp" ON public.xp_transactions;
CREATE POLICY "Users can create own xp" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- crisis_events
CREATE TABLE IF NOT EXISTS public.crisis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity_level TEXT NOT NULL,
  trigger_signals TEXT[],
  detected_patterns JSONB,
  ai_response TEXT,
  resources_provided TEXT[],
  grounding_completed BOOLEAN DEFAULT false,
  follow_up_completed BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crisis_events TO authenticated;
GRANT ALL ON public.crisis_events TO service_role;
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own crisis events" ON public.crisis_events;
CREATE POLICY "Users can view own crisis events" ON public.crisis_events FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own crisis events" ON public.crisis_events;
CREATE POLICY "Users can create own crisis events" ON public.crisis_events FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own crisis events" ON public.crisis_events;
CREATE POLICY "Users can update own crisis events" ON public.crisis_events FOR UPDATE USING (auth.uid() = user_id);

-- notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  morning_reminder_time TIME DEFAULT '08:00',
  evening_reminder_time TIME DEFAULT '20:00',
  optimal_morning_time TIME,
  optimal_evening_time TIME,
  streak_warning_enabled BOOLEAN DEFAULT true,
  lesson_reminder_enabled BOOLEAN DEFAULT true,
  voice_enabled BOOLEAN DEFAULT false,
  voice_id TEXT,
  voice_speed NUMERIC DEFAULT 1.0,
  voice_stability NUMERIC DEFAULT 0.5,
  voice_similarity_boost NUMERIC DEFAULT 0.75,
  voice_style NUMERIC DEFAULT 0,
  auto_speak_responses BOOLEAN DEFAULT false,
  engagement_pattern JSONB,
  notification_history JSONB,
  last_notification_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own prefs" ON public.notification_preferences;
CREATE POLICY "Users can view own prefs" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own prefs" ON public.notification_preferences;
CREATE POLICY "Users can create own prefs" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own prefs" ON public.notification_preferences;
CREATE POLICY "Users can update own prefs" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subs" ON public.push_subscriptions;
CREATE POLICY "Users can view own subs" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own subs" ON public.push_subscriptions;
CREATE POLICY "Users can create own subs" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own subs" ON public.push_subscriptions;
CREATE POLICY "Users can update own subs" ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own subs" ON public.push_subscriptions;
CREATE POLICY "Users can delete own subs" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- notification_logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB,
  opened_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  action_taken TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_logs TO service_role;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own logs" ON public.notification_logs;
CREATE POLICY "Users can view own logs" ON public.notification_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own logs" ON public.notification_logs;
CREATE POLICY "Users can create own logs" ON public.notification_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own logs" ON public.notification_logs;
CREATE POLICY "Users can update own logs" ON public.notification_logs FOR UPDATE USING (auth.uid() = user_id);

-- scheduled_sessions
CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  notes JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_sessions TO authenticated;
GRANT ALL ON public.scheduled_sessions TO service_role;
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own scheduled" ON public.scheduled_sessions;
CREATE POLICY "Users can view own scheduled" ON public.scheduled_sessions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own scheduled" ON public.scheduled_sessions;
CREATE POLICY "Users can create own scheduled" ON public.scheduled_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own scheduled" ON public.scheduled_sessions;
CREATE POLICY "Users can update own scheduled" ON public.scheduled_sessions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own scheduled" ON public.scheduled_sessions;
CREATE POLICY "Users can delete own scheduled" ON public.scheduled_sessions FOR DELETE USING (auth.uid() = user_id);

-- day_feedback
CREATE TABLE IF NOT EXISTS public.day_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.daily_journeys(id),
  adaptive_day_id UUID REFERENCES public.adaptive_days(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  rating INTEGER NOT NULL,
  feedback_text TEXT,
  categories TEXT[],
  pain_points TEXT,
  feature_suggestions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_feedback TO authenticated;
GRANT ALL ON public.day_feedback TO service_role;
ALTER TABLE public.day_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.day_feedback;
CREATE POLICY "Users can view own feedback" ON public.day_feedback FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own feedback" ON public.day_feedback;
CREATE POLICY "Users can create own feedback" ON public.day_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- rate_limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, function_name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limits TO authenticated;
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own rate limits" ON public.rate_limits;
CREATE POLICY "Users can insert own rate limits" ON public.rate_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limits;
CREATE POLICY "Users can view own rate limits" ON public.rate_limits FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own rate limits" ON public.rate_limits;
CREATE POLICY "Users can update own rate limits" ON public.rate_limits FOR UPDATE USING (auth.uid() = user_id);

-- engine_logs
CREATE TABLE IF NOT EXISTS public.engine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  result JSONB,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engine_logs TO authenticated;
GRANT ALL ON public.engine_logs TO service_role;
ALTER TABLE public.engine_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own engine logs" ON public.engine_logs;
CREATE POLICY "Users can view own engine logs" ON public.engine_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own engine logs" ON public.engine_logs;
CREATE POLICY "Users can create own engine logs" ON public.engine_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- security_audit_log
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Only admins can view audit log" ON public.security_audit_log;
CREATE POLICY "Only admins can view audit log" ON public.security_audit_log FOR SELECT USING (public.has_role('admin', auth.uid()));

-- data_export_requests
CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  tables_included TEXT[],
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_export_requests TO authenticated;
GRANT ALL ON public.data_export_requests TO service_role;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own exports" ON public.data_export_requests;
CREATE POLICY "Users can view own exports" ON public.data_export_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own exports" ON public.data_export_requests;
CREATE POLICY "Users can create own exports" ON public.data_export_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- offline_sync_queue
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  record_data JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offline_sync_queue TO authenticated;
GRANT ALL ON public.offline_sync_queue TO service_role;
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own queue" ON public.offline_sync_queue;
CREATE POLICY "Users can view own queue" ON public.offline_sync_queue FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own queue" ON public.offline_sync_queue;
CREATE POLICY "Users can create own queue" ON public.offline_sync_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own queue" ON public.offline_sync_queue;
CREATE POLICY "Users can update own queue" ON public.offline_sync_queue FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own queue" ON public.offline_sync_queue;
CREATE POLICY "Users can delete own queue" ON public.offline_sync_queue FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles; CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_daily_journeys_updated_at ON public.daily_journeys; CREATE TRIGGER update_daily_journeys_updated_at BEFORE UPDATE ON public.daily_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_adaptive_days_updated_at ON public.adaptive_days; CREATE TRIGGER update_adaptive_days_updated_at BEFORE UPDATE ON public.adaptive_days FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_day_chains_updated_at ON public.day_chains; CREATE TRIGGER update_day_chains_updated_at BEFORE UPDATE ON public.day_chains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks; CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON public.journal_entries; CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_capacities_updated_at ON public.user_capacities; CREATE TRIGGER update_user_capacities_updated_at BEFORE UPDATE ON public.user_capacities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_loops_updated_at ON public.user_loops; CREATE TRIGGER update_user_loops_updated_at BEFORE UPDATE ON public.user_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_life_domains_updated_at ON public.life_domains; CREATE TRIGGER update_life_domains_updated_at BEFORE UPDATE ON public.life_domains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_curriculum_progress_updated_at ON public.user_curriculum_progress; CREATE TRIGGER update_user_curriculum_progress_updated_at BEFORE UPDATE ON public.user_curriculum_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_tradition_progress_updated_at ON public.tradition_progress; CREATE TRIGGER update_tradition_progress_updated_at BEFORE UPDATE ON public.tradition_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences; CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON public.push_subscriptions; CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE + CAPACITIES + PREFS ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_capacities (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT (user_id, role) DO NOTHING;
  PERFORM public.initialize_life_domains(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_journey ON public.tasks(user_id, journey_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_history_user_id ON public.practice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_guru_memory_user_type ON public.guru_memory(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_id ON public.pattern_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON public.streak_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);