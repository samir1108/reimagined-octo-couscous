
ALTER TABLE public.user_credits ADD COLUMN IF NOT EXISTS total_purchased_paise bigint NOT NULL DEFAULT 0;
UPDATE public.user_credits SET total_purchased_paise = lifetime_paise WHERE total_purchased_paise = 0 AND lifetime_paise > 0;

ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS credits_paise bigint;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.credit_transactions ADD COLUMN IF NOT EXISTS razorpay_order_id text;
CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_razorpay_payment_idx ON public.credit_transactions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
