-- Current goals (one row per user)
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  priority_goal TEXT NOT NULL,
  secondary_goals TEXT[] NOT NULL DEFAULT '{}',
  why_now TEXT,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- History of every change so engine + analytics can see goal evolution
CREATE TABLE public.user_goals_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  priority_goal TEXT NOT NULL,
  secondary_goals TEXT[] NOT NULL DEFAULT '{}',
  why_now TEXT,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals" ON public.user_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON public.user_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.user_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.user_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own goal history" ON public.user_goals_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goal history" ON public.user_goals_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- On every update, snapshot previous values into history
CREATE OR REPLACE FUNCTION public.snapshot_user_goals()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_goals_history (user_id, priority_goal, secondary_goals, why_now, set_at)
  VALUES (OLD.user_id, OLD.priority_goal, OLD.secondary_goals, OLD.why_now, OLD.set_at);
  RETURN NEW;
END;
$$;

CREATE TRIGGER snapshot_user_goals_on_update
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_user_goals();

CREATE INDEX idx_user_goals_user ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_history_user ON public.user_goals_history(user_id, created_at DESC);