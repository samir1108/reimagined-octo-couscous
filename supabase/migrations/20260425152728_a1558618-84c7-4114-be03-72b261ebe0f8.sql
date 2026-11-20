CREATE TABLE public.graduation_reports (
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

ALTER TABLE public.graduation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own graduation report"
  ON public.graduation_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own graduation report"
  ON public.graduation_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own graduation report"
  ON public.graduation_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_graduation_reports_updated_at
  BEFORE UPDATE ON public.graduation_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_graduation_reports_user ON public.graduation_reports(user_id);