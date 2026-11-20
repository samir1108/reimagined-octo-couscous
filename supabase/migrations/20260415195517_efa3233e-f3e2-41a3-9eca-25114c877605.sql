
-- ============================================
-- ENHANCE existing user_practice_levels (if it exists)
-- ============================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_practice_levels' AND schemaname = 'public') THEN
    ALTER TABLE public.user_practice_levels
      ADD COLUMN IF NOT EXISTS emotional_healing INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS loop_dissolution INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- TABLE: user_spiritual_dna
-- ============================================
CREATE TABLE public.user_spiritual_dna (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anchor_path TEXT DEFAULT 'observation',
  growth_path TEXT DEFAULT 'self_inquiry',
  brain_dominance TEXT NOT NULL DEFAULT 'balanced',
  circadian_type TEXT NOT NULL DEFAULT 'flexible',
  tradition_affinity TEXT DEFAULT NULL,
  life_stage TEXT NOT NULL DEFAULT 'unknown',
  life_stage_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  app_relationship_phase TEXT NOT NULL DEFAULT 'tool',
  app_relationship_day INTEGER NOT NULL DEFAULT 0,
  identity_band INTEGER NOT NULL DEFAULT 0,
  identity_band_name TEXT NOT NULL DEFAULT 'Unconscious Conditioning',
  available_slots TEXT[] NOT NULL DEFAULT '{morning}'::text[],
  primary_slot TEXT NOT NULL DEFAULT 'morning',
  skipped_slots TEXT[] NOT NULL DEFAULT '{}'::text[],
  flexible_mode BOOLEAN NOT NULL DEFAULT false,
  weekday_duration INTEGER NOT NULL DEFAULT 15,
  weekend_duration INTEGER NOT NULL DEFAULT 30,
  lifetime_breakthroughs JSONB NOT NULL DEFAULT '[]'::jsonb,
  guru_resonance JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_gurus_encountered INTEGER NOT NULL DEFAULT 0,
  lifetime_phase TEXT NOT NULL DEFAULT 'awakening',
  lifetime_phase_day INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_spiritual_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spiritual dna"
  ON public.user_spiritual_dna FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: user_speed_profile
-- ============================================
CREATE TABLE public.user_speed_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  speed_type TEXT NOT NULL DEFAULT 'steady',
  auto_detected BOOLEAN NOT NULL DEFAULT false,
  sessions_per_level JSONB NOT NULL DEFAULT '{}'::jsonb,
  detection_reason TEXT DEFAULT NULL,
  avg_quality NUMERIC NOT NULL DEFAULT 0.5,
  avg_consistency NUMERIC NOT NULL DEFAULT 0.5,
  quality_trend TEXT NOT NULL DEFAULT 'stable',
  last_detected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_speed_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own speed profile"
  ON public.user_speed_profile FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: practice_sessions_v2
-- ============================================
CREATE TABLE public.practice_sessions_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_type TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  quality_score NUMERIC NOT NULL DEFAULT 0.5,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  dimension_impacts JSONB NOT NULL DEFAULT '{"thought":0,"emotion":0,"body":0,"awareness":0,"action":0,"connection":0}'::jsonb,
  loop_relevant TEXT DEFAULT NULL,
  chakra_relevant TEXT DEFAULT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT DEFAULT 'morning',
  repeat_count INTEGER NOT NULL DEFAULT 0,
  template_id TEXT DEFAULT NULL,
  mood_before TEXT DEFAULT NULL,
  mood_after TEXT DEFAULT NULL,
  energy_before INTEGER DEFAULT NULL,
  energy_after INTEGER DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.practice_sessions_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own practice sessions v2"
  ON public.practice_sessions_v2 FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_psv2_user_date ON public.practice_sessions_v2(user_id, session_date);
CREATE INDEX idx_psv2_practice ON public.practice_sessions_v2(user_id, practice_type, level);

-- ============================================
-- TABLE: cross_pollination_log
-- ============================================
CREATE TABLE public.cross_pollination_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_practice TEXT NOT NULL,
  target_practice TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'plateau',
  effectiveness_score NUMERIC DEFAULT NULL,
  plateau_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  suggestion_accepted BOOLEAN DEFAULT NULL,
  sessions_before_plateau INTEGER NOT NULL DEFAULT 0,
  user_learning_map JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cross_pollination_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cross pollination"
  ON public.cross_pollination_log FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: specialty_activations
-- ============================================
CREATE TABLE public.specialty_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  practice_type TEXT NOT NULL,
  conditions_met JSONB NOT NULL DEFAULT '[]'::jsonb,
  conditions_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ DEFAULT NULL,
  deactivated_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, practice_type)
);

ALTER TABLE public.specialty_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own specialty activations"
  ON public.specialty_activations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: life_domain_scores
-- ============================================
CREATE TABLE public.life_domain_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 5.0,
  trend TEXT NOT NULL DEFAULT 'stable',
  last_signal_at TIMESTAMPTZ DEFAULT NULL,
  signal_count INTEGER NOT NULL DEFAULT 0,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  stressors TEXT[] NOT NULL DEFAULT '{}'::text[],
  strengths TEXT[] NOT NULL DEFAULT '{}'::text[],
  growth_edges TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);

ALTER TABLE public.life_domain_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own life domain scores"
  ON public.life_domain_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: user_daily_gates
-- ============================================
CREATE TABLE public.user_daily_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_done BOOLEAN NOT NULL DEFAULT false,
  morning_at TIMESTAMPTZ DEFAULT NULL,
  morning_quality NUMERIC DEFAULT NULL,
  midday_done BOOLEAN NOT NULL DEFAULT false,
  midday_at TIMESTAMPTZ DEFAULT NULL,
  midday_quality NUMERIC DEFAULT NULL,
  evening_done BOOLEAN NOT NULL DEFAULT false,
  evening_at TIMESTAMPTZ DEFAULT NULL,
  evening_quality NUMERIC DEFAULT NULL,
  night_done BOOLEAN NOT NULL DEFAULT false,
  night_at TIMESTAMPTZ DEFAULT NULL,
  night_quality NUMERIC DEFAULT NULL,
  night_adapted BOOLEAN NOT NULL DEFAULT false,
  steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, gate_date)
);

ALTER TABLE public.user_daily_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own daily gates"
  ON public.user_daily_gates FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_daily_gates_date ON public.user_daily_gates(user_id, gate_date DESC);

-- ============================================
-- TABLE: curiosity_queue
-- ============================================
CREATE TABLE public.curiosity_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  confidence_scores JSONB NOT NULL DEFAULT '{"preferred_time":0.5,"learning_style":0.5,"evening_energy":0.5,"journaling_preference":0.5,"guru_resonance_reason":0.5,"life_stage":0.5,"practice_preference":0.5,"stress_triggers":0.5,"motivation_style":0.5}'::jsonb,
  active_question TEXT DEFAULT NULL,
  active_question_context TEXT DEFAULT NULL,
  active_question_impact TEXT DEFAULT 'medium',
  asked_at TIMESTAMPTZ DEFAULT NULL,
  cooldown_until TIMESTAMPTZ DEFAULT NULL,
  total_questions_asked INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  total_questions_skipped INTEGER NOT NULL DEFAULT 0,
  answer_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.curiosity_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own curiosity queue"
  ON public.curiosity_queue FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_updated_at_user_spiritual_dna
  BEFORE UPDATE ON public.user_spiritual_dna
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_speed_profile
  BEFORE UPDATE ON public.user_speed_profile
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_specialty_activations
  BEFORE UPDATE ON public.specialty_activations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_life_domain_scores
  BEFORE UPDATE ON public.life_domain_scores
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_daily_gates
  BEFORE UPDATE ON public.user_daily_gates
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at_curiosity_queue
  BEFORE UPDATE ON public.curiosity_queue
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================
-- Enable realtime for key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_daily_gates;
