-- Unified Session System — Database migration
-- Adds tables for session state, daily logs, streaks, threads, and events

-- ============================================================
-- 1. Session state (replaces localStorage session-shell cursor)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_states (
  session_id UUID PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cursor_step_index INT DEFAULT -1,
  completed_steps JSONB DEFAULT '[]',
  skipped_steps JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_session_states_user_id ON session_states(user_id);

-- ============================================================
-- 2. Daily session logs (replaces localStorage orb-sessions-YYYY-M-D)
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_session_logs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions JSONB DEFAULT '[]',
  last_theme JSONB,
  PRIMARY KEY (user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_session_logs_user_id ON daily_session_logs(user_id);

-- ============================================================
-- 3. Session streaks (replaces scattered streak logic)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_session_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_session_date DATE,
  total_sessions_lifetime INT DEFAULT 0,
  grace_days_remaining INT DEFAULT 3,
  paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_session_streaks_user_id ON user_session_streaks(user_id);

-- ============================================================
-- 4. Session threads (narrative arcs)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_threads (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_arc TEXT,
  arc_started_at TIMESTAMPTZ,
  sessions_in_arc INT DEFAULT 0,
  arc_intensity FLOAT DEFAULT 0,
  previous_arcs JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_threads_user_id ON session_threads(user_id);

-- ============================================================
-- 5. Session events (event bus for cross-system communication)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON session_events(created_at);
CREATE INDEX IF NOT EXISTS idx_session_events_event_type ON session_events(event_type);

-- ============================================================
-- 6. Add legacy_system column to sessions table for migration
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'legacy_system'
  ) THEN
    ALTER TABLE sessions ADD COLUMN legacy_system TEXT;
  END IF;
END $$;

-- ============================================================
-- 7. Enable RLS on new tables
-- ============================================================
ALTER TABLE session_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_session_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- Session states: users can only access their own
CREATE POLICY "Users can view own session states"
  ON session_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session states"
  ON session_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session states"
  ON session_states FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily session logs: users can only access their own
CREATE POLICY "Users can view own daily logs"
  ON daily_session_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
  ON daily_session_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
  ON daily_session_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Session streaks: users can only access their own
CREATE POLICY "Users can view own streaks"
  ON user_session_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_session_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_session_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Session threads: users can only access their own
CREATE POLICY "Users can view own threads"
  ON session_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
  ON session_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON session_threads FOR UPDATE
  USING (auth.uid() = user_id);

-- Session events: users can only access their own
CREATE POLICY "Users can view own events"
  ON session_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON session_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 9. Updated_at trigger helper (if not exists)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_session_streaks_updated_at ON user_session_streaks;
CREATE TRIGGER update_user_session_streaks_updated_at
  BEFORE UPDATE ON user_session_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_threads_updated_at ON session_threads;
CREATE TRIGGER update_session_threads_updated_at
  BEFORE UPDATE ON session_threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 10. Backfill: migrate localStorage streaks to Postgres
-- ============================================================
-- This is a one-time migration that can be run via a script
-- For now, we initialize with zeros and let the app backfill
-- as users complete sessions

-- ============================================================
-- 11. Seed demo data (optional, remove in production)
-- ============================================================
-- INSERT INTO user_session_streaks (user_id, current_streak, longest_streak, total_sessions_lifetime)
-- VALUES ('00000000-0000-0000-0000-000000000000', 0, 0, 0)
-- ON CONFLICT (user_id) DO NOTHING;
