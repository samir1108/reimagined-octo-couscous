-- Cache for Master-flavored teachings on the daily theme.
-- One row per (user, theme_date, master). Keeps AI costs bounded and re-opens instant.
CREATE TABLE IF NOT EXISTS public.master_theme_teachings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  theme_date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme_id UUID,
  master_id TEXT NOT NULL,
  master_name TEXT NOT NULL,
  theme_title TEXT NOT NULL,
  teaching TEXT NOT NULL,
  invitation TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme_date, master_id)
);

CREATE INDEX IF NOT EXISTS idx_master_theme_teachings_user_date
  ON public.master_theme_teachings (user_id, theme_date DESC);

ALTER TABLE public.master_theme_teachings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own master teachings"
  ON public.master_theme_teachings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own master teachings"
  ON public.master_theme_teachings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own master teachings"
  ON public.master_theme_teachings FOR DELETE
  USING (auth.uid() = user_id);