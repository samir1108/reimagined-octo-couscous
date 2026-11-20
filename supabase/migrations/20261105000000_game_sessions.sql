-- Game Sessions table for unified game tracking
-- Tracks every game play session for history, resume, and insights

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'intro' CHECK (phase IN ('intro', 'play', 'reflect', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  duration_ms INTEGER DEFAULT 0,
  signals JSONB DEFAULT '{}'::jsonb,
  reflection TEXT,
  outcome TEXT CHECK (outcome IN ('completed', 'abandoned', 'interrupted')),
  karma_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_phase ON game_sessions(phase);

-- RLS policies
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own game sessions" ON game_sessions;
CREATE POLICY "Users can view their own game sessions" ON game_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own game sessions" ON game_sessions;
CREATE POLICY "Users can insert their own game sessions" ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own game sessions" ON game_sessions;
CREATE POLICY "Users can update their own game sessions" ON game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own game sessions" ON game_sessions;
CREATE POLICY "Users can delete their own game sessions" ON game_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Daily game assignment table
CREATE TABLE IF NOT EXISTS daily_game (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  assigned_at DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, assigned_at)
);

ALTER TABLE daily_game ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily games" ON daily_game;
CREATE POLICY "Users can view their own daily games" ON daily_game FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own daily games" ON daily_game;
CREATE POLICY "Users can insert their own daily games" ON daily_game FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own daily games" ON daily_game;
CREATE POLICY "Users can update their own daily games" ON daily_game FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to increment daily streak
CREATE OR REPLACE FUNCTION increment_daily_streak(p_user_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  prev_date DATE;
  prev_streak INTEGER;
BEGIN
  -- Get previous day's streak
  SELECT assigned_at, streak INTO prev_date, prev_streak
  FROM daily_game
  WHERE user_id = p_user_id
    AND assigned_at = p_date - INTERVAL '1 day'
  LIMIT 1;
  
  IF prev_date IS NOT NULL THEN
    UPDATE daily_game
    SET streak = prev_streak + 1
    WHERE user_id = p_user_id AND assigned_at = p_date;
  ELSE
    UPDATE daily_game
    SET streak = 1
    WHERE user_id = p_user_id AND assigned_at = p_date;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;