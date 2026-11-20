
CREATE TABLE public.future_self_whispers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_spine_id UUID REFERENCES public.session_spine(id) ON DELETE SET NULL,
  whisper TEXT NOT NULL,
  tone TEXT,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_future_self_whispers_user_unconsumed
  ON public.future_self_whispers (user_id, created_at DESC)
  WHERE consumed_at IS NULL;

ALTER TABLE public.future_self_whispers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own whispers"
  ON public.future_self_whispers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own whispers"
  ON public.future_self_whispers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own whispers"
  ON public.future_self_whispers FOR UPDATE
  USING (auth.uid() = user_id);
