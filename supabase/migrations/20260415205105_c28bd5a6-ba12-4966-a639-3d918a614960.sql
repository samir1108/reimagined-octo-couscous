
-- Dream Weaver: morning dream capture + AI decoding
CREATE TABLE public.dream_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dream_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  emotions TEXT[] DEFAULT '{}',
  symbols TEXT[] DEFAULT '{}',
  ai_decoded_theme TEXT,
  ai_analysis JSONB DEFAULT '{}',
  samskara_links TEXT[] DEFAULT '{}',
  lucidity_level INTEGER DEFAULT 0,
  vividness INTEGER DEFAULT 5,
  linked_theme_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dream_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dreams" ON public.dream_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dreams" ON public.dream_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dreams" ON public.dream_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dreams" ON public.dream_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_dream_entries_updated_at BEFORE UPDATE ON public.dream_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Geo-Spiritual Anchors: location-tagged practices
CREATE TABLE public.geo_practice_anchors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'home',
  practice_type TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_name TEXT,
  encrypted_data TEXT,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC(3,2) DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.geo_practice_anchors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own geo anchors" ON public.geo_practice_anchors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own geo anchors" ON public.geo_practice_anchors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own geo anchors" ON public.geo_practice_anchors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own geo anchors" ON public.geo_practice_anchors FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_geo_anchors_updated_at BEFORE UPDATE ON public.geo_practice_anchors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 100-Dimension Human Map: 9 categories × ~11 dims
CREATE TABLE public.dimension_map_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  dimension_name TEXT NOT NULL,
  score NUMERIC(4,2) DEFAULT 0,
  signal_count INTEGER DEFAULT 0,
  discovery_source TEXT DEFAULT 'passive',
  trend TEXT DEFAULT 'stable',
  last_signal_at TIMESTAMPTZ,
  history JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, dimension_name)
);

ALTER TABLE public.dimension_map_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dimension map" ON public.dimension_map_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own dimension map" ON public.dimension_map_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own dimension map" ON public.dimension_map_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own dimension map" ON public.dimension_map_scores FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_dimension_map_updated_at BEFORE UPDATE ON public.dimension_map_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_dream_entries_user_date ON public.dream_entries(user_id, dream_date);
CREATE INDEX idx_geo_anchors_user ON public.geo_practice_anchors(user_id, is_active);
CREATE INDEX idx_dimension_map_user_cat ON public.dimension_map_scores(user_id, category);
