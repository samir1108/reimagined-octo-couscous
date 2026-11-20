-- ============================================================
-- HARDWARE SIGNAL TABLES — Bio, Voice, Facial, Environment
-- ============================================================
-- Tables for ingesting physiological and environmental consciousness signals

-- Bio Signals (wearables: HRV, EDA, temp, accelerometer, SpO2)
CREATE TABLE IF NOT EXISTS public.bio_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hrv NUMERIC,                    -- Heart Rate Variability (ms)
  eda NUMERIC,                    -- Electrodermal Activity (µS)
  skin_temp NUMERIC,              -- Skin Temperature (°C)
  accelerometer JSONB,            -- {x, y, z} acceleration
  spo2 NUMERIC,                   -- Blood Oxygen Saturation (%)
  source TEXT DEFAULT 'manual',   -- apple_watch, garmin, whoop, oura, manual
  device_id TEXT,                 -- Device identifier
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bio_signals_user_created_idx ON public.bio_signals (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bio_signals_source_idx ON public.bio_signals (source);

ALTER TABLE public.bio_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bio signals" ON public.bio_signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bio signals" ON public.bio_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Voice Patterns (prosody, word patterns, speech/silence, vocal biomarkers)
CREATE TABLE IF NOT EXISTS public.voice_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prosody JSONB,                          -- {pitch, speed, variability}
  word_patterns JSONB,                    -- {shouldCount, cantCount, theyAlwaysCount, itsFineCount, noticeCount}
  speech_silence_ratio NUMERIC,           -- Ratio of speech to silence
  vocal_biomarkers JSONB,                 -- {cortisol, microTremors, breathPatterns}
  conversation_dynamics JSONB,            -- {dominance, topicAvoidance, emotionalContagion, agreementPatterns}
  source TEXT DEFAULT 'unknown',          -- listening_device, phone_call, voice_memo
  duration_sec INTEGER,                   -- Duration of analyzed audio
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS voice_patterns_user_created_idx ON public.voice_patterns (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS voice_patterns_source_idx ON public.voice_patterns (source);

ALTER TABLE public.voice_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own voice patterns" ON public.voice_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own voice patterns" ON public.voice_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Micro Expressions (facial consciousness detection)
CREATE TABLE IF NOT EXISTS public.micro_expressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contempt_flash BOOLEAN,
  fear_flash BOOLEAN,
  disgust_flash BOOLEAN,
  eye_patterns JSONB,                     -- {rapidMovement, softGaze, downwardGaze, avoidance}
  facial_tension JSONB,                   -- {jawClenching, foreheadTension, eyeArea}
  breathing_patterns JSONB,               -- {shallow, deep, irregular}
  state_classification TEXT,              -- kshipta, mudha, vikshipta, ekagra, niruddha
  source TEXT DEFAULT 'unknown',          -- mirror_camera, phone_camera, dedicated_device
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS micro_expressions_user_created_idx ON public.micro_expressions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS micro_expressions_session_idx ON public.micro_expressions (session_id);
CREATE INDEX IF NOT EXISTS micro_expressions_state_idx ON public.micro_expressions (state_classification);

ALTER TABLE public.micro_expressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own micro expressions" ON public.micro_expressions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own micro expressions" ON public.micro_expressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Environment Scans (ambient consciousness context)
CREATE TABLE IF NOT EXISTS public.environment_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  light_level NUMERIC,                    -- Lux
  sound_level NUMERIC,                    -- Decibels
  air_quality NUMERIC,                    -- AQI
  temperature NUMERIC,                    -- Celsius
  location_pattern TEXT,                  -- office, home, transit, nature, gym
  screen_time INTEGER,                    -- Minutes since last scan
  social_proximity INTEGER,               -- People detected nearby
  source TEXT DEFAULT 'unknown',          -- phone_sensors, dedicated_device, smart_home
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS environment_scans_user_created_idx ON public.environment_scans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS environment_scans_location_idx ON public.environment_scans (location_pattern);

ALTER TABLE public.environment_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own environment scans" ON public.environment_scans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own environment scans" ON public.environment_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Consciousness Fingerprint (Invention 5)
CREATE TABLE IF NOT EXISTS public.consciousness_fingerprint (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  loop_constellation JSONB,               -- {loopId: {count, severity, firstSeen, lastSeen}}
  dominant_lens TEXT,                     -- head, heart, gut, witness
  chitta_vritti TEXT,                     -- kshipta, mudha, vikshipta, ekagra, niruddha
  chakra_blocks JSONB,                    -- {chakra: {blocked: boolean, severity: number}}
  samskara_depth JSONB,                   -- {rootWound: {depth: number, loops: []}}
  witness_stability_curve JSONB,          -- [{date, stability}]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consciousness_fingerprint ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own fingerprint" ON public.consciousness_fingerprint
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own fingerprint" ON public.consciousness_fingerprint
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fingerprint" ON public.consciousness_fingerprint
  FOR UPDATE USING (auth.uid() = user_id);

-- Loop Resonance (Invention 6) - between two users
CREATE TABLE IF NOT EXISTS public.loop_resonance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resonance_loops JSONB,                  -- {loopId: {userA_severity, userB_severity, resonance_score}}
  resonance_score NUMERIC DEFAULT 0,      -- 0-1 overall resonance
  relationship_type TEXT,                 -- partner, family, friend, colleague
  status TEXT DEFAULT 'active',           -- active, resolved, archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

CREATE INDEX IF NOT EXISTS loop_resonance_user_a_idx ON public.loop_resonance (user_a);
CREATE INDEX IF NOT EXISTS loop_resonance_user_b_idx ON public.loop_resonance (user_b);

ALTER TABLE public.loop_resonance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own resonances" ON public.loop_resonance
  FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Consciousness Weather (Invention 7) - daily forecast
CREATE TABLE IF NOT EXISTS public.consciousness_weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  clarity_score NUMERIC,                  -- 0-100
  emotional_turbulence TEXT,              -- low, medium, high
  loop_wind JSONB,                        -- {loopId: intensity}
  witness_temperature NUMERIC,            -- V-Level equivalent
  forecast JSONB,                         -- {hour: {predictedLoops, recommendation}}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS consciousness_weather_user_date_idx ON public.consciousness_weather (user_id, forecast_date DESC);

ALTER TABLE public.consciousness_weather ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own weather" ON public.consciousness_weather
  FOR SELECT USING (auth.uid() = user_id);

-- Session Outcome Correlation (for auto-recalibration)
CREATE TABLE IF NOT EXISTS public.session_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spine_id UUID REFERENCES public.session_spine(id) ON DELETE SET NULL,
  quality_score NUMERIC,                  -- 0-1
  loops_touched TEXT[],
  dimension_nudges JSONB,                 -- {dimension: delta}
  vlevel_delta NUMERIC,
  mood_before TEXT,
  mood_after TEXT,
  energy_before TEXT,
  energy_after TEXT,
  breakthrough_detected BOOLEAN DEFAULT FALSE,
  regression_detected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS session_outcomes_user_created_idx ON public.session_outcomes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS session_outcomes_session_idx ON public.session_outcomes (session_id);

ALTER TABLE public.session_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own outcomes" ON public.session_outcomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role inserts outcomes" ON public.session_outcomes
  FOR INSERT WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consciousness_fingerprint_updated_at
  BEFORE UPDATE ON public.consciousness_fingerprint
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loop_resonance_updated_at
  BEFORE UPDATE ON public.loop_resonance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.bio_signals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.voice_patterns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.micro_expressions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.environment_scans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.consciousness_fingerprint TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.loop_resonance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.consciousness_weather TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.session_outcomes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.bio_signals TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.voice_patterns TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.micro_expressions TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.environment_scans TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.consciousness_fingerprint TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.loop_resonance TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.consciousness_weather TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.session_outcomes TO service_role;