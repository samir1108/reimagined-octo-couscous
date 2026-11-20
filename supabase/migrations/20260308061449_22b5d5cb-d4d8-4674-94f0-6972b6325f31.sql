
-- Expand user_consciousness_profile with full Engine V2 state vector
ALTER TABLE public.user_consciousness_profile
  ADD COLUMN IF NOT EXISTS state_vector jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS v_level_baseline numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS v_level_peak numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS v_level_current numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS integration_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS witness_gap numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS witness_stability numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS witness_depth numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chitta_vritti text NOT NULL DEFAULT 'vikshipta',
  ADD COLUMN IF NOT EXISTS yoga_path_affinity jsonb NOT NULL DEFAULT '{"karma":0,"bhakti":0,"jnana":0,"raja":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS dominant_path text,
  ADD COLUMN IF NOT EXISTS h_capacities jsonb NOT NULL DEFAULT '{"awareness":0,"stillness":0,"presence":0,"inquiry":0,"equanimity":0,"compassion":0,"wisdom":0,"courage":0,"patience":0,"humility":0,"generosity":0,"dedication":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS loop_awareness jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS loop_severity jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS samskara_clusters jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS life_domains jsonb NOT NULL DEFAULT '{"relationships":0,"work":0,"health":0,"finances":0,"creativity":0,"spirituality":0,"social":0,"inner_peace":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS relational jsonb NOT NULL DEFAULT '{"dimension_band":0,"trigger_map":{},"shadow_projections":[],"mirror_active":[]}'::jsonb,
  ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS bypassing_risk numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regression jsonb NOT NULL DEFAULT '{"baseline_highest":0,"current_delta":0,"dark_night_count":0,"last_regression":null,"recovery_trajectory":null}'::jsonb,
  ADD COLUMN IF NOT EXISTS circadian_profile jsonb NOT NULL DEFAULT '{"peak_practice_time":null,"natural_rhythm":null,"consistency_score":0,"moon_sensitivity":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS archetype text,
  ADD COLUMN IF NOT EXISTS total_sessions integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_journal_entries integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_current integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_longest integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_session_at timestamptz;

-- Consciousness signals table (per conversation/journal analysis)
CREATE TABLE IF NOT EXISTS public.consciousness_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL DEFAULT 'chat',
  source_id uuid,
  gut_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  heart_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  head_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  witness_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  dimension_updates jsonb NOT NULL DEFAULT '{}'::jsonb,
  loops_detected jsonb NOT NULL DEFAULT '[]'::jsonb,
  chitta_vritti text,
  confidence numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consciousness_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own signals" ON public.consciousness_signals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own signals" ON public.consciousness_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Daily engine plans table
CREATE TABLE IF NOT EXISTS public.daily_engine_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_date date NOT NULL DEFAULT CURRENT_DATE,
  tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  guide_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  journal_prompts jsonb NOT NULL DEFAULT '[]'::jsonb,
  presence_card jsonb NOT NULL DEFAULT '{}'::jsonb,
  evening_reflection jsonb NOT NULL DEFAULT '{}'::jsonb,
  time_slot_generated text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

ALTER TABLE public.daily_engine_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own plans" ON public.daily_engine_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own plans" ON public.daily_engine_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own plans" ON public.daily_engine_plans
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
