-- Guardians: trusted people who can receive legacy entries
CREATE TABLE IF NOT EXISTS public.legacy_guardians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_email TEXT NOT NULL,
  relationship TEXT,
  trust_phrase TEXT,
  notify_on TEXT NOT NULL DEFAULT 'manual',
  notified_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.legacy_guardians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own legacy_guardians select" ON public.legacy_guardians
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own legacy_guardians insert" ON public.legacy_guardians
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own legacy_guardians update" ON public.legacy_guardians
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own legacy_guardians delete" ON public.legacy_guardians
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_legacy_guardians_user
  ON public.legacy_guardians (user_id, active);

CREATE TRIGGER tg_legacy_guardians_updated
  BEFORE UPDATE ON public.legacy_guardians
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: find_life_event_anniversaries function moved to migration 20260712041843
-- where the life_events table is created.
