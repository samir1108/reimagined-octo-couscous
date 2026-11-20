
CREATE TABLE public.session_program_enrollments (
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

CREATE INDEX idx_spe_user_active ON public.session_program_enrollments(user_id, status);

ALTER TABLE public.session_program_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spe_select_own" ON public.session_program_enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "spe_insert_own" ON public.session_program_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "spe_update_own" ON public.session_program_enrollments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "spe_delete_own" ON public.session_program_enrollments
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_spe_updated_at
  BEFORE UPDATE ON public.session_program_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.session_program_progress (
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

CREATE INDEX idx_spp_enrollment ON public.session_program_progress(enrollment_id, session_index);

ALTER TABLE public.session_program_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spp_select_own" ON public.session_program_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "spp_insert_own" ON public.session_program_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "spp_update_own" ON public.session_program_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "spp_delete_own" ON public.session_program_progress
  FOR DELETE USING (auth.uid() = user_id);
