
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_credit_balance(UUID, BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_deduct_credits(UUID, BIGINT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_credit_balance(UUID, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_deduct_credits(UUID, BIGINT, TEXT) TO service_role;
