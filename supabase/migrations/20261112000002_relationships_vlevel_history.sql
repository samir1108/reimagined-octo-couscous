-- ============================================================
-- USER RELATIONSHIPS — For Loop Resonance (Invention 6)
-- ============================================================
-- Stores user relationships for cross-user loop resonance detection

CREATE TABLE IF NOT EXISTS public.user_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('partner', 'family', 'close_friend', 'colleague', 'mentor', 'student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, related_user_id)
);

CREATE INDEX IF NOT EXISTS user_relationships_user_idx ON public.user_relationships (user_id);
CREATE INDEX IF NOT EXISTS user_relationships_related_idx ON public.user_relationships (related_user_id);

ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own relationships" ON public.user_relationships
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own relationships" ON public.user_relationships
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own relationships" ON public.user_relationships
  FOR UPDATE USING (auth.uid() = user_id);

-- V-Level History (for witness stability curve)
CREATE TABLE IF NOT EXISTS public.v_level_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  band INTEGER NOT NULL,
  micro_level TEXT NOT NULL CHECK (micro_level IN ('entering', 'deepening', 'mastery')),
  dimension_scores JSONB,
  witness_quality NUMERIC,
  loop_penalty NUMERIC,
  integration_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS v_level_history_user_created_idx ON public.v_level_history (user_id, created_at DESC);

ALTER TABLE public.v_level_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own vlevel history" ON public.v_level_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role inserts vlevel history" ON public.v_level_history
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.user_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.v_level_history TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_relationships TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.v_level_history TO service_role;

-- Trigger for updated_at on user_relationships
CREATE TRIGGER update_user_relationships_updated_at
  BEFORE UPDATE ON public.user_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();