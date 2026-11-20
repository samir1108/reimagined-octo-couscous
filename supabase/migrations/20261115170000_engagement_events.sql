-- ============================================================
-- ENGAGEMENT EVENTS
-- ------------------------------------------------------------
-- Behaviour outside the sitting: what brought the user back, what they
-- tapped, and where the habit broke. Append-only.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,          -- app_open | home_view | card_tap | orb_activate | session_start | notification_open | streak_break | guide_open
  surface TEXT,                      -- home | orb | guide | temple | practice | notification
  target_id TEXT,                    -- card, archetype, ingredient, theme
  source TEXT,                       -- orb | card | notification | deeplink | guide
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS engagement_events_user_idx
  ON public.engagement_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS engagement_events_type_idx
  ON public.engagement_events (event_type, created_at DESC);

ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own engagement" ON public.engagement_events;
CREATE POLICY "Users view own engagement"
  ON public.engagement_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own engagement" ON public.engagement_events;
CREATE POLICY "Users insert own engagement"
  ON public.engagement_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.engagement_events TO authenticated;
GRANT ALL ON public.engagement_events TO service_role;
