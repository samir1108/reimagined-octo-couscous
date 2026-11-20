-- Witness distraction logs
CREATE TABLE public.witness_distraction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  distraction_type TEXT NOT NULL,
  distraction_db NUMERIC,
  scheduled_at_ms INTEGER NOT NULL,
  was_noticed BOOLEAN,
  reaction_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.witness_distraction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_wdl" ON public.witness_distraction_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_wdl" ON public.witness_distraction_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_wdl" ON public.witness_distraction_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_wdl_user_time ON public.witness_distraction_logs(user_id, created_at DESC);

-- Three-brain inferences
CREATE TABLE public.three_brain_inferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  head_score NUMERIC NOT NULL DEFAULT 0,
  heart_score NUMERIC NOT NULL DEFAULT 0,
  gut_score NUMERIC NOT NULL DEFAULT 0,
  dominant TEXT,
  imbalance_score NUMERIC,
  evidence JSONB DEFAULT '{}'::jsonb,
  computed_for_week DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, computed_for_week)
);
ALTER TABLE public.three_brain_inferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_tbi" ON public.three_brain_inferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_tbi" ON public.three_brain_inferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_tbi" ON public.three_brain_inferences FOR UPDATE USING (auth.uid() = user_id);

-- Spiritual DNA confidence (Curious Engine)
CREATE TABLE public.spiritual_dna_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_key TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  source TEXT,
  last_asked_at TIMESTAMPTZ,
  asked_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, data_key)
);
ALTER TABLE public.spiritual_dna_confidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_select_sdc" ON public.spiritual_dna_confidence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert_sdc" ON public.spiritual_dna_confidence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_sdc" ON public.spiritual_dna_confidence FOR UPDATE USING (auth.uid() = user_id);