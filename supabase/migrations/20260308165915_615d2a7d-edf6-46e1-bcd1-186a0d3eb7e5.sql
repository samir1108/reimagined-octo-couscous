
-- Credits balance table
CREATE TABLE public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance_paise integer NOT NULL DEFAULT 0,
  total_purchased_paise integer NOT NULL DEFAULT 0,
  total_used_paise integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Credit transactions log
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'purchase',
  amount_paise integer NOT NULL,
  credits_paise integer NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_credits
CREATE POLICY "Users view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service upserts credits" ON public.user_credits FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for credit_transactions
CREATE POLICY "Users view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts transactions" ON public.credit_transactions FOR INSERT WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
