-- Backfill: grant 11 free credits (1100 paise) to any existing user who doesn't have a credits row yet.
INSERT INTO public.user_credits (user_id, balance_paise, total_purchased_paise)
SELECT u.id, 1100, 0
FROM auth.users u
LEFT JOIN public.user_credits uc ON uc.user_id = u.id
WHERE uc.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Log the bonus transaction for backfilled users (only if not already logged)
INSERT INTO public.credit_transactions (user_id, type, amount_paise, credits_paise, description)
SELECT u.id, 'bonus', 0, 1100, 'Welcome bonus: 11 free credits (backfill)'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_transactions ct
  WHERE ct.user_id = u.id AND ct.type = 'bonus' AND ct.description LIKE 'Welcome bonus%'
);

-- Send welcome notification to backfilled users (only if not already sent)
INSERT INTO public.notifications (user_id, type, title, body, metadata)
SELECT u.id, 'welcome', 'Welcome to ConsciousOS 🪔',
  'The Elder has gifted you 11 free credits to begin your journey. Step into the Temple whenever you''re ready.',
  jsonb_build_object('credits', 11, 'source', 'signup_bonus')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.notifications n
  WHERE n.user_id = u.id AND n.type = 'welcome'
);