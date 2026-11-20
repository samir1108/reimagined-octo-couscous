
-- Loop tracking table (per architecture §23)
CREATE TABLE public.user_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'dormant',
  awareness_score NUMERIC NOT NULL DEFAULT 0,
  severity TEXT NOT NULL DEFAULT 'dormant',
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activated_at TIMESTAMPTZ,
  samskara_cluster_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, loop_id)
);

ALTER TABLE public.user_loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own loops" ON public.user_loops FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own loops" ON public.user_loops FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own loops" ON public.user_loops FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Samskara clusters table
CREATE TABLE public.user_samskaras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  root_wound TEXT NOT NULL,
  connected_loop_ids JSONB NOT NULL DEFAULT '[]',
  depth NUMERIC NOT NULL DEFAULT 0,
  awareness NUMERIC NOT NULL DEFAULT 0,
  chakra_correlations JSONB NOT NULL DEFAULT '[]',
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_samskaras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own samskaras" ON public.user_samskaras FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own samskaras" ON public.user_samskaras FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own samskaras" ON public.user_samskaras FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Regression events tracking
CREATE TABLE public.regression_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT,
  baseline_before NUMERIC NOT NULL DEFAULT 0,
  lowest_point NUMERIC NOT NULL DEFAULT 0,
  recovery_date DATE,
  breakthrough_after BOOLEAN NOT NULL DEFAULT false,
  new_baseline_after NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.regression_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own regression events" ON public.regression_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own regression events" ON public.regression_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
