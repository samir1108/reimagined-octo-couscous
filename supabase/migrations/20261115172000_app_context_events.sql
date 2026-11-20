-- ============================================================
-- APP CONTEXT EVENTS
-- ------------------------------------------------------------
-- Device and network context so funnel gaps can be attributed: offline
-- sittings, slow connections, app versions, timezones.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_context_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  surface TEXT,                          -- app | home | session | guide
  app_version TEXT,
  timezone TEXT,
  language TEXT,
  online BOOLEAN,
  connection TEXT,                       -- wifi | 4g | 3g | slow-2g | unknown
  device_class TEXT,                     -- phone | tablet | desktop
  viewport_w INT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_context_events_created_idx
  ON public.app_context_events (created_at DESC);
CREATE INDEX IF NOT EXISTS app_context_events_version_idx
  ON public.app_context_events (app_version, created_at DESC);

ALTER TABLE public.app_context_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own app context" ON public.app_context_events;
CREATE POLICY "Users view own app context"
  ON public.app_context_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own app context" ON public.app_context_events;
CREATE POLICY "Users insert own app context"
  ON public.app_context_events FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.app_context_events TO authenticated;
GRANT ALL ON public.app_context_events TO service_role;
