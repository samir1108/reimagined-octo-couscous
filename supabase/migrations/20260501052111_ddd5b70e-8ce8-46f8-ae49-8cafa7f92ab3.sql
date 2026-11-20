-- Inside jokes / shared language between companion and user
CREATE TABLE IF NOT EXISTS public.inside_jokes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  joke_key TEXT NOT NULL,
  phrase TEXT NOT NULL,
  origin_context TEXT,
  origin_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  times_referenced INTEGER NOT NULL DEFAULT 0,
  last_referenced_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, joke_key)
);

ALTER TABLE public.inside_jokes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own inside_jokes select" ON public.inside_jokes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own inside_jokes insert" ON public.inside_jokes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own inside_jokes update" ON public.inside_jokes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_inside_jokes_user
  ON public.inside_jokes (user_id, active, last_referenced_at DESC NULLS LAST);

CREATE OR REPLACE FUNCTION public.find_relevant_joke(_user_id UUID, _tags TEXT[])
RETURNS TABLE (id UUID, phrase TEXT, joke_key TEXT, origin_context TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT j.id, j.phrase, j.joke_key, j.origin_context
  FROM public.inside_jokes j
  WHERE j.user_id = _user_id
    AND j.active = true
    AND (
      _tags IS NULL
      OR array_length(_tags, 1) IS NULL
      OR j.tags && _tags
    )
  ORDER BY random()
  LIMIT 1;
$$;