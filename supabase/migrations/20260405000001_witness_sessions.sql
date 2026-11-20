-- ============================================
-- WITNESS SESSIONS TABLE
-- Stores data from each Witness practice session
-- Used for AI mind mapping after 10+ sessions
-- ============================================

CREATE TABLE IF NOT EXISTS public.witness_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  
  -- Emotions observed
  emotions_felt TEXT, -- Comma-separated tags
  emotions_custom TEXT, -- Free text from user
  
  -- Body sensations observed
  body_sensations TEXT, -- Comma-separated tags
  body_custom TEXT, -- Free text from user
  
  -- Thought patterns observed
  thoughts_observed TEXT, -- Comma-separated tags
  thoughts_custom TEXT, -- Free text from user
  
  -- 3 Brains detail
  head_notes TEXT,
  heart_notes TEXT,
  gut_notes TEXT,
  
  -- Overall session quality
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  standout_moment TEXT,
  
  -- AI analysis (populated after 10+ sessions)
  ai_insights TEXT,
  ai_patterns_detected TEXT[],
  last_analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.witness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own witness sessions"
  ON public.witness_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own witness sessions"
  ON public.witness_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own witness sessions"
  ON public.witness_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_witness_sessions_user ON public.witness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_witness_sessions_date ON public.witness_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_witness_sessions_rating ON public.witness_sessions(user_id, overall_rating);

-- View: User's witness stats
CREATE OR REPLACE VIEW public.witness_stats AS
SELECT
  user_id,
  COUNT(*) as total_sessions,
  AVG(duration_minutes) as avg_duration,
  AVG(overall_rating) as avg_rating,
  MAX(session_date) as last_session,
  MIN(session_date) as first_session
FROM public.witness_sessions
GROUP BY user_id;
