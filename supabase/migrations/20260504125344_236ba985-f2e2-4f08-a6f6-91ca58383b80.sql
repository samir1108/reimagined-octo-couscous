-- ============================================================
-- ADAPTIVE PROGRAM SURFACE — Phase 2/3 schema
-- Two new tables:
--   personalized_programs : engine-composed mini-programs (3-30 days)
--   engine_signals        : signals captured from Guide chat / Temple
--                           that shape the next program suggestion
-- ============================================================

-- 1) personalized_programsed ---------------------------------------------------
-- Table may already exist from temple_schema; add missing columns if needed
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'status') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN status TEXT NOT NULL DEFAULT 'suggested';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'title') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN title TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'why') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN why TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'kind') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN kind TEXT NOT NULL DEFAULT 'composed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'template_slug') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN template_slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'days') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN days INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'sessions') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN sessions JSONB NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'source_signals') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN source_signals JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personalized_programs' AND column_name = 'completed_at') THEN
    ALTER TABLE public.personalized_programs ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_personalized_programs_user_status
  ON public.personalized_programs(user_id, status, created_at DESC);

ALTER TABLE public.personalized_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own personalized programs" ON public.personalized_programs;
CREATE POLICY "Users view own personalized programs"
  ON public.personalized_programs FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own personalized programs" ON public.personalized_programs;
CREATE POLICY "Users insert own personalized programs"
  ON public.personalized_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own personalized programs" ON public.personalized_programs;
CREATE POLICY "Users update own personalized programs"
  ON public.personalized_programs FOR UPDATE
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own personalized programs" ON public.personalized_programs;
CREATE POLICY "Users delete own personalized programs"
  ON public.personalized_programs FOR DELETE
  USING (auth.uid() = user_id);

-- 2) engine_signals ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.engine_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL,                 -- needs_wisdom | needs_practice | needs_inquiry
                                             -- | needs_rest | active_loop | domain_stress
                                             -- | curiosity | breakthrough
  practice_id TEXT,                          -- e.g. 'observation', 'jnana', 'breath'
  level_hint INTEGER,                        -- suggested level (0-7)
  master_id TEXT,                            -- guru affinity if any
  loop_id TEXT,                              -- exact library loop id (e.g. VAL001)
  domain TEXT,                               -- life domain (work, relationships, health…)
  urgency NUMERIC(3,2) NOT NULL DEFAULT 0.5, -- 0..1
  source TEXT NOT NULL,                      -- 'guide-chat' | 'temple-chat' | 'journal'
                                             -- | 'session' | 'manual' | 'observer'
  context JSONB DEFAULT '{}'::jsonb,         -- raw bits that triggered the signal
  consumed_at TIMESTAMPTZ,                   -- when used by suggest-next-program
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engine_signals_user_active
  ON public.engine_signals(user_id, created_at DESC)
  WHERE consumed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_engine_signals_user_type
  ON public.engine_signals(user_id, signal_type, created_at DESC);

ALTER TABLE public.engine_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own engine signals"
  ON public.engine_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own engine signals"
  ON public.engine_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role / edge functions update consumed_at via service key (bypasses RLS).
-- No user-facing UPDATE/DELETE policy by design.

-- 3) updated_at trigger for personalized_programs ---------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_personalized_programs_updated_at
  ON public.personalized_programs;
CREATE TRIGGER trg_personalized_programs_updated_at
  BEFORE UPDATE ON public.personalized_programs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();