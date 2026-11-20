CREATE TABLE IF NOT EXISTS public.higher_self_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  letter_text text NOT NULL,
  signal_sources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_higher_self_letters_user ON public.higher_self_letters(user_id, week_start DESC);

ALTER TABLE public.higher_self_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own letters"
  ON public.higher_self_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own letters"
  ON public.higher_self_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);