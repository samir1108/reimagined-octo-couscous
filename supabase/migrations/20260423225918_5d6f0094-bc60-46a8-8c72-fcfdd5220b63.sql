-- ═══════════════════════════════════════════════════════════════════════════
-- INNER LIBRARY — Foundation
-- Public catalog of world-class psychometric mirrors + user completions
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Assessment definitions (public catalog)
CREATE TABLE public.assessment_definitions (
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

CREATE INDEX idx_assessment_defs_active ON public.assessment_definitions(is_active, sort_order);
CREATE INDEX idx_assessment_defs_tradition ON public.assessment_definitions(tradition);
CREATE INDEX idx_assessment_defs_dimension ON public.assessment_definitions(dimension_category);

ALTER TABLE public.assessment_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active assessments"
ON public.assessment_definitions
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. User assessment results
CREATE TABLE public.user_assessment_results (
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

CREATE INDEX idx_user_assessment_results_user ON public.user_assessment_results(user_id, taken_at DESC);
CREATE INDEX idx_user_assessment_results_assessment ON public.user_assessment_results(assessment_id);
CREATE INDEX idx_user_assessment_results_user_assessment ON public.user_assessment_results(user_id, assessment_slug, taken_at DESC);

ALTER TABLE public.user_assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own assessment results"
ON public.user_assessment_results
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users create their own assessment results"
ON public.user_assessment_results
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own assessment results"
ON public.user_assessment_results
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own assessment results"
ON public.user_assessment_results
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3. Triggers for updated_at
CREATE TRIGGER set_updated_at_assessment_definitions
BEFORE UPDATE ON public.assessment_definitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_user_assessment_results
BEFORE UPDATE ON public.user_assessment_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();