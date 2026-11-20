-- ============================================
-- TEMPLE DATABASE SCHEMA
-- Complete Supabase migrations for Temple feature
-- Per temple.md Section 22 (Data Structures)
-- ============================================

-- ─── 1. USER JOURNEYS (100-Day Journey tracking) ───
CREATE TABLE IF NOT EXISTS public.temple_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_id TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_days INTEGER NOT NULL DEFAULT 100,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ,
  missed_days INTEGER NOT NULL DEFAULT 0,
  completed_days INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  vows_taken BOOLEAN NOT NULL DEFAULT FALSE,
  vows_taken_at TIMESTAMPTZ,
  streak_days INTEGER NOT NULL DEFAULT 0,
  avg_practice_minutes NUMERIC(5,1) DEFAULT 0,
  avg_rating NUMERIC(3,1) DEFAULT 0,
  engagement_level TEXT DEFAULT 'medium' CHECK (engagement_level IN ('low', 'medium', 'high')),
  last_journal_sentiment TEXT DEFAULT 'neutral' CHECK (last_journal_sentiment IN ('negative', 'neutral', 'positive')),
  recent_reflections TEXT[],
  struggles TEXT[],
  strengths TEXT[],
  preferred_time TEXT DEFAULT 'evening' CHECK (preferred_time IN ('morning', 'afternoon', 'evening', 'night')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for temple_journeys
ALTER TABLE public.temple_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journeys"
  ON public.temple_journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journeys"
  ON public.temple_journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journeys"
  ON public.temple_journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_temple_journeys_user ON public.temple_journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_temple_journeys_master ON public.temple_journeys(master_id);
CREATE INDEX IF NOT EXISTS idx_temple_journeys_active ON public.temple_journeys(user_id) WHERE NOT is_complete;

-- ─── 2. USER PROGRAMS ───
CREATE TABLE IF NOT EXISTS public.temple_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  master_id TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_practiced_at TIMESTAMPTZ,
  missed_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  signal_logs JSONB, -- Daily logged signals
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs"
  ON public.temple_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own programs"
  ON public.temple_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
  ON public.temple_programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_temple_programs_user ON public.temple_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_temple_programs_active ON public.temple_programs(user_id) WHERE is_active;

-- ─── 3. PRACTICE JOURNAL (Encrypted, Private) ───
CREATE TABLE IF NOT EXISTS public.temple_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  master_id TEXT,
  program_id TEXT,
  journey_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  reflection TEXT,
  insight TEXT,
  tags TEXT[], -- #breakthrough, #resistance, #calm, etc.
  is_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
  encrypted_data TEXT, -- Encrypted reflection/insight (future: end-to-end)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journal"
  ON public.temple_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal"
  ON public.temple_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal"
  ON public.temple_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal"
  ON public.temple_journal FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_temple_journal_user ON public.temple_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_temple_journal_timestamp ON public.temple_journal(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_temple_journal_master ON public.temple_journal(user_id, master_id);

-- ─── 4. USER TEXT READS (Library tracking) ───
CREATE TABLE IF NOT EXISTS public.user_text_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_verse TEXT,
  read_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, text_id)
);

ALTER TABLE public.user_text_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reads"
  ON public.user_text_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own reads"
  ON public.user_text_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reads"
  ON public.user_text_reads FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 5. USER TEXT BOOKMARKS ───
CREATE TABLE IF NOT EXISTS public.user_text_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id TEXT NOT NULL,
  verse_id TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_text_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks"
  ON public.user_text_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON public.user_text_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.user_text_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_text_bookmarks_user ON public.user_text_bookmarks(user_id);

-- ─── 6. USER TEXT ANNOTATIONS ───
CREATE TABLE IF NOT EXISTS public.user_text_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id TEXT NOT NULL,
  verse_id TEXT NOT NULL,
  annotation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_text_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own annotations"
  ON public.user_text_annotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annotations"
  ON public.user_text_annotations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annotations"
  ON public.user_text_annotations FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 7. GUIDANCE REQUESTS ───
CREATE TABLE IF NOT EXISTS public.temple_guidance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  text TEXT NOT NULL,
  category TEXT,
  is_crisis BOOLEAN NOT NULL DEFAULT FALSE,
  matched_master TEXT,
  response_summary TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_guidance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own guidance"
  ON public.temple_guidance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own guidance"
  ON public.temple_guidance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_guidance_user ON public.temple_guidance(user_id);
CREATE INDEX IF NOT EXISTS idx_guidance_timestamp ON public.temple_guidance(user_id, timestamp DESC);

-- ─── 8. USER TEMPLE PRESENCES (Which masters are witnessing) ───
CREATE TABLE IF NOT EXISTS public.temple_presences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_id TEXT NOT NULL,
  presence_type TEXT NOT NULL CHECK (presence_type IN ('active', 'elder', 'future')),
  current_day INTEGER,
  total_days INTEGER,
  last_interaction TIMESTAMPTZ,
  quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_presences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own presences"
  ON public.temple_presences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own presences"
  ON public.temple_presences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presences"
  ON public.temple_presences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_presences_user ON public.temple_presences(user_id);

-- ─── 9. USER CALENDAR EVENTS (Personal milestones) ───
CREATE TABLE IF NOT EXISTS public.temple_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('full-moon', 'new-moon', 'personal-milestone', 'traditional-observance', 'global-sangha')),
  title TEXT NOT NULL,
  description TEXT,
  master_id TEXT,
  is_global BOOLEAN DEFAULT FALSE,
  participant_count INTEGER,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON public.temple_calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.temple_calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_calendar_user ON public.temple_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON public.temple_calendar_events(event_date);

-- ─── 10. USER OFFLINE DOWNLOADS ───
CREATE TABLE IF NOT EXISTS public.temple_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('journey', 'text', 'practice', 'program')),
  size_mb INTEGER,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE public.temple_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
  ON public.temple_downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own downloads"
  ON public.temple_downloads FOR ALL
  USING (auth.uid() = user_id);

-- ─── 11. USER MASTERY LEVELS ───
CREATE TABLE IF NOT EXISTS public.temple_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  level TEXT NOT NULL DEFAULT 'novice' CHECK (level IN ('novice', 'initiate', 'practitioner', 'teacher')),
  total_practice_days INTEGER DEFAULT 0,
  completed_journeys INTEGER DEFAULT 0,
  completed_programs INTEGER DEFAULT 0,
  next_level_at INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mastery"
  ON public.temple_mastery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mastery"
  ON public.temple_mastery FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 12. USER TEMPLE STATE (First entry, settings) ───
CREATE TABLE IF NOT EXISTS public.temple_user_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  has_entered_temple BOOLEAN DEFAULT FALSE,
  entered_temple_at TIMESTAMPTZ,
  temple_anniversary DATE,
  tradition_preference TEXT DEFAULT 'all' CHECK (tradition_preference IN ('hindu', 'buddhist', 'universal', 'all')),
  reduced_motion BOOLEAN DEFAULT FALSE,
  preferred_practice_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.temple_user_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own state"
  ON public.temple_user_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own state"
  ON public.temple_user_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own state"
  ON public.temple_user_state FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── 13. AUTOMATED TRIGGERS ───

-- Auto-update updated_at on temple_journeys
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_temple_journeys_updated_at
  BEFORE UPDATE ON public.temple_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_temple_programs_updated_at
  BEFORE UPDATE ON public.temple_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_temple_mastery_updated_at
  BEFORE UPDATE ON public.temple_mastery
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_temple_user_state_updated_at
  BEFORE UPDATE ON public.temple_user_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 14. VIEWS ───

-- Weekly review view
CREATE OR REPLACE VIEW public.temple_weekly_review AS
SELECT
  j.user_id,
  DATE_TRUNC('week', j.timestamp) AS week_start,
  COUNT(DISTINCT DATE(j.timestamp)) AS days_practiced,
  SUM(j.rating * 10) AS total_time_minutes,
  ARRAY_AGG(j.insight ORDER BY j.timestamp DESC) FILTER (WHERE j.insight IS NOT NULL) AS insights,
  j.master_id,
  MAX(j.timestamp) AS last_practiced
FROM public.temple_journal j
WHERE j.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY j.user_id, DATE_TRUNC('week', j.timestamp), j.master_id;

-- Active journeys
CREATE OR REPLACE VIEW public.temple_active_journeys AS
SELECT
  j.*
FROM public.temple_journeys j
WHERE NOT j.is_complete;
