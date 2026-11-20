-- ─────────────────────────────────────────────────────────────────────────────
-- DIRECTOR BRAIN — Database Schema
-- Film analysis, knowledge graph, and decision storage
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Films ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer,
  director text,
  genre text[] DEFAULT '{}',
  themes text[] DEFAULT '{}',
  dna jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_films_director ON director_brain_films(director);
CREATE INDEX idx_director_brain_films_year ON director_brain_films(year);

-- ── Scenes ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid REFERENCES director_brain_films(id) ON DELETE CASCADE,
  scene_number integer NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  location text DEFAULT '',
  time_of_day text DEFAULT 'day',
  characters text[] DEFAULT '{}',
  narrative_purpose text DEFAULT '',
  emotional_arc jsonb DEFAULT '[]'::jsonb,
  themes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_scenes_film ON director_brain_scenes(film_id);

-- ── Shots ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_shots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid REFERENCES director_brain_scenes(id) ON DELETE CASCADE,
  shot_number integer NOT NULL,
  description text DEFAULT '',
  duration_seconds numeric DEFAULT 0,
  intent text DEFAULT '',
  narrative_purpose text DEFAULT '',
  audience_effect text DEFAULT '',
  emotion jsonb DEFAULT '{}'::jsonb,
  technical jsonb DEFAULT '{}'::jsonb,
  decision jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_shots_scene ON director_brain_shots(scene_id);

-- ── Knowledge Graph Nodes ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid REFERENCES director_brain_films(id) ON DELETE CASCADE,
  node_type text NOT NULL,
  label text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_nodes_type ON director_brain_nodes(node_type);
CREATE INDEX idx_director_brain_nodes_film ON director_brain_nodes(film_id);

-- ── Knowledge Graph Edges ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES director_brain_nodes(id) ON DELETE CASCADE,
  target_id uuid REFERENCES director_brain_nodes(id) ON DELETE CASCADE,
  relationship text NOT NULL,
  weight numeric DEFAULT 1.0,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_edges_source ON director_brain_edges(source_id);
CREATE INDEX idx_director_brain_edges_target ON director_brain_edges(target_id);
CREATE INDEX idx_director_brain_edges_rel ON director_brain_edges(relationship);

-- ── Film Grammar Rules ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_grammar_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technique text NOT NULL,
  category text NOT NULL,
  effect text NOT NULL,
  mechanism text NOT NULL,
  examples jsonb DEFAULT '[]'::jsonb,
  related_rules uuid[] DEFAULT '{}',
  confidence integer DEFAULT 80,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_grammar_cat ON director_brain_grammar_rules(category);

-- ── Simulations ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shot_id uuid REFERENCES director_brain_shots(id) ON DELETE CASCADE,
  changes jsonb DEFAULT '[]'::jsonb,
  result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_simulations_user ON director_brain_simulations(user_id);

-- ── Creative Feedback Log ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS director_brain_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shot_id uuid REFERENCES director_brain_shots(id) ON DELETE CASCADE,
  feedback_text text NOT NULL,
  interpretation jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_director_brain_feedback_user ON director_brain_feedback(user_id);

-- ── RLS Policies ────────────────────────────────────────────────────────────

ALTER TABLE director_brain_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_brain_feedback ENABLE ROW LEVEL SECURITY;

-- Films: public read, admin manage
CREATE POLICY "Films are viewable by everyone" ON director_brain_films FOR SELECT USING (true);
CREATE POLICY "Admins can manage films" ON director_brain_films FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Scenes: public read, admin manage
CREATE POLICY "Scenes are viewable by everyone" ON director_brain_scenes FOR SELECT USING (true);
CREATE POLICY "Admins can manage scenes" ON director_brain_scenes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Shots: public read, admin manage
CREATE POLICY "Shots are viewable by everyone" ON director_brain_shots FOR SELECT USING (true);
CREATE POLICY "Admins can manage shots" ON director_brain_shots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Grammar rules: public read
CREATE POLICY "Grammar rules are viewable by everyone" ON director_brain_grammar_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage grammar rules" ON director_brain_grammar_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Simulations: users manage own
CREATE POLICY "Users can view own simulations" ON director_brain_simulations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create simulations" ON director_brain_simulations FOR INSERT WITH CHECK (user_id = auth.uid());

-- Feedback: users manage own
CREATE POLICY "Users can view own feedback" ON director_brain_feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create feedback" ON director_brain_feedback FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── Updated At Trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_director_brain_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_director_brain_films_updated_at
  BEFORE UPDATE ON director_brain_films
  FOR EACH ROW EXECUTE FUNCTION update_director_brain_updated_at();
