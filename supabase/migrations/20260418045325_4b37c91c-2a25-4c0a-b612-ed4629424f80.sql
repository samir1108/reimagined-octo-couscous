-- ─── Life Stage ───
CREATE TABLE IF NOT EXISTS public.user_life_stage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  stage TEXT NOT NULL DEFAULT 'seeker',
  birth_year INTEGER,
  tone_hint TEXT,
  practice_bias TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_life_stage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own life stage"
  ON public.user_life_stage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own life stage"
  ON public.user_life_stage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own life stage"
  ON public.user_life_stage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_life_stage_updated_at
  BEFORE UPDATE ON public.user_life_stage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── App Relationship Depth ───
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

CREATE POLICY "Users view own relationship"
  ON public.app_relationship_depth FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own relationship"
  ON public.app_relationship_depth FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own relationship"
  ON public.app_relationship_depth FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_app_relationship_depth_updated_at
  BEFORE UPDATE ON public.app_relationship_depth
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Retention Signals ───
CREATE TABLE IF NOT EXISTS public.retention_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  risk TEXT NOT NULL,
  recommended_gesture TEXT NOT NULL,
  copy TEXT,
  days_since_last_session INTEGER,
  consecutive_skipped_days INTEGER,
  recent_quality_avg NUMERIC(4,3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retention_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own retention"
  ON public.retention_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own retention"
  ON public.retention_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_retention_signals_user_created
  ON public.retention_signals (user_id, created_at DESC);