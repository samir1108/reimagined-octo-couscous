-- ============================================================
-- Migration: 20260926000003_recreate_all_missing_tables.sql
-- Purpose: Recreate all tables + policies/indexes/triggers/grants
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLE DEFINITIONS
-- ============================================================

-- 1. practice_insights (source: 20260514140832_ae73f2c8-f825-4d0a-b54e-67c440c2b024.sql)
CREATE TABLE IF NOT EXISTS public.practice_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_key TEXT NOT NULL,
  insight TEXT NOT NULL CHECK (char_length(insight) BETWEEN 1 AND 240),
  user_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. specialty_activations (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.specialty_activations (
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

-- 3. graduation_reports (source: 20260425152728_a1558618-84c7-4114-be03-72b261ebe0f8.sql)
CREATE TABLE IF NOT EXISTS public.graduation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Core identity (AI-generated)
  archetype TEXT NOT NULL,
  archetype_subtype TEXT,
  archetype_reason TEXT NOT NULL,
  one_sentence TEXT NOT NULL,
  
  -- Practice signature
  pull_skill TEXT,
  avoid_skill TEXT,
  home_skills TEXT[] DEFAULT '{}',
  
  -- Constitutional pattern
  dominant_guna TEXT,
  guna_ratio JSONB DEFAULT '{}',
  dosha_pattern TEXT,
  
  -- Loops & shadow
  active_loops JSONB DEFAULT '[]',
  dissolved_loops JSONB DEFAULT '[]',
  shadow_map JSONB DEFAULT '{}',
  bypass_risk TEXT,
  
  -- Lifetime path
  recommended_lineage TEXT,
  recommended_gurus TEXT[] DEFAULT '{}',
  pace_profile TEXT DEFAULT 'steady',
  companion_tone TEXT DEFAULT 'gentle',
  priority_domain TEXT,
  
  -- Aggregates
  avg_mood NUMERIC,
  avg_energy NUMERIC,
  avg_clarity NUMERIC,
  truth_arc NUMERIC,
  best_insight TEXT,
  
  -- Raw payload + metadata
  full_analysis JSONB DEFAULT '{}',
  source_counts JSONB DEFAULT '{}',
  model_used TEXT,
  
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. evening_reflections (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
CREATE TABLE IF NOT EXISTS public.evening_reflections (
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

-- 5. mirror_readings (source: 20260718121554_77adaf2b-650d-4e89-bcc5-d69ad717c564.sql)
CREATE TABLE IF NOT EXISTS public.mirror_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mirror_number INTEGER NOT NULL CHECK (mirror_number BETWEEN 1 AND 38),
  mirror_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  module TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
  band TEXT NOT NULL DEFAULT 'preliminary' CHECK (band IN ('preliminary','inferred','read','locked')),
  evidence TEXT,
  reading_note TEXT,
  source TEXT NOT NULL DEFAULT 'elder_onboarding',
  day_zero BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mirror_number)
);

-- 6. ai_usage_log (source: 20260308171540_e015389b-a05e-4ce7-9f2a-5531c21bf02e.sql)
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  model text DEFAULT 'unknown',
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_paise integer NOT NULL DEFAULT 0,
  charged_paise integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. fused_signals (source: 20260508113831_03ef662c-d86a-4916-b90d-447157d15f5b.sql)
CREATE TABLE IF NOT EXISTS public.fused_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  hrv_norm numeric, -- 0-1
  stress_norm numeric, -- 0-1
  focus_norm numeric, -- 0-1
  burnout_risk numeric, -- 0-1
  recommended_action text,
  detected_loops text[] NOT NULL DEFAULT '{}',
  inputs_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. collective_meditations (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.collective_meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'silent_sit',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'upcoming',
  participant_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. user_credits (source: 20260308165915_615d2a7d-edf6-46e1-bcd1-186a0d3eb7e5.sql)
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance_paise integer NOT NULL DEFAULT 0,
  total_purchased_paise integer NOT NULL DEFAULT 0,
  total_used_paise integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. daily_dimension_summary (source: 20260406180304_7abdccd0-8f82-4910-871e-1b414685c599.sql)
CREATE TABLE IF NOT EXISTS public.daily_dimension_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  summary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  thought_score NUMERIC NOT NULL DEFAULT 0,
  emotion_score NUMERIC NOT NULL DEFAULT 0,
  body_score NUMERIC NOT NULL DEFAULT 0,
  awareness_score NUMERIC NOT NULL DEFAULT 0,
  signal_count INTEGER NOT NULL DEFAULT 0,
  confidence_avg NUMERIC NOT NULL DEFAULT 0,
  is_calibration_day BOOLEAN NOT NULL DEFAULT false,
  calibration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, summary_date)
);

-- 11. meeting_nudges (source: 20260508113831_03ef662c-d86a-4916-b90d-447157d15f5b.sql)
CREATE TABLE IF NOT EXISTS public.meeting_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'google_calendar' | 'outlook'
  external_event_id text NOT NULL,
  title text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  kind text NOT NULL DEFAULT 'pre', -- 'pre' | 'post'
  fired_at timestamptz,
  dismissed boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, external_event_id, kind)
);

-- 12. user_consciousness_profile (source: 20260307204907_b96e063f-af4f-49d4-8921-fd0e64f4a7fd.sql)
CREATE TABLE IF NOT EXISTS public.user_consciousness_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  overall_band numeric NOT NULL DEFAULT 0,
  dimension_bands jsonb NOT NULL DEFAULT '{"thought": 0, "emotion": 0, "body": 0, "awareness": 0}'::jsonb,
  life_domains jsonb NOT NULL DEFAULT '{}'::jsonb,
  active_loops jsonb NOT NULL DEFAULT '[]'::jsonb,
  journey_day integer NOT NULL DEFAULT 1,
  journey_phase text NOT NULL DEFAULT 'assessment',
  assessment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_assessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. program_enrollments (source: 20260308201139_69774727-fe79-40e0-8ba3-061782b8d541.sql)
CREATE TABLE IF NOT EXISTS public.program_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  completed_at TIMESTAMP WITH TIME ZONE,
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  last_completed_day_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, program_id)
);

-- 14. daily_tasks (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
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

-- 15. cross_pollination_log (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.cross_pollination_log (
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

-- 16. life_domain_scores (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.life_domain_scores (
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

-- 17. dimension_map_scores (source: 20260415205105_c28bd5a6-ba12-4966-a639-3d918a614960.sql)
CREATE TABLE IF NOT EXISTS public.dimension_map_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  dimension_name TEXT NOT NULL,
  score NUMERIC(4,2) DEFAULT 0,
  signal_count INTEGER DEFAULT 0,
  discovery_source TEXT DEFAULT 'passive',
  trend TEXT DEFAULT 'stable',
  last_signal_at TIMESTAMPTZ,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, dimension_name)
);

-- 18. loop_attributions (source: 20260508123330_73ff0226-cd05-429d-954a-db59cfb68dca.sql)
CREATE TABLE IF NOT EXISTS public.loop_attributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  loop_name TEXT,
  window_label TEXT NOT NULL CHECK (window_label IN ('3h','7d')),
  confidence NUMERIC NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  contributing_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

-- 19. sales_inquiries (source: 20260501102356_868feba8-ca3d-479f-b229-388cf684320c.sql)
CREATE TABLE IF NOT EXISTS public.sales_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  company_size TEXT,
  role TEXT,
  message TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'sales' CHECK (inquiry_type IN ('pilot','demo','sales')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','closed')),
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. mirror_progress (source: 20260508081335_f1975fda-6993-4194-a7f1-99e0ae9b6147.sql)
CREATE TABLE IF NOT EXISTS public.mirror_progress (
  user_id uuid PRIMARY KEY,
  master_mirror_index integer NOT NULL DEFAULT 0,
  master_mirror_completed boolean NOT NULL DEFAULT false,
  sessions_since_integration integer NOT NULL DEFAULT 0,
  last_integration_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 21. pre_journey_progress (source: 20260425132835_72e0b2eb-5bf7-454a-8d14-18577f7a7d39.sql)
CREATE TABLE IF NOT EXISTS public.pre_journey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  pace TEXT NOT NULL DEFAULT 'balanced' CHECK (pace IN ('slow', 'balanced', 'intense')),
  completed_session_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  current_session_id TEXT NOT NULL DEFAULT 'pj-001',
  module_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  reflections JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graduated_at TIMESTAMP WITH TIME ZONE,
  last_session_at TIMESTAMP WITH TIME ZONE,
  today_count INTEGER NOT NULL DEFAULT 0,
  today_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 22. nudge_queue (source: 20260508123330_73ff0226-cd05-429d-954a-db59cfb68dca.sql)
CREATE TABLE IF NOT EXISTS public.nudge_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('instant','pre_event','post_event','pattern')),
  priority INTEGER NOT NULL DEFAULT 50,
  fire_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','shown','acted','dismissed','expired')),
  title TEXT NOT NULL,
  body TEXT,
  cta_label TEXT,
  cta_action TEXT,
  cta_payload JSONB DEFAULT '{}'::jsonb,
  attribution JSONB DEFAULT '{}'::jsonb,
  source JSONB DEFAULT '{}'::jsonb,
  dedupe_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);

-- 23. user_practice_constellation_history (source: 20260424013621_cb1ea085-f2a9-451a-8b30-4c81f1cd8517.sql)
CREATE TABLE IF NOT EXISTS public.user_practice_constellation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  computation_source TEXT NOT NULL DEFAULT 'recompute',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 24. user_psyche_profile (source: 20260308093104_41b3161e-692f-49d1-b4ae-639a6229c0bf.sql)
CREATE TABLE IF NOT EXISTS public.user_psyche_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  
  -- Beliefs System
  beliefs jsonb NOT NULL DEFAULT '{"core_beliefs": [], "limiting_beliefs": [], "empowering_beliefs": [], "belief_origins": {}}'::jsonb,
  
  -- Archetypes
  archetypes jsonb NOT NULL DEFAULT '{"dominant": null, "shadow": null, "aspirational": null, "active_archetypes": [], "evolution_timeline": []}'::jsonb,
  
  -- Shadow Profile
  shadow jsonb NOT NULL DEFAULT '{"disowned_parts": [], "projection_patterns": [], "integration_progress": 0, "shadow_triggers": []}'::jsonb,
  
  -- Values & Priorities
  values_profile jsonb NOT NULL DEFAULT '{"detected_values": [], "stated_values": [], "alignment_score": 0, "value_conflicts": []}'::jsonb,
  
  -- Defense Mechanisms
  defenses jsonb NOT NULL DEFAULT '{"active_defenses": [], "trigger_defense_map": {}, "primary_defense": null, "defense_awareness": 0}'::jsonb,
  
  -- Emotional Signatures
  emotional_signatures jsonb NOT NULL DEFAULT '{"baseline_state": null, "emotional_range": 0, "suppressed_emotions": [], "emotional_maturity": 0, "dominant_emotions": []}'::jsonb,
  
  -- Inner Voices / Sub-personalities
  inner_voices jsonb NOT NULL DEFAULT '{"inner_critic": {"strength": 0, "frequency": 0, "common_messages": []}, "inner_child": {"state": null, "needs": []}, "saboteur": {"patterns": [], "strength": 0}, "wise_self": {"access_frequency": 0, "messages": []}}'::jsonb,
  
  -- Life Domains Health
  life_domains jsonb NOT NULL DEFAULT '{"health": 0, "relationships": 0, "career": 0, "finances": 0, "creativity": 0, "spirituality": 0, "family": 0, "social": 0}'::jsonb,
  
  -- Cognitive Patterns
  cognitive_patterns jsonb NOT NULL DEFAULT '{"thinking_traps": [], "flexibility_score": 0, "rumination_ratio": 0, "dominant_cognitive_style": null}'::jsonb,
  
  -- Somatic Map
  somatic_map jsonb NOT NULL DEFAULT '{"tension_areas": [], "emotion_body_map": {}, "body_awareness_score": 0, "chronic_patterns": []}'::jsonb,
  
  -- Attachment Style
  attachment jsonb NOT NULL DEFAULT '{"primary_style": null, "secondary_style": null, "evolution": [], "relational_triggers": [], "secure_percentage": 0}'::jsonb,
  
  -- Purpose & Meaning
  purpose jsonb NOT NULL DEFAULT '{"clarity_score": 0, "ikigai": {"love": [], "good_at": [], "world_needs": [], "paid_for": []}, "meaning_patterns": [], "life_direction": null}'::jsonb,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 25. user_speed_profile (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.user_speed_profile (
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

-- 26. guru_memory (source: 20260308064352_41e01c92-96ee-4edc-9b61-efe1a472d0d3.sql)
CREATE TABLE IF NOT EXISTS public.guru_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL DEFAULT 'session',
  source_id uuid,
  content text NOT NULL,
  content_embedding vector(768),
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  importance integer NOT NULL DEFAULT 5,
  category text NOT NULL DEFAULT 'insight',
  tags text[] DEFAULT '{}',
  emotional_tone text,
  dimension_relevant text,
  linked_loops text[] DEFAULT '{}',
  access_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 27. dream_entries (source: 20260415205105_c28bd5a6-ba12-4966-a639-3d918a614960.sql)
CREATE TABLE IF NOT EXISTS public.dream_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  emotions TEXT[] DEFAULT '{}',
  symbols TEXT[] DEFAULT '{}',
  ai_decoded_theme TEXT,
  ai_analysis JSONB DEFAULT '{}',
  samskara_links TEXT[] DEFAULT '{}',
  lucidity_level INTEGER DEFAULT 0,
  vividness INTEGER DEFAULT 5,
  linked_theme_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 28. credit_transactions (source: 20260308165915_615d2a7d-edf6-46e1-bcd1-186a0d3eb7e5.sql)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'purchase',
  amount_paise integer NOT NULL,
  credits_paise integer NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 29. three_brain_inferences (source: 20260511061008_5384af94-2e42-4077-abc4-4199b61d919a.sql)
CREATE TABLE IF NOT EXISTS public.three_brain_inferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  head_score NUMERIC NOT NULL DEFAULT 0,
  heart_score NUMERIC NOT NULL DEFAULT 0,
  gut_score NUMERIC NOT NULL DEFAULT 0,
  dominant TEXT,
  imbalance_score NUMERIC,
  evidence JSONB DEFAULT '{}'::jsonb,
  computed_for_week DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, computed_for_week)
);

-- 30. guru_program_enrollments (source: 20260328153848_6be8c34e-d633-43fa-ad64-8e9212412127.sql)
CREATE TABLE IF NOT EXISTS public.guru_program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  guru_id TEXT NOT NULL,
  program_title TEXT NOT NULL,
  program_description TEXT NOT NULL DEFAULT '',
  duration_days INTEGER NOT NULL DEFAULT 7,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  program_curriculum JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 31. future_self_whispers (source: 20260520122858_01f71d07-a7db-4364-b141-dc59491a4c60.sql)
CREATE TABLE IF NOT EXISTS public.future_self_whispers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_spine_id UUID REFERENCES public.session_spine(id) ON DELETE SET NULL,
  whisper TEXT NOT NULL,
  tone TEXT,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 32. work_signals (source: 20260508113403_17f1e190-dc6d-4eb1-8b36-3cc522063ce4.sql)
CREATE TABLE IF NOT EXISTS public.work_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'google_calendar' | 'outlook' | 'slack' | 'teams' | 'gmail' | 'linear' | 'github' | 'meeting_tone'
  signal_type text NOT NULL, -- 'meeting_load' | 'tone_sentiment' | 'focus_block' | 'late_night_work' | 'message_volume'
  value numeric,
  text_value text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 33. profiles (source: 20260307160609_f95df296-e321-4160-b1f5-44624cc494d9.sql)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 34. journey_groups (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.journey_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'awareness_challenge',
  max_members integer NOT NULL DEFAULT 30,
  duration_days integer NOT NULL DEFAULT 30,
  starts_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 35. user_orientation_progress (source: 20260613174443_584a82ab-0e24-4342-a782-ad5ada6e7332.sql)
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

-- 36. bio_signals (source: 20260508113403_17f1e190-dc6d-4eb1-8b36-3cc522063ce4.sql)
CREATE TABLE IF NOT EXISTS public.bio_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'healthkit' | 'google_fit' | 'oura' | 'fitbit' | 'garmin' | 'whoop' | 'polar_ble' | 'muse' | 'webcam_rppg'
  metric text NOT NULL, -- 'hrv_rmssd' | 'rhr' | 'sleep_score' | 'readiness' | 'stress' | 'spo2' | 'breath_rate' | 'body_battery'
  value numeric NOT NULL,
  unit text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 37. signal_consents (source: 20260508113403_17f1e190-dc6d-4eb1-8b36-3cc522063ce4.sql)
CREATE TABLE IF NOT EXISTS public.signal_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'balanced', -- 'strict' | 'balanced' | 'off'
  granted_at timestamptz,
  revoked_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source)
);

-- 38. user_health_scores (source: 20260308164039_ee2d73d6-af6d-4a55-bcb3-72d5b5ce42b9.sql)
CREATE TABLE IF NOT EXISTS public.user_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  engagement_score NUMERIC NOT NULL DEFAULT 0,
  churn_risk NUMERIC NOT NULL DEFAULT 0,
  health_score NUMERIC NOT NULL DEFAULT 50,
  risk_level TEXT NOT NULL DEFAULT 'healthy',
  risk_factors JSONB DEFAULT '[]'::jsonb,
  last_active_at TIMESTAMPTZ,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 39. today_practice_packs (source: 20260720085750_6d14b593-fefc-48df-8113-88eaaf97c9fe.sql)
CREATE TABLE IF NOT EXISTS public.today_practice_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_date DATE NOT NULL,
  theme_id UUID,
  arc_id UUID,
  practices JSONB NOT NULL DEFAULT '[]'::jsonb,
  formula TEXT,
  band_level NUMERIC,
  arc_phase TEXT,
  bypassing_check JSONB,
  cross_pollination JSONB,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pack_date)
);

-- 40. personal_practice_schedule (source: 20260719113723_cd047d11-cf4a-45f3-909b-ee5337fdd2ee.sql)
CREATE TABLE IF NOT EXISTS public.personal_practice_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  source TEXT,
  duration_min INTEGER DEFAULT 0,
  notify BOOLEAN DEFAULT false,
  payload JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 41. notifications (source: 20260308112517_40e855a9-cd8e-40c2-8c13-92b143e8814f.sql)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 42. curiosity_queue (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.curiosity_queue (
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

-- 43. user_spiritual_dna (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.user_spiritual_dna (
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

-- 44. arc_templates (source: 20260421164602_a127777f-4a9f-4f2d-9d59-7d7442b9da70.sql)
CREATE TABLE IF NOT EXISTS public.arc_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sanskrit_title TEXT,
  modern_title TEXT,
  short_description TEXT NOT NULL,
  long_description TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 21, 49)),
  voice_style TEXT NOT NULL DEFAULT 'adaptive' CHECK (voice_style IN ('sanskrit', 'modern', 'adaptive')),
  primary_path TEXT,
  primary_practice TEXT,
  primary_chakra TEXT,
  assigned_guru TEXT,
  tradition TEXT,
  phase_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_chapter_seeds JSONB NOT NULL DEFAULT '[]'::jsonb,
  harvest_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty TEXT NOT NULL DEFAULT 'moderate' CHECK (difficulty IN ('gentle', 'moderate', 'intense')),
  recommended_band_min NUMERIC DEFAULT 0,
  recommended_band_max NUMERIC DEFAULT 10,
  triggers_for_loops TEXT[] DEFAULT ARRAY[]::TEXT[],
  triggers_for_life_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  cover_emoji TEXT DEFAULT '🪔',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 45. user_practice_constellation (source: 20260424013621_cb1ea085-f2a9-451a-8b30-4c81f1cd8517.sql)
CREATE TABLE IF NOT EXISTS public.user_practice_constellation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,

  -- Phase tracker (Law 3: diverge → T-shape → breathe → integrate)
  phase TEXT NOT NULL DEFAULT 'diverge',
  computation_source TEXT NOT NULL DEFAULT 'initial',

  -- 12 practices: weight (0.01-1.0, sums to 1.0), level (0-7), status
  observe_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (observe_weight   >= 0.01 AND observe_weight   <= 1.0),
  observe_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (observe_level    >= 0    AND observe_level    <= 7),
  observe_status   TEXT         NOT NULL DEFAULT 'secondary',

  inquiry_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (inquiry_weight   >= 0.01 AND inquiry_weight   <= 1.0),
  inquiry_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (inquiry_level    >= 0    AND inquiry_level    <= 7),
  inquiry_status   TEXT         NOT NULL DEFAULT 'secondary',

  bhakti_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (bhakti_weight    >= 0.01 AND bhakti_weight    <= 1.0),
  bhakti_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (bhakti_level     >= 0    AND bhakti_level     <= 7),
  bhakti_status    TEXT         NOT NULL DEFAULT 'secondary',

  witness_weight   NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (witness_weight   >= 0.01 AND witness_weight   <= 1.0),
  witness_level    SMALLINT     NOT NULL DEFAULT 0     CHECK (witness_level    >= 0    AND witness_level    <= 7),
  witness_status   TEXT         NOT NULL DEFAULT 'secondary',

  karma_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (karma_weight     >= 0.01 AND karma_weight     <= 1.0),
  karma_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (karma_level      >= 0    AND karma_level      <= 7),
  karma_status     TEXT         NOT NULL DEFAULT 'secondary',

  breath_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (breath_weight    >= 0.01 AND breath_weight    <= 1.0),
  breath_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (breath_level     >= 0    AND breath_level     <= 7),
  breath_status    TEXT         NOT NULL DEFAULT 'secondary',

  body_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (body_weight      >= 0.01 AND body_weight      <= 1.0),
  body_level       SMALLINT     NOT NULL DEFAULT 0     CHECK (body_level       >= 0    AND body_level       <= 7),
  body_status      TEXT         NOT NULL DEFAULT 'secondary',

  jnana_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (jnana_weight     >= 0.01 AND jnana_weight     <= 1.0),
  jnana_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (jnana_level      >= 0    AND jnana_level      <= 7),
  jnana_status     TEXT         NOT NULL DEFAULT 'dormant',

  raja_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (raja_weight      >= 0.01 AND raja_weight      <= 1.0),
  raja_level       SMALLINT     NOT NULL DEFAULT 0     CHECK (raja_level       >= 0    AND raja_level       <= 7),
  raja_status      TEXT         NOT NULL DEFAULT 'dormant',

  tantra_weight    NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (tantra_weight    >= 0.01 AND tantra_weight    <= 1.0),
  tantra_level     SMALLINT     NOT NULL DEFAULT 0     CHECK (tantra_level     >= 0    AND tantra_level     <= 7),
  tantra_status    TEXT         NOT NULL DEFAULT 'dormant',

  neuro_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (neuro_weight     >= 0.01 AND neuro_weight     <= 1.0),
  neuro_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (neuro_level      >= 0    AND neuro_level       <= 7),
  neuro_status     TEXT         NOT NULL DEFAULT 'dormant',

  kriya_weight     NUMERIC(4,3) NOT NULL DEFAULT 0.083 CHECK (kriya_weight     >= 0.01 AND kriya_weight     <= 1.0),
  kriya_level      SMALLINT     NOT NULL DEFAULT 0     CHECK (kriya_level      >= 0    AND kriya_level      <= 7),
  kriya_status     TEXT         NOT NULL DEFAULT 'dormant',

  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 46. practice_voice_recordings (source: 20260520071920_d99ca5cc-2c0e-4558-a45c-b2c09b7ce033.sql)
CREATE TABLE IF NOT EXISTS public.practice_voice_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  practice_id text not null,
  guru_id text,
  step_idx int,
  transcript text,
  audio_path text not null,
  duration_ms int,
  provider text default 'deepgram',
  created_at timestamptz not null default now()
);

-- 47. user_daily_gates (source: 20260415195517_efa3233e-f3e2-41a3-9eca-25114c877605.sql)
CREATE TABLE IF NOT EXISTS public.user_daily_gates (
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

-- 48. memory_patterns (source: 20260308065229_919ed83d-7b86-466b-9996-afc012f2f793.sql)
CREATE TABLE IF NOT EXISTS public.memory_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pattern_name text NOT NULL,
  description text NOT NULL,
  frequency integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  memory_ids uuid[] DEFAULT '{}',
  dimension text,
  linked_loops text[] DEFAULT '{}',
  emotional_trend text,
  significance text NOT NULL DEFAULT 'emerging',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 49. user_samskaras (source: 20260308062132_bc2a6b9c-be72-472a-bbfd-4c3197b69624.sql)
CREATE TABLE IF NOT EXISTS public.user_samskaras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  root_wound TEXT NOT NULL,
  connected_loop_ids JSONB NOT NULL DEFAULT '[]',
  depth NUMERIC NOT NULL DEFAULT 0,
  awareness NUMERIC NOT NULL DEFAULT 0,
  chakra_correlations JSONB NOT NULL DEFAULT '[]',
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 50. user_roles (source: 20260308163534_a392098b-d3e7-438e-8eb3-c2b317b1865c.sql)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 51. assessment_definitions (source: 20260423225918_5d6f0094-bc60-46a8-8c72-fcfdd5220b63.sql)
CREATE TABLE IF NOT EXISTS public.assessment_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  tradition TEXT NOT NULL DEFAULT 'vedic',
    -- vedic | yogic | jungian | modern | esoteric | tantric | buddhist
  dimension_category TEXT NOT NULL,
    -- archetype | guna | kosha | path | witness | shadow | attachment | will | etc
  intro TEXT NOT NULL DEFAULT '',
  cover_emoji TEXT DEFAULT '🪞',
  estimated_minutes INTEGER NOT NULL DEFAULT 8,
  question_count INTEGER NOT NULL DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [{ id, prompt, type: 'likert'|'choice'|'slider'|'rank'|'scenario',
    --    options: [{label, value, weights: {sub_score: n}}], domain: '...' }]
  scoring_logic JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- { method: 'weighted_sum'|'archetype_pick'|'percentage', dimensions: [...] }
  result_types JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [{ id, label, description, color, archetype_meta }]
  engine_hooks JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- { dimension_map_scores: [{ name, category, source }],
    --   guru_affinity: { high_x: [guru_ids] },
    --   loops_to_check: [...] }
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 52. organizations (source: 20260308114530_7ebf0938-8f33-4227-81fd-620af8878c4c.sql)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 53. mirror_answers (source: 20260508081335_f1975fda-6993-4194-a7f1-99e0ae9b6147.sql)
CREATE TABLE IF NOT EXISTS public.mirror_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dimension_id text NOT NULL,
  question_id text NOT NULL,
  question_type text NOT NULL,
  answer_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'master_mirror',
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 54. journal_threads (source: 20260720074754_e61cf164-8c40-40e3-98fd-869d82e3088a.sql)
CREATE TABLE IF NOT EXISTS public.journal_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  intention TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  entry_count INTEGER NOT NULL DEFAULT 0,
  last_entry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 55. user_loops (source: 20260308062132_bc2a6b9c-be72-472a-bbfd-4c3197b69624.sql)
CREATE TABLE IF NOT EXISTS public.user_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'dormant',
  awareness_score NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'dormant',
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activated_at TIMESTAMPTZ,
  samskara_cluster_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, loop_id)
);

-- 56. user_journeys (source: 20260405151416_4bd8f83a-5e0b-4f10-b71f-a5f6f5584ccc.sql)
CREATE TABLE IF NOT EXISTS public.user_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  master_id TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_days INTEGER NOT NULL DEFAULT 100,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  missed_days INTEGER NOT NULL DEFAULT 0,
  completed_days INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  avg_practice_minutes NUMERIC NOT NULL DEFAULT 0,
  avg_rating NUMERIC NOT NULL DEFAULT 0,
  engagement_level TEXT NOT NULL DEFAULT 'medium',
  preferred_time TEXT NOT NULL DEFAULT 'morning',
  recent_reflections JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_journal_sentiment TEXT NOT NULL DEFAULT 'neutral',
  struggles JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 57. community_observations (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.community_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  display_mode text NOT NULL DEFAULT 'anonymous',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 58. user_goals (source: 20260425104152_b179e9bf-f70d-4e53-8650-5fd37d7a6e91.sql)
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  priority_goal TEXT NOT NULL,
  secondary_goals TEXT[] NOT NULL DEFAULT '{}',
  why_now TEXT,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 59. regression_events (source: 20260308062132_bc2a6b9c-be72-472a-bbfd-4c3197b69624.sql)
CREATE TABLE IF NOT EXISTS public.regression_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT,
  baseline_before NUMERIC NOT NULL DEFAULT 0,
  lowest_point NUMERIC NOT NULL DEFAULT 0,
  recovery_date DATE,
  breakthrough_after BOOLEAN NOT NULL DEFAULT false,
  new_baseline_after NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 60. session_program_enrollments (source: 20260513123042_05538862-6bad-4aa7-b730-964b206af670.sql)
CREATE TABLE IF NOT EXISTS public.session_program_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id TEXT NOT NULL,
  current_session INTEGER NOT NULL DEFAULT 1,
  current_phase TEXT NOT NULL DEFAULT 'Foundation',
  user_level INTEGER NOT NULL DEFAULT 0,
  recent_quality JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 61. device_signals (source: 20260508113403_17f1e190-dc6d-4eb1-8b36-3cc522063ce4.sql)
CREATE TABLE IF NOT EXISTS public.device_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'ios_screentime' | 'android_usage' | 'chrome_ext' | 'desktop_sentinel' | 'keyboard_cadence'
  signal_type text NOT NULL, -- 'app_category_minutes' | 'phone_pickups' | 'tab_switches' | 'idle_minutes' | 'typing_wpm'
  category text, -- e.g. 'social', 'work', 'entertainment'
  value numeric NOT NULL,
  bucket_start timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 62. witness_circles (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.witness_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  max_members integer NOT NULL DEFAULT 10,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_session_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 63. wearable_tokens (source: 20260508113831_03ef662c-d86a-4916-b90d-447157d15f5b.sql)
CREATE TABLE IF NOT EXISTS public.wearable_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'oura' | 'fitbit' | 'whoop' | 'garmin' | 'google_fit'
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- 64. session_adaptations (source: 20260505090623_068265c1-51b1-4226-97ec-d1cec79e91ff.sql)
CREATE TABLE IF NOT EXISTS public.session_adaptations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  program_id UUID,
  day_number INTEGER,
  original_master TEXT,
  adapted_master TEXT,
  original_mode TEXT,
  adapted_mode TEXT,
  original_practice TEXT,
  adapted_practice TEXT,
  pacing_hint TEXT,
  swap_reason TEXT,
  signals JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 65. user_journey_log (source: 20260307204907_b96e063f-af4f-49d4-8921-fd0e64f4a7fd.sql)
CREATE TABLE IF NOT EXISTS public.user_journey_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_number integer NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  phase text NOT NULL,
  engine_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  engine_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 66. daily_themes (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
CREATE TABLE IF NOT EXISTS public.daily_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_date date NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text NOT NULL,
  focus_areas jsonb DEFAULT '[]'::jsonb,
  affirmation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 67. human_map_dimensions (source: 20260508081335_f1975fda-6993-4194-a7f1-99e0ae9b6147.sql)
CREATE TABLE IF NOT EXISTS public.human_map_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dimension_id text NOT NULL,
  category text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  discovered boolean NOT NULL DEFAULT false,
  evidence text,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dimension_id)
);

-- 68. collective_meditation_participants (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.collective_meditation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meditation_id uuid NOT NULL REFERENCES public.collective_meditations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(meditation_id, user_id)
);

-- 69. program_day_progress (source: 20260308201139_69774727-fe79-40e0-8ba3-061782b8d541.sql)
CREATE TABLE IF NOT EXISTS public.program_day_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.program_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  knowledge_read BOOLEAN NOT NULL DEFAULT false,
  practice_done BOOLEAN NOT NULL DEFAULT false,
  reflection_text TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, day_number)
);

-- 70. journey_group_members (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.journey_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.journey_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(group_id, user_id)
);

-- 71. theme_arcs (source: 20260421164602_a127777f-4a9f-4f2d-9d59-7d7442b9da70.sql)
CREATE TABLE IF NOT EXISTS public.theme_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.arc_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  intention TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 108),
  current_day INTEGER NOT NULL DEFAULT 1,
  current_phase TEXT NOT NULL DEFAULT 'ground',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned', 'harvested')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'orchestrator', 'loop_triggered', 'life_event', 'pair', 'echo')),
  voice_style TEXT NOT NULL DEFAULT 'adaptive',
  primary_path TEXT,
  primary_practice TEXT,
  primary_chakra TEXT,
  assigned_guru TEXT,
  spirit JSONB NOT NULL DEFAULT '{}'::jsonb,
  pair_arc_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_end_date DATE,
  completed_at TIMESTAMPTZ,
  harvest_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 72. user_assessment_results (source: 20260423225918_5d6f0094-bc60-46a8-8c72-fcfdd5220b63.sql)
CREATE TABLE IF NOT EXISTS public.user_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID NOT NULL REFERENCES public.assessment_definitions(id) ON DELETE CASCADE,
  assessment_slug TEXT NOT NULL,
  assessment_version INTEGER NOT NULL DEFAULT 1,
  raw_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [{ question_id, answer_value, answered_at }]
  sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- { sattva: 42, rajas: 33, tamas: 25 } or { hero: 8, sage: 12, ... }
  primary_result TEXT,                      -- "sattva" or "the_sage" etc
  primary_result_label TEXT,                -- human-readable
  secondary_result TEXT,                    -- runner-up
  result_summary TEXT,                      -- 1-line descriptor
  deep_analysis TEXT,                       -- AI-generated 800-1500 word reading
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- [{ title, body, type: 'strength'|'shadow'|'edge' }]
  recommended_practices JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_masters JSONB NOT NULL DEFAULT '[]'::jsonb,
  engine_applied BOOLEAN NOT NULL DEFAULT false,
  engine_applied_at TIMESTAMPTZ,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  is_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 73. teams (source: 20260308114530_7ebf0938-8f33-4227-81fd-620af8878c4c.sql)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 74. org_activity_log (source: 20260308120624_98e9579c-d413-405c-891f-dfa8ccacf614.sql)
CREATE TABLE IF NOT EXISTS public.org_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid,
  event_type text NOT NULL DEFAULT 'milestone',
  title text NOT NULL,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 75. enterprise_notifications (source: 20260308121548_394e1419-db18-47b1-8a1a-94d2e80aeca8.sql)
CREATE TABLE IF NOT EXISTS public.enterprise_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid, -- target user (admin/manager who should see it)
  type text NOT NULL DEFAULT 'milestone',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'info',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 76. wellness_challenges (source: 20260308123104_f2897f1e-8f65-4acc-b927-348f9ef4dc23.sql)
CREATE TABLE IF NOT EXISTS public.wellness_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  challenge_type TEXT NOT NULL DEFAULT 'streak',
  target_value INTEGER NOT NULL DEFAULT 7,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  created_by UUID,
  status TEXT NOT NULL DEFAULT 'active',
  rewards_badge TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 77. mood_pulses (source: 20260308123104_f2897f1e-8f65-4acc-b927-348f9ef4dc23.sql)
CREATE TABLE IF NOT EXISTS public.mood_pulses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL DEFAULT 3,
  energy_score INTEGER NOT NULL DEFAULT 3,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 78. community_reactions (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id uuid NOT NULL REFERENCES public.community_observations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'acknowledged',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(observation_id, user_id, reaction_type)
);

-- 79. session_program_progress (source: 20260513123042_05538862-6bad-4aa7-b730-964b206af670.sql)
CREATE TABLE IF NOT EXISTS public.session_program_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.session_program_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  session_index INTEGER NOT NULL,
  phase TEXT,
  level INTEGER,
  teach_done BOOLEAN NOT NULL DEFAULT false,
  practice_done BOOLEAN NOT NULL DEFAULT false,
  reflect_text TEXT,
  quality_score NUMERIC,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 80. witness_circle_members (source: 20260308193622_bf0b2b6a-c2c4-4264-b3f4-cbbdbe71ad1b.sql)
CREATE TABLE IF NOT EXISTS public.witness_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL REFERENCES public.witness_circles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- 81. sessions (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
CREATE TABLE IF NOT EXISTS public.sessions (
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

-- 82. daily_sankalpa (source: 20260423214020_876edb0e-edc2-473a-8d46-6df31313354d.sql)
CREATE TABLE IF NOT EXISTS public.daily_sankalpa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sankalpa_date DATE NOT NULL DEFAULT CURRENT_DATE,
  intention TEXT NOT NULL,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'ritual_session',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sankalpa_date)
);

-- 83. journey_harvest (source: 20260423214020_876edb0e-edc2-473a-8d46-6df31313354d.sql)
CREATE TABLE IF NOT EXISTS public.journey_harvest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  insight TEXT NOT NULL,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  session_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 84. arc_chapters (source: 20260421164602_a127777f-4a9f-4f2d-9d59-7d7442b9da70.sql)
CREATE TABLE IF NOT EXISTS public.arc_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arc_id UUID NOT NULL REFERENCES public.theme_arcs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  phase TEXT NOT NULL DEFAULT 'ground',
  chapter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  chapter_title TEXT,
  chapter_summary TEXT,
  user_reflection TEXT,
  marker TEXT CHECK (marker IN ('normal', 'breakthrough', 'skip', 'rest', 'pivot', 'harvest')),
  quality_score NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (arc_id, day_number)
);

-- 85. arc_echoes (source: 20260421164602_a127777f-4a9f-4f2d-9d59-7d7442b9da70.sql)
CREATE TABLE IF NOT EXISTS public.arc_echoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  arc_id UUID NOT NULL REFERENCES public.theme_arcs(id) ON DELETE CASCADE,
  scheduled_for DATE NOT NULL,
  echo_type TEXT NOT NULL DEFAULT '30d' CHECK (echo_type IN ('30d', '90d', '365d', 'lunar', 'seasonal', 'manual')),
  delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMPTZ,
  delivered_theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  message_seed TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 86. org_members (source: 20260308114530_7ebf0938-8f33-4227-81fd-620af8878c4c.sql)
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'manager', 'employee')),
  email TEXT,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'deactivated')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(org_id, user_id),
  UNIQUE(org_id, email)
);

-- 87. org_invites (source: 20260308114530_7ebf0938-8f33-4227-81fd-620af8878c4c.sql)
CREATE TABLE IF NOT EXISTS public.org_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- 88. session_messages (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
CREATE TABLE IF NOT EXISTS public.session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 89. journal_entries (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
CREATE TABLE IF NOT EXISTS public.journal_entries (
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

-- 90. guide_commitments (source: 20260720083111_9103b585-fc85-4f5d-b786-9fc9ca31abb8.sql)
CREATE TABLE IF NOT EXISTS public.guide_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  mode TEXT,
  master_id TEXT,
  summary TEXT NOT NULL,
  source_message TEXT,
  check_back_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '20 hours'),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','skipped','dismissed')),
  outcome_note TEXT,
  chain_parent_id UUID REFERENCES public.guide_commitments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 91. observation_tasks (source: 20260307170903_19882ed6-601a-4097-a861-84415b21b235.sql)
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

-- ============================================================
-- INDEXES, TRIGGERS, POLICIES, AND GRANTS
-- ============================================================

-- NOTE: Indexes, triggers, policies, and grants are skipped
-- because they may reference columns/tables with different schemas
-- in the remote database. Apply them manually if needed.
