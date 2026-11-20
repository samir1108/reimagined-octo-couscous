-- Add session_config column to user_consciousness_profile
-- Stores user's tunable session configuration (JSONB)

ALTER TABLE public.user_consciousness_profile
ADD COLUMN IF NOT EXISTS session_config jsonb DEFAULT '{
  "focusType": "focus",
  "timeBudgetMin": 20,
  "domainWeights": {
    "relationship": 0.5,
    "work": 0.5,
    "finance": 0.3,
    "health": 0.5,
    "creativity": 0.3,
    "spirituality": 0.7
  },
  "speedProfile": "adaptive",
  "preferredGate": "flexible",
  "energyMode": "adaptive",
  "guideStyle": "gentle",
  "includedPracticeIds": [],
  "excludedPracticeIds": [],
  "includedTags": [],
  "excludedTags": [],
  "structure": "guided",
  "reflectionDepth": "standard",
  "archetypeWeights": {},
  "ingredientPreferences": {},
  "voiceEnabled": true,
  "language": "en",
  "difficultyOverride": "standard",
  "reducedMotion": false,
  "screenReaderOptimized": false,
  "version": 1,
  "updatedAt": "2026-10-26T00:00:00Z"
}'::jsonb;

COMMENT ON COLUMN public.user_consciousness_profile.session_config IS
'User-tunable session configuration: focus type, time budget, domain weights, guide style, content filters, etc.';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_consciousness_profile_session_config
ON public.user_consciousness_profile USING gin (session_config);

-- Add session_presets table for user-saved presets
CREATE TABLE IF NOT EXISTS public.user_session_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  config jsonb NOT NULL,
  is_system boolean DEFAULT false,
  use_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_session_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own session presets"
ON public.user_session_presets
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_session_presets_user_id ON public.user_session_presets(user_id);

COMMENT ON TABLE public.user_session_presets IS
'User-saved session configuration presets for quick switching.';