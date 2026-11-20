
-- ============================================================================
-- Soul Profile — the 60-min "meet yourself" onboarding
-- ============================================================================
-- One row per user. Chambers are answered progressively; each write updates
-- both `answers` (raw responses) and `derived` (structured fields the LLMs
-- read on every prompt). Nothing is required at once — the ritual is
-- resumable, revisitable, and never blocks the app.

-- Ensure touch_updated_at function exists
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.soul_profile (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Chamber completion tracking (1..7). Nulls until the chamber is finished.
  chamber_1_completed_at timestamptz,
  chamber_2_completed_at timestamptz,
  chamber_3_completed_at timestamptz,
  chamber_4_completed_at timestamptz,
  chamber_5_completed_at timestamptz,
  chamber_6_completed_at timestamptz,
  chamber_7_completed_at timestamptz,

  -- Layered soul data. Each chamber writes into one or more of these.
  -- surface: age band, sleep hrs, screen hrs, city, family status
  -- somatic: where tension lives, breath rate, energy at wake, body relationship
  -- psychological: dominant thought loop, defended emotion, inherited pattern
  -- karmic: the vow, the longing, unlived life, 90-day contract
  -- doorway: yoga path affinities (bhakti/jnana/karma/raja/tantra/shakti scores + entry level)
  -- shadow: which emotion is loudest, which is denied, which is disowned
  -- prohibitions: hard constraints — words the guru must never say, topics off-limits
  answers               jsonb NOT NULL DEFAULT '{}'::jsonb,
  derived               jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- The one-sentence vow the user writes in Chamber 7. Becomes the
  -- system's contract with them; surfaced back on home for 90 days.
  vow_text              text,
  vow_set_at            timestamptz,
  vow_expires_at        timestamptz,

  -- The doorway diagnostic result (from Chamber 5). Used to route the
  -- user to their entry Path + entry Level.
  primary_path_slug     text,
  primary_path_level    int,

  -- Full 60 min completed at least once? Toggles the "deepen your profile"
  -- card off on home, allows yearly re-run.
  fully_completed_at    timestamptz,
  last_revisited_at     timestamptz,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.soul_profile TO authenticated;
GRANT ALL ON public.soul_profile TO service_role;

ALTER TABLE public.soul_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own soul profile"
  ON public.soul_profile
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER soul_profile_touch_updated_at
  BEFORE UPDATE ON public.soul_profile
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX IF NOT EXISTS soul_profile_user_id_idx ON public.soul_profile(user_id);
