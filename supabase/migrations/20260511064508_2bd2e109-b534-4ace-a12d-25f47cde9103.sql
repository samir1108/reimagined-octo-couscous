
-- ============================================================
-- FOUNDER GATE: auto-grant admin role to samirsourav7@gmail.com
-- ============================================================
CREATE OR REPLACE FUNCTION public.grant_founder_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'samirsourav7@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_grant_founder ON auth.users;
CREATE TRIGGER on_auth_user_grant_founder
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.grant_founder_role();

-- Backfill if user already exists
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'samirsourav7@gmail.com' LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- TIER 2: AI Training Studio
-- ============================================================
CREATE TABLE IF NOT EXISTS public.training_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL,                       -- 'temple-chat', 'guide-chat', etc
  source_session_id UUID,
  source_message_id UUID,
  user_input TEXT NOT NULL,
  ai_output TEXT NOT NULL,
  ideal_output TEXT,                           -- corrected ideal response
  rating TEXT NOT NULL CHECK (rating IN ('good','bad','neutral')),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  tagged_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_training_examples_feature ON public.training_examples(feature, rating);
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage training examples"
  ON public.training_examples FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL,
  version INT NOT NULL,
  system_prompt TEXT NOT NULL,
  few_shot_examples JSONB DEFAULT '[]'::jsonb,
  model TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feature, version)
);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_feature_active ON public.prompt_versions(feature, is_active);
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage prompt versions"
  ON public.prompt_versions FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.prompt_evals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_version_id UUID NOT NULL REFERENCES public.prompt_versions(id) ON DELETE CASCADE,
  example_id UUID NOT NULL REFERENCES public.training_examples(id) ON DELETE CASCADE,
  generated_output TEXT NOT NULL,
  score NUMERIC,
  judge_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.prompt_evals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read prompt evals"
  ON public.prompt_evals FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins write prompt evals"
  ON public.prompt_evals FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- ============================================================
-- TIER 3: Operational power tools
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_pct INT NOT NULL DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  target_user_ids UUID[] DEFAULT '{}',
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage flags"
  ON public.feature_flags FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Anyone reads flags"
  ON public.feature_flags FOR SELECT TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'all',          -- 'all', 'at_risk', 'onboarded', etc
  segment_filter JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',         -- 'draft','sent'
  recipient_count INT DEFAULT 0,
  created_by UUID NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage broadcasts"
  ON public.broadcasts FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.impersonation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  reason TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage impersonation"
  ON public.impersonation_logs FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- ============================================================
-- TIER 4: Predictive
-- ============================================================
CREATE TABLE IF NOT EXISTS public.anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL,                           -- 'cost_spike','error_surge','churn_cliff','signup_drop'
  severity TEXT NOT NULL DEFAULT 'info',        -- 'info','warn','critical'
  title TEXT NOT NULL,
  detail JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_anomalies_unack ON public.anomalies(acknowledged, detected_at DESC);
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read anomalies"
  ON public.anomalies FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins ack anomalies"
  ON public.anomalies FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.churn_predictions (
  user_id UUID PRIMARY KEY,
  churn_probability NUMERIC NOT NULL,
  predicted_churn_date DATE,
  top_reason TEXT,
  reasons JSONB DEFAULT '[]'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.churn_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read churn predictions"
  ON public.churn_predictions FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- ============================================================
-- TIER 5: BI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.master_popularity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id TEXT NOT NULL,
  day DATE NOT NULL,
  session_count INT NOT NULL DEFAULT 0,
  unique_users INT NOT NULL DEFAULT 0,
  avg_rating NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (master_id, day)
);
ALTER TABLE public.master_popularity_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read master popularity"
  ON public.master_popularity_daily FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- ============================================================
-- Helper function: grant credits to a user (Tier 3 power tool)
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_grant_credits(p_user_id UUID, p_paise INT, p_note TEXT DEFAULT 'Admin grant')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_new INT;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  IF p_paise <= 0 OR p_paise > 1000000 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  INSERT INTO public.user_credits (user_id, balance_paise, total_purchased_paise)
  VALUES (p_user_id, p_paise, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET balance_paise = public.user_credits.balance_paise + p_paise
  RETURNING balance_paise INTO v_new;

  INSERT INTO public.credit_transactions (user_id, type, amount_paise, credits_paise, description)
  VALUES (p_user_id, 'bonus', 0, p_paise, COALESCE(p_note,'Admin grant'));

  RETURN jsonb_build_object('balance_paise', v_new);
END;
$$;
