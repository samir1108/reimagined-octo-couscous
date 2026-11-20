
-- ============================================================
-- Phase 5: Linter security hardening
-- ============================================================

-- 1. Add search_path to our only user-defined function missing it
ALTER FUNCTION public.org_min_cohort() SET search_path = public;

-- 2. Tighten permissive service-only INSERT policies
--    These tables should only be written by edge functions (service_role),
--    never by authenticated clients directly.

DROP POLICY IF EXISTS "Service inserts usage" ON public.ai_usage_log;
CREATE POLICY "Service role inserts usage"
  ON public.ai_usage_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service inserts themes" ON public.daily_themes;
CREATE POLICY "Service role inserts themes"
  ON public.daily_themes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service inserts attributions" ON public.loop_attributions;
CREATE POLICY "Service role inserts attributions"
  ON public.loop_attributions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service inserts nudges" ON public.nudge_queue;
CREATE POLICY "Service role inserts nudges"
  ON public.nudge_queue
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. practice_insights: anyone-authenticated could post arbitrary insights.
--    Either it's user-owned content or service-aggregated. The table has
--    user_hash (not user_id), so treat it as service-aggregated.
DROP POLICY IF EXISTS "Authenticated users can post insights" ON public.practice_insights;
CREATE POLICY "Service role posts insights"
  ON public.practice_insights
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Note: sales_inquiries and waitlist_emails INSERT-true policies are intentional
-- (public landing-page forms). Leaving in place; rate limiting handled elsewhere.
