CREATE TABLE public.curiosity_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  last_asked_at TIMESTAMPTZ,
  next_eligible_at TIMESTAMPTZ,
  consecutive_skips INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.curiosity_cooldowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_cc" ON public.curiosity_cooldowns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_cc" ON public.curiosity_cooldowns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_cc" ON public.curiosity_cooldowns FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE public.fractal_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  loop_name TEXT,
  scales_present TEXT[] NOT NULL DEFAULT '{}',
  micro_evidence JSONB DEFAULT '{}'::jsonb,
  meso_evidence JSONB DEFAULT '{}'::jsonb,
  macro_evidence JSONB DEFAULT '{}'::jsonb,
  insight TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fractal_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_fp" ON public.fractal_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_fp" ON public.fractal_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_fp_user_time ON public.fractal_patterns(user_id, detected_at DESC);