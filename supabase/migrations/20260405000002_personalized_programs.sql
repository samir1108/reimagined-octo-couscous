-- ============================================
-- PERSONALIZED PROGRAMS TABLE
-- AI-generated 30-day programs based on questionnaire results
-- ============================================

CREATE TABLE IF NOT EXISTS public.personalized_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_id TEXT NOT NULL,
  result_id TEXT NOT NULL,
  guide_id TEXT NOT NULL,
  program_data JSONB NOT NULL,
  current_day INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  is_complete BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.personalized_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs"
  ON public.personalized_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs"
  ON public.personalized_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON public.personalized_programs FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_personal_programs_user ON public.personalized_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_programs_active ON public.personalized_programs(user_id) WHERE is_active;

-- Auto-update timestamp
CREATE TRIGGER update_personal_programs_updated_at
  BEFORE UPDATE ON public.personalized_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
