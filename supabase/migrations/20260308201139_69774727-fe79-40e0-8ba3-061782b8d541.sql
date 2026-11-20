
-- Program enrollments table
CREATE TABLE public.program_enrollments (
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

-- Program day progress table
CREATE TABLE public.program_day_progress (
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

-- Enable RLS
ALTER TABLE public.program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_day_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for program_enrollments
CREATE POLICY "Users view own enrollments" ON public.program_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own enrollments" ON public.program_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own enrollments" ON public.program_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own enrollments" ON public.program_enrollments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for program_day_progress
CREATE POLICY "Users view own day progress" ON public.program_day_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own day progress" ON public.program_day_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own day progress" ON public.program_day_progress FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_program_enrollments_updated_at
  BEFORE UPDATE ON public.program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
