CREATE TABLE IF NOT EXISTS public.daily_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text,
  focus_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  affirmation text,
  sequence_no integer NOT NULL DEFAULT 1,
  max_depth integer NOT NULL DEFAULT 5,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme_date, sequence_no)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_themes TO authenticated;
GRANT ALL ON public.daily_themes TO service_role;

ALTER TABLE public.daily_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own daily themes"
  ON public.daily_themes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS daily_themes_user_date_idx
  ON public.daily_themes (user_id, theme_date DESC, sequence_no DESC);

CREATE OR REPLACE FUNCTION public.daily_themes_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS daily_themes_updated_at ON public.daily_themes;
CREATE TRIGGER daily_themes_updated_at
  BEFORE UPDATE ON public.daily_themes
  FOR EACH ROW EXECUTE FUNCTION public.daily_themes_touch_updated_at();