CREATE TABLE public.spiral_phase_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_band NUMERIC,
  current_phase TEXT,
  predicted_next_phase TEXT,
  predicted_shift_in_days INTEGER,
  confidence NUMERIC,
  reasoning TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.spiral_phase_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_spp" ON public.spiral_phase_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_spp" ON public.spiral_phase_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_spp_user_time ON public.spiral_phase_predictions(user_id, created_at DESC);

CREATE TABLE public.geo_anchors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lat_bucket INTEGER NOT NULL,
  lng_bucket INTEGER NOT NULL,
  place_label TEXT,
  visit_count INTEGER NOT NULL DEFAULT 1,
  suggested_practice TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lat_bucket, lng_bucket)
);
ALTER TABLE public.geo_anchors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_ga" ON public.geo_anchors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_ga" ON public.geo_anchors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_ga" ON public.geo_anchors FOR UPDATE USING (auth.uid() = user_id);