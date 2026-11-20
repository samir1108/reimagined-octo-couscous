
ALTER TABLE public.pre_journey_progress
  ADD COLUMN IF NOT EXISTS daily_minutes integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS notify_time text DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS completed_mirror_numbers integer[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pending_mirror_number integer,
  ADD COLUMN IF NOT EXISTS reveal_data jsonb,
  ADD COLUMN IF NOT EXISTS reveal_seen_at timestamptz;

CREATE TABLE IF NOT EXISTS public.pre_journey_mirrors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mirror_number integer NOT NULL,
  after_session_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  mood_score integer,
  energy_score integer,
  clarity_score integer,
  insight text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mirror_number)
);

ALTER TABLE public.pre_journey_mirrors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users view own mirrors"
  ON public.pre_journey_mirrors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own mirrors"
  ON public.pre_journey_mirrors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own mirrors"
  ON public.pre_journey_mirrors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pj_mirrors_user ON public.pre_journey_mirrors(user_id, mirror_number);
