-- Ensure user_capacities table exists (was missing in remote DB despite migration recorded as applied)
CREATE TABLE IF NOT EXISTS public.user_capacities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  attention INTEGER DEFAULT 1,
  observation INTEGER DEFAULT 1,
  presence INTEGER DEFAULT 1,
  body_awareness INTEGER DEFAULT 1,
  emotional_mastery INTEGER DEFAULT 1,
  pattern_recognition INTEGER DEFAULT 1,
  self_inquiry INTEGER DEFAULT 1,
  disidentification INTEGER DEFAULT 1,
  shadow_integration INTEGER DEFAULT 1,
  equanimity INTEGER DEFAULT 1,
  surrender INTEGER DEFAULT 1,
  unification INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_capacities TO authenticated;
GRANT ALL ON public.user_capacities TO service_role;

ALTER TABLE public.user_capacities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own capacities" ON public.user_capacities;
CREATE POLICY "Users can view own capacities" ON public.user_capacities FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own capacities" ON public.user_capacities;
CREATE POLICY "Users can update own capacities" ON public.user_capacities FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own capacities" ON public.user_capacities;
CREATE POLICY "Users can insert own capacities" ON public.user_capacities FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_capacities_user_id ON public.user_capacities(user_id);

-- Backfill rows for existing users
INSERT INTO public.user_capacities (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
