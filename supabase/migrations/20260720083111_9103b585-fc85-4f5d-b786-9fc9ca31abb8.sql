CREATE TABLE public.guide_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  mode TEXT,
  master_id TEXT,
  summary TEXT NOT NULL,
  source_message TEXT,
  check_back_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '20 hours'),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','skipped','dismissed')),
  outcome_note TEXT,
  chain_parent_id UUID REFERENCES public.guide_commitments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX guide_commitments_user_status_idx ON public.guide_commitments(user_id, status, check_back_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_commitments TO authenticated;
GRANT ALL ON public.guide_commitments TO service_role;

ALTER TABLE public.guide_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own commitments"
  ON public.guide_commitments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER guide_commitments_touch_updated_at
  BEFORE UPDATE ON public.guide_commitments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();