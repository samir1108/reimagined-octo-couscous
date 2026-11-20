
CREATE TABLE public.user_orientation_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_session int NOT NULL DEFAULT 1,
  completed_sessions int[] NOT NULL DEFAULT '{}',
  current_act int NOT NULL DEFAULT 1,
  last_session_at timestamptz,
  completed_at timestamptz,
  skipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_orientation_progress TO authenticated;
GRANT ALL ON public.user_orientation_progress TO service_role;

ALTER TABLE public.user_orientation_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select" ON public.user_orientation_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_insert" ON public.user_orientation_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update" ON public.user_orientation_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_orientation_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_orientation_updated_at
  BEFORE UPDATE ON public.user_orientation_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_orientation_updated_at();

-- Backfill existing users as already complete so course only appears for new users
INSERT INTO public.user_orientation_progress (user_id, current_session, current_act, completed_at, skipped)
SELECT user_id, 31, 6, now(), true FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
