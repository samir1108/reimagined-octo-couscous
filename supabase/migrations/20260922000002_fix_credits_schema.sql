
ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS lifetime_paise bigint NOT NULL DEFAULT 0;

ALTER TABLE public.credit_transactions
  ADD COLUMN IF NOT EXISTS balance_after_paise bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'debit';
