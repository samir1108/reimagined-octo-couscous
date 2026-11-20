CREATE TABLE public.today_practice_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_date DATE NOT NULL,
  theme_id UUID,
  arc_id UUID,
  practices JSONB NOT NULL DEFAULT '[]'::jsonb,
  formula TEXT,
  band_level NUMERIC,
  arc_phase TEXT,
  bypassing_check JSONB,
  cross_pollination JSONB,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pack_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.today_practice_packs TO authenticated;
GRANT ALL ON public.today_practice_packs TO service_role;

ALTER TABLE public.today_practice_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own today packs"
  ON public.today_practice_packs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_today_practice_packs_user_date
  ON public.today_practice_packs (user_id, pack_date DESC);

CREATE TRIGGER today_practice_packs_touch_updated_at
  BEFORE UPDATE ON public.today_practice_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();