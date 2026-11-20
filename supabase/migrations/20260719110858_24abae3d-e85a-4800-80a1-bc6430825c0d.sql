
-- 1. user_credits: 11 free credits (1100 paise) to every new user
CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_paise BIGINT NOT NULL DEFAULT 1100,
  lifetime_paise BIGINT NOT NULL DEFAULT 1100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_credits TO authenticated;
GRANT ALL ON public.user_credits TO service_role;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own credits read" ON public.user_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL,
  balance_after_paise BIGINT NOT NULL,
  kind TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx read" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. AI usage log
CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  model TEXT,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  total_tokens INT DEFAULT 0,
  estimated_cost_paise BIGINT DEFAULT 0,
  charged_paise BIGINT DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_usage_log TO service_role;
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- 3. Grant 11 credits on signup via trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, balance_paise, lifetime_paise)
  VALUES (NEW.id, 1100, 1100)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.credit_transactions (user_id, amount_paise, balance_after_paise, kind, description)
  VALUES (NEW.id, 1100, 1100, 'grant', 'Welcome — 11 free credits');
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Backfill existing users
INSERT INTO public.user_credits (user_id, balance_paise, lifetime_paise)
SELECT id, 1100, 1100 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Credit RPCs
CREATE OR REPLACE FUNCTION public.check_credit_balance(p_user_id UUID, p_min_balance BIGINT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bal BIGINT;
BEGIN
  SELECT balance_paise INTO v_bal FROM public.user_credits WHERE user_id = p_user_id;
  IF v_bal IS NULL THEN
    INSERT INTO public.user_credits(user_id, balance_paise, lifetime_paise) VALUES (p_user_id, 1100, 1100)
    ON CONFLICT DO NOTHING;
    v_bal := 1100;
  END IF;
  RETURN jsonb_build_object('balance', v_bal, 'sufficient', v_bal >= p_min_balance);
END; $$;

CREATE OR REPLACE FUNCTION public.check_and_deduct_credits(p_user_id UUID, p_amount BIGINT, p_description TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bal BIGINT; v_new BIGINT;
BEGIN
  SELECT balance_paise INTO v_bal FROM public.user_credits WHERE user_id = p_user_id FOR UPDATE;
  IF v_bal IS NULL THEN
    INSERT INTO public.user_credits(user_id, balance_paise, lifetime_paise) VALUES (p_user_id, 1100, 1100);
    v_bal := 1100;
  END IF;
  IF v_bal < p_amount THEN
    RETURN jsonb_build_object('success', false, 'balance', v_bal, 'error', 'insufficient_credits');
  END IF;
  v_new := v_bal - p_amount;
  UPDATE public.user_credits SET balance_paise = v_new, updated_at = now() WHERE user_id = p_user_id;
  INSERT INTO public.credit_transactions(user_id, amount_paise, balance_after_paise, kind, description)
  VALUES (p_user_id, -p_amount, v_new, 'debit', p_description);
  RETURN jsonb_build_object('success', true, 'balance', v_new);
END; $$;

-- 5. user_consciousness_profile (fixes "Failed to create profile")
CREATE TABLE IF NOT EXISTS public.user_consciousness_profile (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension_bands JSONB NOT NULL DEFAULT '{"thought":0,"emotion":0,"body":0,"awareness":0}'::jsonb,
  v_level NUMERIC DEFAULT 0,
  journey_day INT DEFAULT 1,
  journey_phase TEXT DEFAULT 'assessment',
  witness_gap NUMERIC DEFAULT 0,
  witness_stability NUMERIC DEFAULT 0,
  witness_depth NUMERIC DEFAULT 0,
  active_loops JSONB DEFAULT '[]'::jsonb,
  samskaras JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_consciousness_profile TO authenticated;
GRANT ALL ON public.user_consciousness_profile TO service_role;
ALTER TABLE public.user_consciousness_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.user_consciousness_profile FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_journey_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  phase TEXT,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  engine_plan JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE ON public.user_journey_log TO authenticated;
GRANT ALL ON public.user_journey_log TO service_role;
ALTER TABLE public.user_journey_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journey log" ON public.user_journey_log FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
