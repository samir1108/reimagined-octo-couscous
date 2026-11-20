
-- ============ BIO SIGNALS ============
CREATE TABLE public.bio_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'healthkit' | 'google_fit' | 'oura' | 'fitbit' | 'garmin' | 'whoop' | 'polar_ble' | 'muse' | 'webcam_rppg'
  metric text NOT NULL, -- 'hrv_rmssd' | 'rhr' | 'sleep_score' | 'readiness' | 'stress' | 'spo2' | 'breath_rate' | 'body_battery'
  value numeric NOT NULL,
  unit text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_bio_signals_user_time ON public.bio_signals(user_id, recorded_at DESC);
CREATE INDEX idx_bio_signals_metric ON public.bio_signals(user_id, metric, recorded_at DESC);
ALTER TABLE public.bio_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bio_signals select" ON public.bio_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bio_signals insert" ON public.bio_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bio_signals update" ON public.bio_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own bio_signals delete" ON public.bio_signals FOR DELETE USING (auth.uid() = user_id);

-- ============ WORK SIGNALS ============
CREATE TABLE public.work_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'google_calendar' | 'outlook' | 'slack' | 'teams' | 'gmail' | 'linear' | 'github' | 'meeting_tone'
  signal_type text NOT NULL, -- 'meeting_load' | 'tone_sentiment' | 'focus_block' | 'late_night_work' | 'message_volume'
  value numeric,
  text_value text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_work_signals_user_time ON public.work_signals(user_id, occurred_at DESC);
ALTER TABLE public.work_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own work_signals select" ON public.work_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own work_signals insert" ON public.work_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own work_signals update" ON public.work_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own work_signals delete" ON public.work_signals FOR DELETE USING (auth.uid() = user_id);

-- ============ DEVICE SIGNALS ============
CREATE TABLE public.device_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL, -- 'ios_screentime' | 'android_usage' | 'chrome_ext' | 'desktop_sentinel' | 'keyboard_cadence'
  signal_type text NOT NULL, -- 'app_category_minutes' | 'phone_pickups' | 'tab_switches' | 'idle_minutes' | 'typing_wpm'
  category text, -- e.g. 'social', 'work', 'entertainment'
  value numeric NOT NULL,
  bucket_start timestamptz NOT NULL DEFAULT now(),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_device_signals_user_time ON public.device_signals(user_id, bucket_start DESC);
ALTER TABLE public.device_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own device_signals select" ON public.device_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own device_signals insert" ON public.device_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own device_signals update" ON public.device_signals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own device_signals delete" ON public.device_signals FOR DELETE USING (auth.uid() = user_id);

-- ============ SIGNAL CONSENTS ============
CREATE TABLE public.signal_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  mode text NOT NULL DEFAULT 'balanced', -- 'strict' | 'balanced' | 'off'
  granted_at timestamptz,
  revoked_at timestamptz,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source)
);
CREATE INDEX idx_signal_consents_user ON public.signal_consents(user_id);
ALTER TABLE public.signal_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own consents select" ON public.signal_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own consents insert" ON public.signal_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own consents update" ON public.signal_consents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own consents delete" ON public.signal_consents FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_signal_consents_updated
BEFORE UPDATE ON public.signal_consents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
