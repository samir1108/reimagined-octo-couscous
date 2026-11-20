CREATE TABLE public.arrival_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL DEFAULT 'morning',
  body_state TEXT NOT NULL CHECK (body_state IN ('tight','neutral','open','heavy')),
  mind_state TEXT NOT NULL CHECK (mind_state IN ('racing','foggy','calm','scattered')),
  intention TEXT NOT NULL CHECK (intention IN ('ground','clarity','release','energy','ai_decide')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_arrival_states_user_date ON public.arrival_states(user_id, pack_date DESC);

ALTER TABLE public.arrival_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own arrival states"
ON public.arrival_states FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own arrival states"
ON public.arrival_states FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own arrival states"
ON public.arrival_states FOR UPDATE
USING (auth.uid() = user_id);
