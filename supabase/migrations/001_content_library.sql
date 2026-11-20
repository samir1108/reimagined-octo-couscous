-- ============================================================
-- ConsciousOS Content Library — Supabase Schema
-- Migration: 001_content_library.sql
-- ============================================================

-- ─── Library Categories ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  target_count INTEGER NOT NULL DEFAULT 0,
  current_count INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES library_categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_categories_slug ON library_categories(slug);
CREATE INDEX IF NOT EXISTS idx_library_categories_parent ON library_categories(parent_id);

-- ─── Library Subcategories ───────────────────────────────────

CREATE TABLE IF NOT EXISTS library_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES library_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL DEFAULT 0,
  current_count INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_library_subcategories_category ON library_subcategories(category_id);

-- ─── Library Items (All 10,000+ records) ─────────────────────

CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,

  type TEXT NOT NULL CHECK (type IN (
    'practice','game','program','wisdom','podcast','meditation','challenge',
    'ritual','course','story','tool','micro_practice','journaling','self_inquiry',
    'breathwork','somatic','assessment','life_experiment','psychological_pattern',
    'emotional_experience','personality_exploration','archetype','chakra_knowledge',
    'dream_exploration','relationship_exercise','karma_experiment',
    'concentration_exercise','creative_awareness','nature_experience','reflection_question'
  )),

  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,

  duration_minutes INTEGER,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced','all')),

  consciousness_dimensions TEXT[] NOT NULL DEFAULT '{}',
  life_domains TEXT[] NOT NULL DEFAULT '{}',
  yoga_paths TEXT[] NOT NULL DEFAULT '{}',

  suitable_bands TEXT[] NOT NULL DEFAULT '{}',
  suitable_profiles TEXT[] NOT NULL DEFAULT '{}',
  prerequisites UUID[] NOT NULL DEFAULT '{}',

  tags TEXT[] NOT NULL DEFAULT '{}',
  related_items UUID[] NOT NULL DEFAULT '{}',

  content JSONB NOT NULL DEFAULT '{}',

  source TEXT NOT NULL DEFAULT 'original' CHECK (source IN ('original','licensed','public_domain','curated','ai_generated_reviewed')),
  provenance TEXT,
  quality_score REAL CHECK (quality_score >= 0 AND quality_score <= 1),
  review_status TEXT NOT NULL DEFAULT 'draft' CHECK (review_status IN ('draft','review','published','archived')),

  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,

  cover_image_url TEXT,
  audio_url TEXT,
  video_url TEXT,

  popularity_score REAL DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating REAL CHECK (average_rating >= 0 AND average_rating <= 5)
);

CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category);
CREATE INDEX IF NOT EXISTS idx_library_items_subcategory ON library_items(subcategory);
CREATE INDEX IF NOT EXISTS idx_library_items_status ON library_items(review_status);
CREATE INDEX IF NOT EXISTS idx_library_items_difficulty ON library_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_library_items_tags ON library_items USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_library_items_dimensions ON library_items USING GIN (consciousness_dimensions);
CREATE INDEX IF NOT EXISTS idx_library_items_life_domains ON library_items USING GIN (life_domains);
CREATE INDEX IF NOT EXISTS idx_library_items_yoga_paths ON library_items USING GIN (yoga_paths);
CREATE INDEX IF NOT EXISTS idx_library_items_related ON library_items USING GIN (related_items);
CREATE INDEX IF NOT EXISTS idx_library_items_fts ON library_items USING GIN (to_tsvector('english', title || ' ' || description));

-- ─── Practices (Practice-specific metadata) ──────────────────

CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  duration_seconds INTEGER,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  session_steps JSONB NOT NULL DEFAULT '[]',
  required_widgets TEXT[] NOT NULL DEFAULT '{}',
  expected_experience TEXT,
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  safety_notes TEXT,
  suitable_profiles TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE(item_id)
);

-- ─── Games (Game mechanics) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  mechanics JSONB NOT NULL DEFAULT '{}',
  scoring_rules JSONB NOT NULL DEFAULT '{}',
  observation_outputs TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER,
  replayable BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(item_id)
);

-- ─── Programs ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  duration_days INTEGER NOT NULL,
  daily_time_minutes INTEGER NOT NULL DEFAULT 15,
  completion_criteria TEXT,
  has_certificate BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(item_id)
);

-- ─── Program Days ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS program_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  practice_ids UUID[] NOT NULL DEFAULT '{}',
  wisdom_ids UUID[] NOT NULL DEFAULT '{}',
  reflection_prompt TEXT,
  mission TEXT,
  assessment_id UUID,
  UNIQUE(program_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_program_days_program ON program_days(program_id);

-- ─── Wisdom Sources ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  tradition TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('text','research','assessment','practice','framework','blog')),
  url TEXT,
  publication_year INTEGER,
  license TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Wisdom Concepts ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS wisdom_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES wisdom_sources(id),
  concept TEXT NOT NULL,
  explanation TEXT NOT NULL,
  practical_application TEXT NOT NULL,
  reflection_questions TEXT[] NOT NULL DEFAULT '{}',
  related_practice_ids UUID[] NOT NULL DEFAULT '{}',
  related_program_ids UUID[] NOT NULL DEFAULT '{}',
  evidence_type TEXT NOT NULL DEFAULT 'traditional' CHECK (evidence_type IN ('traditional','research','clinical','inferred','user_reported')),
  confidence REAL NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  UNIQUE(item_id)
);

-- ─── Podcasts / Audio ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  host TEXT,
  guest TEXT,
  episode_number INTEGER,
  series_name TEXT,
  UNIQUE(item_id)
);

-- ─── Session Templates ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES library_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_duration_minutes INTEGER NOT NULL DEFAULT 10,
  required_widgets TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Session Steps ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('instruction','practice','reflection','game','wisdom','assessment','meditation')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  widget_id TEXT,
  item_id UUID REFERENCES library_items(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_session_steps_session ON session_steps(session_id);

-- ─── Content Tags ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Content Relationships (Knowledge Graph Edges) ───────────

CREATE TABLE IF NOT EXISTS content_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  to_item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'related_to','prerequisite_of','part_of_program','part_of_course','teaches_concept',
    'dissolves_loop','develops_skill','references_wisdom','pairs_with','alternative_to',
    'deepens','simplifies','follows','precedes'
  )),
  weight REAL NOT NULL DEFAULT 0.5 CHECK (weight >= 0 AND weight <= 1),
  confidence REAL NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_item_id, to_item_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_content_rel_from ON content_relationships(from_item_id);
CREATE INDEX IF NOT EXISTS idx_content_rel_to ON content_relationships(to_item_id);
CREATE INDEX IF NOT EXISTS idx_content_rel_type ON content_relationships(relationship_type);

-- ─── User Library Progress ───────────────────────────────────

CREATE TABLE IF NOT EXISTS user_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','favorited','skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_library_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_item ON user_library_progress(item_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_library_progress(status);

-- ─── User Favorites ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- ─── User Recommendations ────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  score REAL NOT NULL CHECK (score >= 0 AND score <= 1),
  reason TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  clicked BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_user_recs_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recs_item ON user_recommendations(item_id);

-- ─── Content Versions ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  changed_by TEXT NOT NULL,
  change_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_versions_item ON content_versions(item_id);

-- ─── Row Level Security ───────────────────────────────────────

ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisdom_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Public read for published items
DROP POLICY IF EXISTS "Published items are viewable by everyone" ON library_items;
CREATE POLICY "Published items are viewable by everyone" ON library_items FOR SELECT
  USING (review_status = 'published');

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON library_categories;
CREATE POLICY "Categories are viewable by everyone" ON library_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON library_subcategories;
CREATE POLICY "Subcategories are viewable by everyone" ON library_subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Practices viewable for published items" ON practices;
CREATE POLICY "Practices viewable for published items" ON practices FOR SELECT USING (
    EXISTS (SELECT 1 FROM library_items WHERE id = item_id AND review_status = 'published')
  );

DROP POLICY IF EXISTS "Games viewable for published items" ON games;
CREATE POLICY "Games viewable for published items" ON games FOR SELECT USING (
    EXISTS (SELECT 1 FROM library_items WHERE id = item_id AND review_status = 'published')
  );

DROP POLICY IF EXISTS "Programs viewable for published items" ON programs;
CREATE POLICY "Programs viewable for published items" ON programs FOR SELECT USING (
    EXISTS (SELECT 1 FROM library_items WHERE id = item_id AND review_status = 'published')
  );

DROP POLICY IF EXISTS "Program days viewable for published programs" ON program_days;
CREATE POLICY "Program days viewable for published programs" ON program_days FOR SELECT USING (
    EXISTS (SELECT 1 FROM programs p JOIN library_items li ON p.item_id = li.id WHERE p.id = program_id AND li.review_status = 'published')
  );

DROP POLICY IF EXISTS "Wisdom sources viewable by everyone" ON wisdom_sources;
CREATE POLICY "Wisdom sources viewable by everyone" ON wisdom_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Wisdom concepts viewable for published items" ON wisdom_concepts;
CREATE POLICY "Wisdom concepts viewable for published items" ON wisdom_concepts FOR SELECT USING (
    EXISTS (SELECT 1 FROM library_items WHERE id = item_id AND review_status = 'published')
  );

DROP POLICY IF EXISTS "Podcasts viewable for published items" ON podcasts;
CREATE POLICY "Podcasts viewable for published items" ON podcasts FOR SELECT USING (
    EXISTS (SELECT 1 FROM library_items WHERE id = item_id AND review_status = 'published')
  );

DROP POLICY IF EXISTS "Sessions viewable by everyone" ON sessions;
CREATE POLICY "Sessions viewable by everyone" ON sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Session steps viewable by everyone" ON session_steps;
CREATE POLICY "Session steps viewable by everyone" ON session_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content tags viewable by everyone" ON content_tags;
CREATE POLICY "Content tags viewable by everyone" ON content_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Content relationships viewable by everyone" ON content_relationships;
CREATE POLICY "Content relationships viewable by everyone" ON content_relationships FOR SELECT USING (true);

-- User-specific policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_library_progress;
CREATE POLICY "Users can view own progress" ON user_library_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON user_library_progress;
CREATE POLICY "Users can insert own progress" ON user_library_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON user_library_progress;
CREATE POLICY "Users can update own progress" ON user_library_progress FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
CREATE POLICY "Users can insert own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;
CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own recommendations" ON user_recommendations;
CREATE POLICY "Users can view own recommendations" ON user_recommendations FOR SELECT USING (auth.uid() = user_id);

-- Admin full access (service role bypasses RLS automatically)

-- ─── Helper Functions ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_library_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE library_categories SET current_count = current_count + 1 WHERE slug = NEW.category;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE library_categories SET current_count = current_count - 1 WHERE slug = OLD.category;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_library_item_count
  AFTER INSERT OR DELETE ON library_items
  FOR EACH ROW EXECUTE FUNCTION update_library_item_count();

-- Full-text search function
CREATE OR REPLACE FUNCTION search_library_items(
  search_query TEXT,
  filter_type TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  max_results INTEGER DEFAULT 50
)
RETURNS SETOF library_items AS $$
BEGIN
  RETURN QUERY
  SELECT li.* FROM library_items li
  WHERE li.review_status = 'published'
    AND (filter_type IS NULL OR li.type = filter_type)
    AND (filter_category IS NULL OR li.category = filter_category)
    AND (
      search_query IS NULL OR search_query = '' OR
      to_tsvector('english', li.title || ' ' || li.description) @@ plainto_tsquery('english', search_query) OR
      li.tags && string_to_array(lower(search_query), ' ')
    )
  ORDER BY
    CASE WHEN li.title ILIKE '%' || search_query || '%' THEN 0 ELSE 1 END,
    li.popularity_score DESC,
    li.average_rating DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Recommendation scoring function
CREATE OR REPLACE FUNCTION get_recommendations_for_user(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  item_id UUID,
  score REAL,
  reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    li.id AS item_id,
    (COALESCE(li.popularity_score, 0) * 0.3 +
     COALESCE(li.average_rating, 0) / 5.0 * 0.3 +
     CASE WHEN ulp.status IS NULL THEN 0.4 ELSE 0.0 END) AS score,
    'Recommended based on your journey' AS reason
  FROM library_items li
  LEFT JOIN user_library_progress ulp ON ulp.item_id = li.id AND ulp.user_id = p_user_id
  WHERE li.review_status = 'published'
    AND (ulp.status IS NULL OR ulp.status = 'not_started')
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
