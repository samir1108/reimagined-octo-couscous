-- Recreate hot-path tables missing from the remote database.
-- All 10 were confirmed 404 via anonymous REST probe.
-- Each block is idempotent: CREATE TABLE IF NOT EXISTS + DROP/CREATE policy/index/trigger.

-- Ensure helper exists (idempotent).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- ── 1. user_psyche_profile ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_psyche_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  beliefs jsonb NOT NULL DEFAULT '{"core_beliefs":[],"limiting_beliefs":[],"empowering_beliefs":[],"belief_origins":{}}'::jsonb,
  archetypes jsonb NOT NULL DEFAULT '{"dominant":null,"shadow":null,"aspirational":null,"active_archetypes":[],"evolution_timeline":[]}'::jsonb,
  shadow jsonb NOT NULL DEFAULT '{"disowned_parts":[],"projection_patterns":[],"integration_progress":0,"shadow_triggers":[]}'::jsonb,
  values_profile jsonb NOT NULL DEFAULT '{"detected_values":[],"stated_values":[],"alignment_score":0,"value_conflicts":[]}'::jsonb,
  defenses jsonb NOT NULL DEFAULT '{"active_defenses":[],"trigger_defense_map":{},"primary_defense":null,"defense_awareness":0}'::jsonb,
  emotional_signatures jsonb NOT NULL DEFAULT '{"baseline_state":null,"emotional_range":0,"suppressed_emotions":[],"emotional_maturity":0,"dominant_emotions":[]}'::jsonb,
  inner_voices jsonb NOT NULL DEFAULT '{"inner_critic":{"strength":0,"frequency":0,"common_messages":[]},"inner_child":{"state":null,"needs":[]},"saboteur":{"patterns":[],"strength":0},"wise_self":{"access_frequency":0,"messages":[]}}'::jsonb,
  life_domains jsonb NOT NULL DEFAULT '{"health":0,"relationships":0,"career":0,"finances":0,"creativity":0,"spirituality":0,"family":0,"social":0}'::jsonb,
  cognitive_patterns jsonb NOT NULL DEFAULT '{"thinking_traps":[],"flexibility_score":0,"rumination_ratio":0,"dominant_cognitive_style":null}'::jsonb,
  somatic_map jsonb NOT NULL DEFAULT '{"tension_areas":[],"emotion_body_map":{},"body_awareness_score":0,"chronic_patterns":[]}'::jsonb,
  attachment jsonb NOT NULL DEFAULT '{"primary_style":null,"secondary_style":null,"evolution":[],"relational_triggers":[],"secure_percentage":0}'::jsonb,
  purpose jsonb NOT NULL DEFAULT '{"clarity_score":0,"ikigai":{"love":[],"good_at":[],"world_needs":[],"paid_for":[]},"meaning_patterns":[],"life_direction":null}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.user_psyche_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own psyche profile" ON public.user_psyche_profile;
CREATE POLICY "Users view own psyche profile" ON public.user_psyche_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own psyche profile" ON public.user_psyche_profile;
CREATE POLICY "Users insert own psyche profile" ON public.user_psyche_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own psyche profile" ON public.user_psyche_profile;
CREATE POLICY "Users update own psyche profile" ON public.user_psyche_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_psyche_profile_updated_at ON public.user_psyche_profile;
CREATE TRIGGER update_psyche_profile_updated_at BEFORE UPDATE ON public.user_psyche_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 2. evening_reflections ────────────────────────────────────────────────────
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
ALTER TABLE public.evening_reflections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own reflections" ON public.evening_reflections;
CREATE POLICY "Users view own reflections" ON public.evening_reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own reflections" ON public.evening_reflections;
CREATE POLICY "Users insert own reflections" ON public.evening_reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own reflections" ON public.evening_reflections;
CREATE POLICY "Users update own reflections" ON public.evening_reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── 3. user_loops ────────────────────────────────────────────────────────────
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

-- ── 4. user_samskaras ────────────────────────────────────────────────────────
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
ALTER TABLE public.user_samskaras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own samskaras" ON public.user_samskaras;
CREATE POLICY "Users view own samskaras" ON public.user_samskaras FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own samskaras" ON public.user_samskaras;
CREATE POLICY "Users insert own samskaras" ON public.user_samskaras FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own samskaras" ON public.user_samskaras;
CREATE POLICY "Users update own samskaras" ON public.user_samskaras FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── 5. daily_dimension_summary ───────────────────────────────────────────────
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
ALTER TABLE public.daily_dimension_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own daily summaries" ON public.daily_dimension_summary;
CREATE POLICY "Users view own daily summaries" ON public.daily_dimension_summary FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own daily summaries" ON public.daily_dimension_summary;
CREATE POLICY "Users insert own daily summaries" ON public.daily_dimension_summary FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own daily summaries" ON public.daily_dimension_summary;
CREATE POLICY "Users update own daily summaries" ON public.daily_dimension_summary FOR UPDATE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_daily_dimension_summary_updated_at ON public.daily_dimension_summary;
CREATE TRIGGER update_daily_dimension_summary_updated_at BEFORE UPDATE ON public.daily_dimension_summary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_daily_dimension_summary_user_date ON public.daily_dimension_summary(user_id, summary_date DESC);

-- ── 6. guru_memory ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guru_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  context JSONB,
  importance INTEGER DEFAULT 5,
  last_referenced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.guru_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own memory" ON public.guru_memory;
CREATE POLICY "Users can view own memory" ON public.guru_memory FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own memory" ON public.guru_memory;
CREATE POLICY "Users can create own memory" ON public.guru_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own memory" ON public.guru_memory;
CREATE POLICY "Users can update own memory" ON public.guru_memory FOR UPDATE USING (auth.uid() = user_id);

-- ── 7. regression_events ─────────────────────────────────────────────────────
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
ALTER TABLE public.regression_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own regression events" ON public.regression_events;
CREATE POLICY "Users view own regression events" ON public.regression_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own regression events" ON public.regression_events;
CREATE POLICY "Users insert own regression events" ON public.regression_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 8. session_messages ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own messages" ON public.session_messages;
CREATE POLICY "Users view own messages" ON public.session_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_messages.session_id AND s.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users insert own messages" ON public.session_messages;
CREATE POLICY "Users insert own messages" ON public.session_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = session_messages.session_id AND s.user_id = auth.uid())
);

-- ── 9. app_relationship_depth ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_relationship_depth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'stranger',
  days_known INTEGER NOT NULL DEFAULT 0,
  trust_score NUMERIC(4,3) NOT NULL DEFAULT 0,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_relationship_depth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own relationship" ON public.app_relationship_depth;
CREATE POLICY "Users view own relationship" ON public.app_relationship_depth FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own relationship" ON public.app_relationship_depth;
CREATE POLICY "Users insert own relationship" ON public.app_relationship_depth FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own relationship" ON public.app_relationship_depth;
CREATE POLICY "Users update own relationship" ON public.app_relationship_depth FOR UPDATE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_app_relationship_depth_updated_at ON public.app_relationship_depth;
CREATE TRIGGER update_app_relationship_depth_updated_at BEFORE UPDATE ON public.app_relationship_depth FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 10. dream_entries ────────────────────────────────────────────────────────
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
ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own dreams" ON public.dream_entries;
CREATE POLICY "Users can view own dreams" ON public.dream_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own dreams" ON public.dream_entries;
CREATE POLICY "Users can create own dreams" ON public.dream_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own dreams" ON public.dream_entries;
CREATE POLICY "Users can update own dreams" ON public.dream_entries FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own dreams" ON public.dream_entries;
CREATE POLICY "Users can delete own dreams" ON public.dream_entries FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_dream_entries_updated_at ON public.dream_entries;
CREATE TRIGGER update_dream_entries_updated_at BEFORE UPDATE ON public.dream_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_dream_entries_user_date ON public.dream_entries(user_id, dream_date);

-- Grants for all recreated tables.
GRANT ALL ON public.user_psyche_profile, public.evening_reflections, public.user_loops,
  public.user_samskaras, public.daily_dimension_summary, public.guru_memory,
  public.regression_events, public.session_messages, public.app_relationship_depth,
  public.dream_entries
  TO anon, authenticated, service_role;
