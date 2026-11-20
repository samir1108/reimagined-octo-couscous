ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifestyle jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wake_time text,
  ADD COLUMN IF NOT EXISTS sleep_time text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS country text;