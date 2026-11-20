ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_mode text NOT NULL DEFAULT 'fast'
  CHECK (ai_mode IN ('fast', 'premium'));

CREATE INDEX IF NOT EXISTS profiles_ai_mode_idx ON public.profiles(ai_mode);