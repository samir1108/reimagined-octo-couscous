-- Human model snapshots — the evolving 12-layer document.
-- One row per user; JSONB so the schema can grow without migrations per layer.

CREATE TABLE IF NOT EXISTS public.human_model_snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  model JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.human_model_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own human model" ON public.human_model_snapshots;
CREATE POLICY "Users read own human model" ON public.human_model_snapshots
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users write own human model" ON public.human_model_snapshots;
CREATE POLICY "Users write own human model" ON public.human_model_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own human model" ON public.human_model_snapshots;
CREATE POLICY "Users update own human model" ON public.human_model_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.human_model_snapshots TO authenticated;
