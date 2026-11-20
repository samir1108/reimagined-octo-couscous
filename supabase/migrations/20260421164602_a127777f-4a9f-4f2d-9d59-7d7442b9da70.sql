-- ARC TEMPLATES (curated library)
CREATE TABLE public.arc_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sanskrit_title TEXT,
  modern_title TEXT,
  short_description TEXT NOT NULL,
  long_description TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 21, 49)),
  voice_style TEXT NOT NULL DEFAULT 'adaptive' CHECK (voice_style IN ('sanskrit', 'modern', 'adaptive')),
  primary_path TEXT,
  primary_practice TEXT,
  primary_chakra TEXT,
  assigned_guru TEXT,
  tradition TEXT,
  phase_structure JSONB NOT NULL DEFAULT '[]'::jsonb,
  daily_chapter_seeds JSONB NOT NULL DEFAULT '[]'::jsonb,
  harvest_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty TEXT NOT NULL DEFAULT 'moderate' CHECK (difficulty IN ('gentle', 'moderate', 'intense')),
  recommended_band_min NUMERIC DEFAULT 0,
  recommended_band_max NUMERIC DEFAULT 10,
  triggers_for_loops TEXT[] DEFAULT ARRAY[]::TEXT[],
  triggers_for_life_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  cover_emoji TEXT DEFAULT '🪔',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.arc_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates readable by everyone"
ON public.arc_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Only platform admins can manage templates"
ON public.arc_templates FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER arc_templates_updated_at
BEFORE UPDATE ON public.arc_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_arc_templates_active ON public.arc_templates(is_active, is_featured);
CREATE INDEX idx_arc_templates_loops ON public.arc_templates USING GIN(triggers_for_loops);

-- THEME ARCS (user's active/past journeys)
CREATE TABLE public.theme_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.arc_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  intention TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 108),
  current_day INTEGER NOT NULL DEFAULT 1,
  current_phase TEXT NOT NULL DEFAULT 'ground',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned', 'harvested')),
  source TEXT NOT NULL DEFAULT 'user' CHECK (source IN ('user', 'orchestrator', 'loop_triggered', 'life_event', 'pair', 'echo')),
  voice_style TEXT NOT NULL DEFAULT 'adaptive',
  primary_path TEXT,
  primary_practice TEXT,
  primary_chakra TEXT,
  assigned_guru TEXT,
  spirit JSONB NOT NULL DEFAULT '{}'::jsonb,
  pair_arc_id UUID,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expected_end_date DATE,
  completed_at TIMESTAMPTZ,
  harvest_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.theme_arcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own arcs"
ON public.theme_arcs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own arcs"
ON public.theme_arcs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own arcs"
ON public.theme_arcs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own arcs"
ON public.theme_arcs FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER theme_arcs_updated_at
BEFORE UPDATE ON public.theme_arcs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_theme_arcs_user_active ON public.theme_arcs(user_id, status);
CREATE INDEX idx_theme_arcs_user_completed ON public.theme_arcs(user_id, completed_at DESC);

-- ARC CHAPTERS (one row per day of an arc)
CREATE TABLE public.arc_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arc_id UUID NOT NULL REFERENCES public.theme_arcs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  phase TEXT NOT NULL DEFAULT 'ground',
  chapter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  chapter_title TEXT,
  chapter_summary TEXT,
  user_reflection TEXT,
  marker TEXT CHECK (marker IN ('normal', 'breakthrough', 'skip', 'rest', 'pivot', 'harvest')),
  quality_score NUMERIC,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (arc_id, day_number)
);

ALTER TABLE public.arc_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chapters"
ON public.arc_chapters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own chapters"
ON public.arc_chapters FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own chapters"
ON public.arc_chapters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own chapters"
ON public.arc_chapters FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER arc_chapters_updated_at
BEFORE UPDATE ON public.arc_chapters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_arc_chapters_arc ON public.arc_chapters(arc_id, day_number);
CREATE INDEX idx_arc_chapters_user_date ON public.arc_chapters(user_id, chapter_date DESC);

-- ARC ECHOES (scheduled remembrances)
CREATE TABLE public.arc_echoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  arc_id UUID NOT NULL REFERENCES public.theme_arcs(id) ON DELETE CASCADE,
  scheduled_for DATE NOT NULL,
  echo_type TEXT NOT NULL DEFAULT '30d' CHECK (echo_type IN ('30d', '90d', '365d', 'lunar', 'seasonal', 'manual')),
  delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMPTZ,
  delivered_theme_id UUID REFERENCES public.daily_themes(id) ON DELETE SET NULL,
  message_seed TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.arc_echoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own echoes"
ON public.arc_echoes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create own echoes"
ON public.arc_echoes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own echoes"
ON public.arc_echoes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own echoes"
ON public.arc_echoes FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_arc_echoes_pending ON public.arc_echoes(user_id, scheduled_for) WHERE delivered = false;

-- ARC PAIR INVITES (walk an arc with a friend)
CREATE TABLE public.arc_pair_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_user_id UUID,
  template_id UUID REFERENCES public.arc_templates(id) ON DELETE SET NULL,
  inviter_arc_id UUID REFERENCES public.theme_arcs(id) ON DELETE SET NULL,
  invitee_arc_id UUID REFERENCES public.theme_arcs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  message TEXT,
  token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.arc_pair_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviter can view own invites"
ON public.arc_pair_invites FOR SELECT
USING (auth.uid() = inviter_user_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Users send own invites"
ON public.arc_pair_invites FOR INSERT
WITH CHECK (auth.uid() = inviter_user_id);

CREATE POLICY "Inviter or invitee can update"
ON public.arc_pair_invites FOR UPDATE
USING (auth.uid() = inviter_user_id OR auth.uid() = invitee_user_id);

CREATE POLICY "Inviter can delete own invites"
ON public.arc_pair_invites FOR DELETE
USING (auth.uid() = inviter_user_id);

CREATE INDEX idx_pair_invites_invitee ON public.arc_pair_invites(invitee_email, status);
CREATE INDEX idx_pair_invites_token ON public.arc_pair_invites(token);