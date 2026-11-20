-- Extend soul_profile for chambers 8-12 (archetype, loops, band, council, witness)
ALTER TABLE public.soul_profile
  ADD COLUMN IF NOT EXISTS chamber_8_completed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS chamber_9_completed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS chamber_10_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS chamber_11_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS chamber_12_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS archetype_primary   text,
  ADD COLUMN IF NOT EXISTS archetype_shadow    text,
  ADD COLUMN IF NOT EXISTS active_loop_families jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS practice_band       text,
  ADD COLUMN IF NOT EXISTS practice_minutes_per_day int,
  ADD COLUMN IF NOT EXISTS inner_council       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS witness_baseline    int;