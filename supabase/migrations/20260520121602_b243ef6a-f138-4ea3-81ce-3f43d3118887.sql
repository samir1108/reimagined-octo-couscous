
CREATE TABLE IF NOT EXISTS public.session_spine (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid,
  archetype text NOT NULL,
  archetype_reason text,
  lead_master text,
  council_voices jsonb NOT NULL DEFAULT '{}'::jsonb,
  primary_loop_id text,
  secondary_loop_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  primary_dimension text,
  chakra_focus text,
  quality_score numeric,
  final_user_sentence text,
  why_for_you jsonb NOT NULL DEFAULT '[]'::jsonb,
  graph_edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  composed_signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_mode text NOT NULL DEFAULT 'fast',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_spine_user_created
  ON public.session_spine(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_spine_session
  ON public.session_spine(session_id);

ALTER TABLE public.session_spine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own session spine"
  ON public.session_spine FOR SELECT
  USING (auth.uid() = user_id);
