-- Fix the overly permissive INSERT policy on daily_themes
-- Themes should only be inserted by the service role (edge functions), not regular users
DROP POLICY "Service can insert themes" ON public.daily_themes;
