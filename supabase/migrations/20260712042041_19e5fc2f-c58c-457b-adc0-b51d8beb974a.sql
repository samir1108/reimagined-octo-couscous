
-- helper for updated_at
-- (public.update_updated_at_column already exists)

-- ai_cost_logs (admin-only writes)
CREATE TABLE IF NOT EXISTS public.ai_cost_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  function_name TEXT,
  model TEXT,
  cost_paise INTEGER NOT NULL DEFAULT 0,
  tokens_in INTEGER,
  tokens_out INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_cost_logs TO authenticated;
GRANT ALL ON public.ai_cost_logs TO service_role;
ALTER TABLE public.ai_cost_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cost logs" ON public.ai_cost_logs FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_created ON public.ai_cost_logs(created_at DESC);

-- arc_history
CREATE TABLE IF NOT EXISTS public.arc_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  arc_type TEXT,
  spiral_depth INTEGER,
  journey_day INTEGER,
  overall_band NUMERIC,
  is_completed BOOLEAN DEFAULT false,
  breakthroughs_detected INTEGER DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.arc_history TO authenticated;
GRANT ALL ON public.arc_history TO service_role;
ALTER TABLE public.arc_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own arc history" ON public.arc_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- companion_mood
CREATE TABLE IF NOT EXISTS public.companion_mood (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mood_date DATE NOT NULL,
  mood TEXT NOT NULL,
  intensity NUMERIC DEFAULT 0.5,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mood_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companion_mood TO authenticated;
GRANT ALL ON public.companion_mood TO service_role;
ALTER TABLE public.companion_mood ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mood" ON public.companion_mood FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- daily_rituals
CREATE TABLE IF NOT EXISTS public.daily_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ritual_date DATE NOT NULL,
  ritual_type TEXT NOT NULL,
  content TEXT,
  context_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ritual_date, ritual_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_rituals TO authenticated;
GRANT ALL ON public.daily_rituals TO service_role;
ALTER TABLE public.daily_rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rituals" ON public.daily_rituals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- daily_sessions
CREATE TABLE IF NOT EXISTS public.daily_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_type TEXT,
  guru_id TEXT,
  quality_score NUMERIC,
  duration_seconds INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_sessions TO authenticated;
GRANT ALL ON public.daily_sessions TO service_role;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily sessions" ON public.daily_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_date ON public.daily_sessions(user_id, session_date DESC);

-- daily_user_context
CREATE TABLE IF NOT EXISTS public.daily_user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  morning_completed BOOLEAN DEFAULT false,
  midday_completed BOOLEAN DEFAULT false,
  evening_completed BOOLEAN DEFAULT false,
  mood_score NUMERIC,
  energy_score NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_user_context TO authenticated;
GRANT ALL ON public.daily_user_context TO service_role;
ALTER TABLE public.daily_user_context ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own daily ctx" ON public.daily_user_context FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- dimension_scores
CREATE TABLE IF NOT EXISTS public.dimension_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dimension_id TEXT,
  dimension TEXT,
  score NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dimension_scores TO authenticated;
GRANT ALL ON public.dimension_scores TO service_role;
ALTER TABLE public.dimension_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dim scores" ON public.dimension_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- foundation_progress
CREATE TABLE IF NOT EXISTS public.foundation_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_session INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 21,
  completed BOOLEAN DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.foundation_progress TO authenticated;
GRANT ALL ON public.foundation_progress TO service_role;
ALTER TABLE public.foundation_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own foundation" ON public.foundation_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- guide_messages
CREATE TABLE IF NOT EXISTS public.guide_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT,
  content TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_messages TO authenticated;
GRANT ALL ON public.guide_messages TO service_role;
ALTER TABLE public.guide_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own guide msgs" ON public.guide_messages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- guru_shishya_relationships
CREATE TABLE IF NOT EXISTS public.guru_shishya_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  guru_id TEXT NOT NULL,
  guru_name TEXT,
  total_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, guru_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guru_shishya_relationships TO authenticated;
GRANT ALL ON public.guru_shishya_relationships TO service_role;
ALTER TABLE public.guru_shishya_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own guru rel" ON public.guru_shishya_relationships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- legacy_vault
CREATE TABLE IF NOT EXISTS public.legacy_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL,
  recipient_name TEXT,
  recipient_relationship TEXT,
  recipient_email TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  release_condition TEXT NOT NULL DEFAULT 'manual',
  release_date DATE,
  is_released BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legacy_vault TO authenticated;
GRANT ALL ON public.legacy_vault TO service_role;
ALTER TABLE public.legacy_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own legacy" ON public.legacy_vault FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- predictive_signals
CREATE TABLE IF NOT EXISTS public.predictive_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL,
  severity NUMERIC DEFAULT 0.5,
  urgency NUMERIC DEFAULT 0.5,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictive_signals TO authenticated;
GRANT ALL ON public.predictive_signals TO service_role;
ALTER TABLE public.predictive_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own predictive" ON public.predictive_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_predictive_user_time ON public.predictive_signals(user_id, detected_at DESC);

-- speed_profile_history
CREATE TABLE IF NOT EXISTS public.speed_profile_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.speed_profile_history TO authenticated;
GRANT ALL ON public.speed_profile_history TO service_role;
ALTER TABLE public.speed_profile_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own speed hist" ON public.speed_profile_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- spiritual_dna
CREATE TABLE IF NOT EXISTS public.spiritual_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spiritual_dna TO authenticated;
GRANT ALL ON public.spiritual_dna TO service_role;
ALTER TABLE public.spiritual_dna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dna" ON public.spiritual_dna FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- spiritual_dna_assessments
CREATE TABLE IF NOT EXISTS public.spiritual_dna_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  assessment_conversation JSONB NOT NULL DEFAULT '{}'::jsonb,
  available_time_daily INTEGER,
  circadian_type TEXT,
  path_bhakti NUMERIC,
  path_karma NUMERIC,
  path_jnana NUMERIC,
  path_raja NUMERIC,
  brain_head NUMERIC,
  brain_heart NUMERIC,
  brain_gut NUMERIC,
  chitta_vritti_level NUMERIC,
  primary_loops TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spiritual_dna_assessments TO authenticated;
GRANT ALL ON public.spiritual_dna_assessments TO service_role;
ALTER TABLE public.spiritual_dna_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dna assess" ON public.spiritual_dna_assessments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- temple_ai_conversations
CREATE TABLE IF NOT EXISTS public.temple_ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.temple_ai_conversations TO authenticated;
GRANT ALL ON public.temple_ai_conversations TO service_role;
ALTER TABLE public.temple_ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own temple convo" ON public.temple_ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_temple_convo_user_time ON public.temple_ai_conversations(user_id, created_at DESC);

-- updated_at triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'arc_history','daily_rituals','daily_user_context','dimension_scores',
    'foundation_progress','guru_shishya_relationships','legacy_vault',
    'spiritual_dna','spiritual_dna_assessments'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%1$s_updated ON public.%1$s', t);
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END$$;
