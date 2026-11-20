-- Phase 1: Practice Level Tracking

-- 1. Add practice_levels jsonb column to user_consciousness_profile
ALTER TABLE public.user_consciousness_profile
  ADD COLUMN IF NOT EXISTS practice_levels jsonb NOT NULL DEFAULT jsonb_build_object(
    'observation', 0,
    'self_inquiry', 0,
    'breath', 0,
    'witnessing', 0,
    'body', 0,
    'bhakti', 0,
    'karma', 0,
    'jnana', 0,
    'raja', 0
  );

-- 2. New table to log every practice level change (audit + analytics)
CREATE TABLE IF NOT EXISTS public.practice_level_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  practice text NOT NULL,
  old_level numeric NOT NULL DEFAULT 0,
  new_level numeric NOT NULL,
  reason text NOT NULL,
  quality_score numeric,
  session_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ple_user_created
  ON public.practice_level_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ple_user_practice
  ON public.practice_level_events (user_id, practice, created_at DESC);

ALTER TABLE public.practice_level_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own practice level events"
  ON public.practice_level_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own practice level events"
  ON public.practice_level_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);