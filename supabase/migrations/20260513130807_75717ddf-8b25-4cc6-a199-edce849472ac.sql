-- Audit log for the intelligent recalibration system
CREATE TABLE IF NOT EXISTS public.recalibration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision IN ('none','minor','major','reassess','dark_night')),
  drift_score numeric(4,3) NOT NULL DEFAULT 0,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  signals_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  applied boolean NOT NULL DEFAULT false,
  applied_at timestamptz,
  user_acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recal_events_user_created
  ON public.recalibration_events(user_id, created_at DESC);

ALTER TABLE public.recalibration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own recalibration events"
  ON public.recalibration_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users acknowledge own recalibration events"
  ON public.recalibration_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
