-- Human Map discovery system tables

-- 1. human_map_dimensions: per-user dimension scores
CREATE TABLE public.human_map_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dimension_id text NOT NULL,
  category text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  discovered boolean NOT NULL DEFAULT false,
  evidence text,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dimension_id)
);

CREATE INDEX idx_hmd_user ON public.human_map_dimensions(user_id);
ALTER TABLE public.human_map_dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own dims" ON public.human_map_dimensions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own dims" ON public.human_map_dimensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own dims" ON public.human_map_dimensions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own dims" ON public.human_map_dimensions
  FOR DELETE USING (auth.uid() = user_id);

-- 2. mirror_answers: raw answers from master mirror + in-session probes
CREATE TABLE public.mirror_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dimension_id text NOT NULL,
  question_id text NOT NULL,
  question_type text NOT NULL,
  answer_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'master_mirror',
  session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ma_user ON public.mirror_answers(user_id, created_at DESC);
ALTER TABLE public.mirror_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own answers" ON public.mirror_answers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own answers" ON public.mirror_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own answers" ON public.mirror_answers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users delete own answers" ON public.mirror_answers
  FOR DELETE USING (auth.uid() = user_id);

-- 3. mirror_progress: per-user progress + integration counter
CREATE TABLE public.mirror_progress (
  user_id uuid PRIMARY KEY,
  master_mirror_index integer NOT NULL DEFAULT 0,
  master_mirror_completed boolean NOT NULL DEFAULT false,
  sessions_since_integration integer NOT NULL DEFAULT 0,
  last_integration_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mirror_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own progress" ON public.mirror_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users insert own progress" ON public.mirror_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own progress" ON public.mirror_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_mp_touch BEFORE UPDATE ON public.mirror_progress
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();