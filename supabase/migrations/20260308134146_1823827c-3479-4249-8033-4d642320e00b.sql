
-- Add user_id column to daily_themes for per-user personalized themes
ALTER TABLE public.daily_themes ADD COLUMN user_id uuid;

-- Drop the old generic SELECT policy
DROP POLICY IF EXISTS "Themes viewable by authenticated" ON public.daily_themes;

-- Users can view their own themes OR global themes (user_id IS NULL)
CREATE POLICY "Users view own or global themes"
  ON public.daily_themes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow service role (edge function) to insert themes
CREATE POLICY "Service inserts themes"
  ON public.daily_themes FOR INSERT
  TO authenticated
  WITH CHECK (true);
