CREATE TABLE public.session_adaptations (
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

ALTER TABLE public.session_adaptations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own session adaptations"
  ON public.session_adaptations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own session adaptations"
  ON public.session_adaptations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own session adaptations"
  ON public.session_adaptations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_session_adaptations_user_session
  ON public.session_adaptations(user_id, session_id, created_at DESC);

CREATE INDEX idx_session_adaptations_program
  ON public.session_adaptations(program_id, day_number);