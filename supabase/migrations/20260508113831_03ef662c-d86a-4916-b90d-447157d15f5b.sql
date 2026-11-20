
CREATE TABLE public.wearable_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'oura' | 'fitbit' | 'whoop' | 'garmin' | 'google_fit'
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);
ALTER TABLE public.wearable_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wearable_tokens" ON public.wearable_tokens FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_wearable_tokens_updated BEFORE UPDATE ON public.wearable_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.meeting_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'google_calendar' | 'outlook'
  external_event_id text NOT NULL,
  title text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  kind text NOT NULL DEFAULT 'pre', -- 'pre' | 'post'
  fired_at timestamptz,
  dismissed boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, external_event_id, kind)
);
CREATE INDEX idx_meeting_nudges_user_time ON public.meeting_nudges(user_id, starts_at DESC);
ALTER TABLE public.meeting_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meeting_nudges" ON public.meeting_nudges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fused_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  hrv_norm numeric, -- 0-1
  stress_norm numeric, -- 0-1
  focus_norm numeric, -- 0-1
  burnout_risk numeric, -- 0-1
  recommended_action text,
  detected_loops text[] NOT NULL DEFAULT '{}',
  inputs_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fused_signals_user_time ON public.fused_signals(user_id, computed_at DESC);
ALTER TABLE public.fused_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fused_signals select" ON public.fused_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own fused_signals insert" ON public.fused_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
