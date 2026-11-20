-- ============================================================
-- GURU ANIMATIONS TABLE
-- Stores animation triggers from AI chat for analytics
-- ============================================================

-- Create enum for animation types
CREATE TYPE public.animation_category AS ENUM (
  'yoga',
  'breathing',
  'gesture',
  'expression'
);

-- Create guru_animations table
CREATE TABLE public.guru_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animation_type animation_category NOT NULL,
  animation_value TEXT NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  conversation_context TEXT,
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_guru_animations_user_id ON public.guru_animations(user_id);
CREATE INDEX idx_guru_animations_triggered_at ON public.guru_animations(triggered_at);
CREATE INDEX idx_guru_animations_session_id ON public.guru_animations(session_id);
CREATE INDEX idx_guru_animations_type ON public.guru_animations(animation_type);

-- Enable RLS
ALTER TABLE public.guru_animations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own animation logs
CREATE POLICY "Users can view own animation logs"
  ON public.guru_animations
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own animation logs
CREATE POLICY "Users can insert own animation logs"
  ON public.guru_animations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Service role can manage all animation logs
CREATE POLICY "Service role can manage all animation logs"
  ON public.guru_animations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Helper function to log animation trigger (for use in edge functions)
CREATE OR REPLACE FUNCTION public.log_guru_animation(
  p_user_id UUID,
  p_animation_type animation_category,
  p_animation_value TEXT,
  p_session_id TEXT DEFAULT NULL,
  p_conversation_context TEXT DEFAULT NULL,
  p_confidence REAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.guru_animations (
    user_id,
    animation_type,
    animation_value,
    session_id,
    conversation_context,
    confidence
  ) VALUES (
    p_user_id,
    p_animation_type,
    p_animation_value,
    p_session_id,
    p_conversation_context,
    p_confidence
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Comment for documentation
COMMENT ON TABLE public.guru_animations IS 'Logs animation triggers from AI chat for the 3D Guru character. Used for analytics and debugging.';
COMMENT ON COLUMN public.guru_animations.user_id IS 'The user who triggered the animation';
COMMENT ON COLUMN public.guru_animations.animation_type IS 'Category of animation: yoga, breathing, gesture, or expression';
COMMENT ON COLUMN public.guru_animations.animation_value IS 'Specific animation value (e.g., warrior1, boxBreathing, namaste)';
COMMENT ON COLUMN public.guru_animations.triggered_at IS 'When the animation was triggered';
COMMENT ON COLUMN public.guru_animations.session_id IS 'Optional session ID for correlating with chat sessions';
COMMENT ON COLUMN public.guru_animations.conversation_context IS 'Optional snippet of conversation context';
COMMENT ON COLUMN public.guru_animations.confidence IS 'Confidence score from AI detection (0-1)';
