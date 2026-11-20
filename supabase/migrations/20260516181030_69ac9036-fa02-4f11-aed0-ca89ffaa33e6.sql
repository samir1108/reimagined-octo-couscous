CREATE TABLE IF NOT EXISTS public.session_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  ingredient_id TEXT NOT NULL,
  ingredient_kind TEXT NOT NULL,
  archetype_id TEXT,
  slot_role TEXT,
  score NUMERIC,
  reason TEXT,
  minutes INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_ingredients_user_recent
  ON public.session_ingredients(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_ingredients_user_ingredient
  ON public.session_ingredients(user_id, ingredient_id, created_at DESC);

ALTER TABLE public.session_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own session ingredients"
  ON public.session_ingredients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own session ingredients"
  ON public.session_ingredients FOR INSERT
  WITH CHECK (auth.uid() = user_id);