ALTER TABLE public.user_consciousness_profile 
ADD COLUMN IF NOT EXISTS paused_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS pause_reason text DEFAULT NULL;