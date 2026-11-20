-- ============================================================
-- SOULSCAPE COMPLETE DATABASE SCHEMA
-- This file documents the complete schema for recreating after remix
-- Generated: 2026-01-20
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE public.journey_status AS ENUM (
  'morning_pending', 
  'tasks_active', 
  'evening_pending', 
  'practice_pending', 
  'completed'
);

CREATE TYPE public.task_status AS ENUM (
  'pending', 
  'in_progress', 
  'completed', 
  'skipped'
);

CREATE TYPE public.practice_type AS ENUM (
  'meditation', 
  'breathwork', 
  'movement', 
  'journaling'
);

CREATE TYPE public.time_segment AS ENUM (
  'morning', 
  'afternoon', 
  'evening', 
  'night'
);

CREATE TYPE public.app_role AS ENUM (
  'admin', 
  'moderator', 
  'user'
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Calculate level from XP (100 XP per level)
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(xp_amount / 100)::INTEGER + 1);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Rate limiting check
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_function_name TEXT,
  p_user_id UUID,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*) INTO v_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND function_name = p_function_name
    AND window_start > v_window_start;
  
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO rate_limits (user_id, function_name, window_start, request_count)
  VALUES (p_user_id, p_function_name, NOW(), 1)
  ON CONFLICT (id) DO UPDATE SET request_count = rate_limits.request_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Clamp capacity values to 0-10
CREATE OR REPLACE FUNCTION clamp_capacity_values()
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
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Initialize life domains for new user
CREATE OR REPLACE FUNCTION public.initialize_life_domains(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO life_domains (user_id, domain_key, domain_name)
  VALUES 
    (p_user_id, 'work', 'Work & Career'),
    (p_user_id, 'relationships', 'Relationships'),
    (p_user_id, 'health', 'Health & Body'),
    (p_user_id, 'mind', 'Mind & Learning'),
    (p_user_id, 'creativity', 'Creativity'),
    (p_user_id, 'spirit', 'Spirit & Purpose'),
    (p_user_id, 'environment', 'Environment'),
    (p_user_id, 'play', 'Play & Recreation')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Cleanup old records
CREATE OR REPLACE FUNCTION cleanup_old_records()
RETURNS void AS $$
DECLARE
  deleted_engine_logs INT;
  deleted_rate_limits INT;
  deleted_notification_logs INT;
BEGIN
  DELETE FROM engine_logs WHERE created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted_engine_logs = ROW_COUNT;
  
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 day';
  GET DIAGNOSTICS deleted_rate_limits = ROW_COUNT;
  
  DELETE FROM notification_logs WHERE sent_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_notification_logs = ROW_COUNT;
  
  PERFORM reset_stuck_tasks();
  
  INSERT INTO security_audit_log (event_type, event_details, severity)
  VALUES ('scheduled_cleanup', jsonb_build_object(
    'cleaned_at', NOW(),
    'engine_logs_deleted', deleted_engine_logs,
    'rate_limits_deleted', deleted_rate_limits,
    'notification_logs_deleted', deleted_notification_logs
  ), 'info');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Reset stuck tasks
CREATE OR REPLACE FUNCTION reset_stuck_tasks()
RETURNS void AS $$
BEGIN
  UPDATE tasks 
  SET status = 'pending', updated_at = NOW()
  WHERE status = 'in_progress' 
  AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- GDPR data export
CREATE OR REPLACE FUNCTION public.get_user_data_export(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE user_id = p_user_id),
    'journal_entries', (SELECT json_agg(row_to_json(j)) FROM journal_entries j WHERE user_id = p_user_id),
    'tasks', (SELECT json_agg(row_to_json(t)) FROM tasks t WHERE user_id = p_user_id),
    'practice_history', (SELECT json_agg(row_to_json(ph)) FROM practice_history ph WHERE user_id = p_user_id),
    'capacities', (SELECT row_to_json(c) FROM user_capacities c WHERE user_id = p_user_id),
    'loops', (SELECT json_agg(row_to_json(l)) FROM user_loops l WHERE user_id = p_user_id),
    'achievements', (SELECT json_agg(row_to_json(a)) FROM user_achievements a WHERE user_id = p_user_id),
    'exported_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Role check
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (user data)
CREATE TABLE public.profiles (
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Domains (reference table)
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Domains viewable by authenticated" ON public.domains FOR SELECT TO authenticated USING (true);

-- Pillars (reference table)
CREATE TABLE public.pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sanskrit TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pillars viewable by authenticated" ON public.pillars FOR SELECT TO authenticated USING (true);

-- Traditions (reference table)
CREATE TABLE public.traditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  origin TEXT,
  icon TEXT,
  color TEXT,
  key_teachings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.traditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Traditions viewable by authenticated" ON public.traditions FOR SELECT TO authenticated USING (true);

-- Practices (library)
CREATE TABLE public.practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type practice_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Practices viewable by authenticated" ON public.practices FOR SELECT TO authenticated USING (true);

-- Wisdom Library
CREATE TABLE public.wisdom_library (
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

ALTER TABLE public.wisdom_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wisdom viewable by authenticated" ON public.wisdom_library FOR SELECT TO authenticated USING (true);

-- Curriculum Modules
CREATE TABLE public.curriculum_modules (
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

ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules viewable by authenticated" ON public.curriculum_modules FOR SELECT TO authenticated USING (true);

-- Curriculum Lessons
CREATE TABLE public.curriculum_lessons (
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

ALTER TABLE public.curriculum_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons viewable by authenticated" ON public.curriculum_lessons FOR SELECT TO authenticated USING (true);

-- Chat Sessions
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Journeys (Structured Mode)
CREATE TABLE public.daily_journeys (
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

ALTER TABLE public.daily_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own journeys" ON public.daily_journeys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journeys" ON public.daily_journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journeys" ON public.daily_journeys FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_daily_journeys_user_date ON public.daily_journeys(user_id, date);

-- Adaptive Days (Adaptive Mode)
CREATE TABLE public.adaptive_days (
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

ALTER TABLE public.adaptive_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own adaptive days" ON public.adaptive_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own adaptive days" ON public.adaptive_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own adaptive days" ON public.adaptive_days FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_adaptive_days_user_date ON public.adaptive_days(user_id, date);

-- Day Chains (Structured Mode blocks)
CREATE TABLE public.day_chains (
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

ALTER TABLE public.day_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chains" ON public.day_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chains" ON public.day_chains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chains" ON public.day_chains FOR UPDATE USING (auth.uid() = user_id);

-- Tasks
CREATE TABLE public.tasks (
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

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);

-- Journal Entries
CREATE TABLE public.journal_entries (
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

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- User Capacities
CREATE TABLE public.user_capacities (
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

ALTER TABLE public.user_capacities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own capacities" ON public.user_capacities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own capacities" ON public.user_capacities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capacities" ON public.user_capacities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_capacities_user_id ON public.user_capacities(user_id);

CREATE TRIGGER clamp_capacities_trigger
BEFORE INSERT OR UPDATE ON user_capacities
FOR EACH ROW EXECUTE FUNCTION clamp_capacity_values();

-- User Loops
CREATE TABLE public.user_loops (
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

ALTER TABLE public.user_loops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own loops" ON public.user_loops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own loops" ON public.user_loops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loops" ON public.user_loops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loops" ON public.user_loops FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_user_loops_user_active ON public.user_loops(user_id, integrated_at) WHERE integrated_at IS NULL;

-- Life Domains (user-specific)
CREATE TABLE public.life_domains (
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

ALTER TABLE public.life_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own domains" ON public.life_domains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own domains" ON public.life_domains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own domains" ON public.life_domains FOR UPDATE USING (auth.uid() = user_id);

-- User Curriculum Progress
CREATE TABLE public.user_curriculum_progress (
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

ALTER TABLE public.user_curriculum_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_curriculum_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.user_curriculum_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_curriculum_progress FOR UPDATE USING (auth.uid() = user_id);

-- Lesson Task Progress
CREATE TABLE public.lesson_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.curriculum_lessons(id),
  task_index INTEGER NOT NULL,
  reflection TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lesson_task_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own task progress" ON public.lesson_task_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own task progress" ON public.lesson_task_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task progress" ON public.lesson_task_progress FOR UPDATE USING (auth.uid() = user_id);

-- Practice History
CREATE TABLE public.practice_history (
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

ALTER TABLE public.practice_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history" ON public.practice_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON public.practice_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Favorites
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_id UUID REFERENCES public.practices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Tradition Progress
CREATE TABLE public.tradition_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tradition_id UUID NOT NULL REFERENCES public.traditions(id),
  practices_completed INTEGER DEFAULT 0,
  teachings_read JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tradition_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tradition progress" ON public.tradition_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tradition progress" ON public.tradition_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tradition progress" ON public.tradition_progress FOR UPDATE USING (auth.uid() = user_id);

-- Guru Memory
CREATE TABLE public.guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  context JSONB,
  importance INTEGER DEFAULT 5,
  last_referenced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.guru_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memory" ON public.guru_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own memory" ON public.guru_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory" ON public.guru_memory FOR UPDATE USING (auth.uid() = user_id);

-- Pattern Insights
CREATE TABLE public.pattern_insights (
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

ALTER TABLE public.pattern_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own insights" ON public.pattern_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own insights" ON public.pattern_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Capacity History
CREATE TABLE public.capacity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity_key TEXT NOT NULL,
  from_value INTEGER,
  to_value INTEGER NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.capacity_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own capacity history" ON public.capacity_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own capacity history" ON public.capacity_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- V-Level History
CREATE TABLE public.v_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_level INTEGER,
  to_level INTEGER NOT NULL,
  level_name TEXT NOT NULL,
  triggered_by TEXT,
  markers_detected JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.v_level_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vlevel history" ON public.v_level_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own vlevel history" ON public.v_level_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streak History
CREATE TABLE public.streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  action TEXT NOT NULL,
  streak_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak history" ON public.streak_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own streak history" ON public.streak_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Transactions
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  multiplier NUMERIC DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own xp" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crisis Events
CREATE TABLE public.crisis_events (
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

ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own crisis events" ON public.crisis_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own crisis events" ON public.crisis_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own crisis events" ON public.crisis_events FOR UPDATE USING (auth.uid() = user_id);

-- Notification Preferences
CREATE TABLE public.notification_preferences (
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

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prefs" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own prefs" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prefs" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Push Subscriptions
CREATE TABLE public.push_subscriptions (
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

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subs" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subs" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subs" ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subs" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Notification Logs
CREATE TABLE public.notification_logs (
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

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.notification_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logs" ON public.notification_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logs" ON public.notification_logs FOR UPDATE USING (auth.uid() = user_id);

-- Scheduled Sessions
CREATE TABLE public.scheduled_sessions (
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

ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scheduled" ON public.scheduled_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own scheduled" ON public.scheduled_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scheduled" ON public.scheduled_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scheduled" ON public.scheduled_sessions FOR DELETE USING (auth.uid() = user_id);

-- Day Feedback
CREATE TABLE public.day_feedback (
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

ALTER TABLE public.day_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feedback" ON public.day_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feedback" ON public.day_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rate Limits
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, function_name)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own rate limits" ON public.rate_limits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own rate limits" ON public.rate_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own rate limits" ON public.rate_limits FOR UPDATE USING (auth.uid() = user_id);

-- Engine Logs
CREATE TABLE public.engine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  result JSONB,
  error TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.engine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own engine logs" ON public.engine_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own engine logs" ON public.engine_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security Audit Log
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view audit log" ON public.security_audit_log FOR SELECT 
USING (has_role('admin', auth.uid()));

-- Data Export Requests (GDPR)
CREATE TABLE public.data_export_requests (
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

ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exports" ON public.data_export_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own exports" ON public.data_export_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Offline Sync Queue
CREATE TABLE public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action_type TEXT NOT NULL,
  record_data JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own queue" ON public.offline_sync_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own queue" ON public.offline_sync_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue" ON public.offline_sync_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own queue" ON public.offline_sync_queue FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_journeys_updated_at BEFORE UPDATE ON daily_journeys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adaptive_days_updated_at BEFORE UPDATE ON adaptive_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_chains_updated_at BEFORE UPDATE ON day_chains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_capacities_updated_at BEFORE UPDATE ON user_capacities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_loops_updated_at BEFORE UPDATE ON user_loops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_life_domains_updated_at BEFORE UPDATE ON life_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_curriculum_progress_updated_at BEFORE UPDATE ON user_curriculum_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tradition_progress_updated_at BEFORE UPDATE ON tradition_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PROFILE AUTO-CREATION TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_capacities (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  PERFORM initialize_life_domains(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_tasks_user_journey ON public.tasks(user_id, journey_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_practice_history_user_id ON public.practice_history(user_id);
CREATE INDEX idx_guru_memory_user_type ON public.guru_memory(user_id, memory_type);
CREATE INDEX idx_pattern_insights_user_id ON public.pattern_insights(user_id);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_streak_history_user_date ON public.streak_history(user_id, date);
