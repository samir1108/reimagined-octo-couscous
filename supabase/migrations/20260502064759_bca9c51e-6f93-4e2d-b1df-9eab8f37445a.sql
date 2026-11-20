ALTER TABLE public.pre_journey_progress
ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ;