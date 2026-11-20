
-- Fix overly permissive policies
DROP POLICY "Service upserts credits" ON public.user_credits;
DROP POLICY "Service inserts transactions" ON public.credit_transactions;

-- Only allow users to insert/update their own credits (edge function uses service role anyway)
CREATE POLICY "Users insert own credits" ON public.user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);

-- Transactions are insert-only by the user
CREATE POLICY "Users insert own transactions" ON public.credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
