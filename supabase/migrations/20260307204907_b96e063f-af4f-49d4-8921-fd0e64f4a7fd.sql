
-- Create user_consciousness_profile table
CREATE TABLE public.user_consciousness_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  overall_band numeric NOT NULL DEFAULT 0,
  dimension_bands jsonb NOT NULL DEFAULT '{"thought": 0, "emotion": 0, "body": 0, "awareness": 0}'::jsonb,
  life_domains jsonb NOT NULL DEFAULT '{}'::jsonb,
  active_loops jsonb NOT NULL DEFAULT '[]'::jsonb,
  journey_day integer NOT NULL DEFAULT 1,
  journey_phase text NOT NULL DEFAULT 'assessment',
  assessment_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_assessed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_journey_log table
CREATE TABLE public.user_journey_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_number integer NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  phase text NOT NULL,
  engine_plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  engine_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_consciousness_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journey_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_consciousness_profile
CREATE POLICY "Users view own profile" ON public.user_consciousness_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.user_consciousness_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.user_consciousness_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS policies for user_journey_log
CREATE POLICY "Users view own journey log" ON public.user_journey_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own journey log" ON public.user_journey_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at on consciousness profile
CREATE TRIGGER update_consciousness_profile_updated_at
  BEFORE UPDATE ON public.user_consciousness_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
