-- ============================================================
-- GUIDE TURNS
-- ------------------------------------------------------------
-- One row per guide exchange: how much the user said, how much came back,
-- which master and mode answered. Enough to measure conversation depth
-- without storing the conversation itself.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.guide_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  surface TEXT NOT NULL DEFAULT 'guide',   -- guide | temple
  master_id TEXT,
  mode TEXT,
  user_chars INT,
  assistant_chars INT,
  estimated_output_tokens INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guide_turns_user_idx
  ON public.guide_turns (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS guide_turns_master_idx
  ON public.guide_turns (master_id, created_at DESC);

ALTER TABLE public.guide_turns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own guide turns" ON public.guide_turns;
CREATE POLICY "Users view own guide turns"
  ON public.guide_turns FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.guide_turns TO authenticated;
GRANT ALL ON public.guide_turns TO service_role;
