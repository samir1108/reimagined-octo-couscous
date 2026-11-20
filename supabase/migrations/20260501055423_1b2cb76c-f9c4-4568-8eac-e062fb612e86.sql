
-- Companion presence: per-user disappearance state & preferences
CREATE TABLE IF NOT EXISTS public.companion_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  notification_decay_level SMALLINT NOT NULL DEFAULT 0, -- 0 full ... 4 silent
  user_override_level SMALLINT, -- if set, takes precedence
  last_quiet_at TIMESTAMPTZ,
  last_reemergence_at TIMESTAMPTZ,
  is_away BOOLEAN NOT NULL DEFAULT false,
  away_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companion_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "presence_select_own" ON public.companion_presence
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "presence_insert_own" ON public.companion_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "presence_update_own" ON public.companion_presence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER companion_presence_updated_at
  BEFORE UPDATE ON public.companion_presence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Companion absences: log of returns after gaps
CREATE TABLE IF NOT EXISTS public.companion_absences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  left_at TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  gap_days INTEGER NOT NULL,
  reemergence_message TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companion_absences_user ON public.companion_absences(user_id, returned_at DESC);

ALTER TABLE public.companion_absences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "absences_select_own" ON public.companion_absences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "absences_insert_own" ON public.companion_absences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "absences_update_own" ON public.companion_absences
  FOR UPDATE USING (auth.uid() = user_id);
