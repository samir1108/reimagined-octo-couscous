-- Add capability-tracking columns to user_capacities (per-capability rows)
ALTER TABLE public.user_capacities
  ADD COLUMN IF NOT EXISTS capability_id TEXT,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_trained_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS modalities_used TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unmet_prerequisites TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_score INTEGER,
  ADD COLUMN IF NOT EXISTS trend TEXT DEFAULT 'stable',
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_to_next INTEGER DEFAULT 100;

-- Relax unique constraint on user_id to allow multiple capabilities per user
DO $$
DECLARE c TEXT;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.user_capacities'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE '%(user_id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.user_capacities DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_capacities_user_capability_unique') THEN
    ALTER TABLE public.user_capacities ADD CONSTRAINT user_capacities_user_capability_unique UNIQUE (user_id, capability_id);
  END IF;
END $$;

-- drill_attempts table
CREATE TABLE IF NOT EXISTS public.drill_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL,
  drill_id TEXT NOT NULL,
  modality TEXT,
  outcome TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  duration_seconds INTEGER,
  note TEXT,
  at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drill_attempts TO authenticated;
GRANT ALL ON public.drill_attempts TO service_role;
ALTER TABLE public.drill_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own drill attempts" ON public.drill_attempts;
CREATE POLICY "Users can view own drill attempts" ON public.drill_attempts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own drill attempts" ON public.drill_attempts;
CREATE POLICY "Users can insert own drill attempts" ON public.drill_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_drill_attempts_user_id ON public.drill_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_drill_attempts_capability ON public.drill_attempts(user_id, capability_id);
