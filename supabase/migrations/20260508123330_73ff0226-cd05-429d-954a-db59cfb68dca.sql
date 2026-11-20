
CREATE TABLE public.nudge_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('instant','pre_event','post_event','pattern')),
  priority INTEGER NOT NULL DEFAULT 50,
  fire_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','shown','acted','dismissed','expired')),
  title TEXT NOT NULL,
  body TEXT,
  cta_label TEXT,
  cta_action TEXT,
  cta_payload JSONB DEFAULT '{}'::jsonb,
  attribution JSONB DEFAULT '{}'::jsonb,
  source JSONB DEFAULT '{}'::jsonb,
  dedupe_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acted_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);
CREATE INDEX idx_nudge_queue_user_fire ON public.nudge_queue(user_id, fire_at DESC) WHERE status = 'pending';
CREATE INDEX idx_nudge_queue_user_status ON public.nudge_queue(user_id, status, priority DESC);
CREATE UNIQUE INDEX idx_nudge_queue_dedupe ON public.nudge_queue(user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;
ALTER TABLE public.nudge_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own nudges" ON public.nudge_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own nudges" ON public.nudge_queue FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own nudges" ON public.nudge_queue FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service inserts nudges" ON public.nudge_queue FOR INSERT WITH CHECK (true);
CREATE TRIGGER trg_nudge_queue_updated BEFORE UPDATE ON public.nudge_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.loop_attributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loop_id TEXT NOT NULL,
  loop_name TEXT,
  window_label TEXT NOT NULL CHECK (window_label IN ('3h','7d')),
  confidence NUMERIC NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  contributing_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);
CREATE INDEX idx_loop_attr_user_active ON public.loop_attributions(user_id, expires_at DESC, confidence DESC);
CREATE INDEX idx_loop_attr_user_loop ON public.loop_attributions(user_id, loop_id, window_label, created_at DESC);
ALTER TABLE public.loop_attributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attributions" ON public.loop_attributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users delete own attributions" ON public.loop_attributions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service inserts attributions" ON public.loop_attributions FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.nudge_queue;
ALTER TABLE public.nudge_queue REPLICA IDENTITY FULL;
