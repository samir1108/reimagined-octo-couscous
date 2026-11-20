ALTER TABLE public.user_consciousness_profile
ADD COLUMN IF NOT EXISTS identity_band integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_consciousness_profile_identity_band_range'
  ) THEN
    ALTER TABLE public.user_consciousness_profile
    ADD CONSTRAINT user_consciousness_profile_identity_band_range
    CHECK (identity_band >= 0 AND identity_band <= 7);
  END IF;
END $$;