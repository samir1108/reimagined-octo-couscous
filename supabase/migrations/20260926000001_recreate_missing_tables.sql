-- Recreate tables that were dropped outside the migration pipeline.
-- Order matters: parents (session_spine, assessment_definitions) before
-- children (user_assessment_results, future_self_whispers) so FKs resolve.

-- Ensure the updated_at trigger helper exists (idempotent).
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 1. session_spine ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.session_spine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  archetype text NOT NULL,
  archetype_reason text,
  lead_master text,
  council_voices jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_loop_id text,
  secondary_loop_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  primary_dimension text,
  chakra_focus text,
  quality_score numeric,
  final_user_sentence text,
  why_for_you jsonb NOT NULL DEFAULT '[]'::jsonb,
  graph_edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  composed_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_mode text NOT NULL DEFAULT 'fast',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_spine_user_created
  ON public.session_spine(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_spine_session
  ON public.session_spine(session_id);

ALTER TABLE public.session_spine ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own session spine" ON public.session_spine;
CREATE POLICY "Users can view their own session spine"
  ON public.session_spine FOR SELECT
  USING (auth.uid() = user_id);

-- ── 2. assessment_definitions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assessment_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  tradition TEXT NOT NULL DEFAULT 'vedic',
  dimension_category TEXT NOT NULL,
  intro TEXT NOT NULL DEFAULT '',
  cover_emoji TEXT DEFAULT '🪞',
  estimated_minutes INTEGER NOT NULL DEFAULT 8,
  question_count INTEGER NOT NULL DEFAULT 0,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  scoring_logic JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  engine_hooks JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_defs_active ON public.assessment_definitions(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_assessment_defs_tradition ON public.assessment_definitions(tradition);
CREATE INDEX IF NOT EXISTS idx_assessment_defs_dimension ON public.assessment_definitions(dimension_category);

ALTER TABLE public.assessment_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view active assessments" ON public.assessment_definitions;
CREATE POLICY "Anyone authenticated can view active assessments"
  ON public.assessment_definitions
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP TRIGGER IF EXISTS set_updated_at_assessment_definitions ON public.assessment_definitions;
CREATE TRIGGER set_updated_at_assessment_definitions
  BEFORE UPDATE ON public.assessment_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. user_assessment_results ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_id UUID NOT NULL REFERENCES public.assessment_definitions(id) ON DELETE CASCADE,
  assessment_slug TEXT NOT NULL,
  assessment_version INTEGER NOT NULL DEFAULT 1,
  raw_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  sub_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_result TEXT,
  primary_result_label TEXT,
  secondary_result TEXT,
  result_summary TEXT,
  deep_analysis TEXT,
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
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

CREATE INDEX IF NOT EXISTS idx_user_assessment_results_user ON public.user_assessment_results(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_assessment_results_assessment ON public.user_assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_assessment_results_user_assessment ON public.user_assessment_results(user_id, assessment_slug, taken_at DESC);

ALTER TABLE public.user_assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their own assessment results" ON public.user_assessment_results;
DROP POLICY IF EXISTS "Users create their own assessment results" ON public.user_assessment_results;
DROP POLICY IF EXISTS "Users update their own assessment results" ON public.user_assessment_results;
DROP POLICY IF EXISTS "Users delete their own assessment results" ON public.user_assessment_results;

CREATE POLICY "Users view their own assessment results"
  ON public.user_assessment_results FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own assessment results"
  ON public.user_assessment_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own assessment results"
  ON public.user_assessment_results FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own assessment results"
  ON public.user_assessment_results FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_updated_at_user_assessment_results ON public.user_assessment_results;
CREATE TRIGGER set_updated_at_user_assessment_results
  BEFORE UPDATE ON public.user_assessment_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 4. future_self_whispers ──────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_future_self_whispers_user_unconsumed
  ON public.future_self_whispers (user_id, created_at DESC)
  WHERE consumed_at IS NULL;

ALTER TABLE public.future_self_whispers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own whispers" ON public.future_self_whispers;
DROP POLICY IF EXISTS "Users insert own whispers" ON public.future_self_whispers;
DROP POLICY IF EXISTS "Users update own whispers" ON public.future_self_whispers;

CREATE POLICY "Users view own whispers"
  ON public.future_self_whispers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own whispers"
  ON public.future_self_whispers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own whispers"
  ON public.future_self_whispers FOR UPDATE
  USING (auth.uid() = user_id);

-- Grants for the newly created tables (self-contained).
GRANT ALL ON public.session_spine, public.assessment_definitions, public.user_assessment_results, public.future_self_whispers TO anon, authenticated, service_role;
