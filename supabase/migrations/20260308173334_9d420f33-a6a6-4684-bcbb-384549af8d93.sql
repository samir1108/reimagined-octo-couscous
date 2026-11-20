
-- Atomic credit check + deduction function (prevents race conditions)
CREATE OR REPLACE FUNCTION public.check_and_deduct_credits(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance integer;
  current_used integer;
  new_balance integer;
BEGIN
  -- Lock the row for update (prevents concurrent reads)
  SELECT balance_paise, total_used_paise 
  INTO current_balance, current_used
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_credit_row', 'balance', 0);
  END IF;

  IF current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits', 'balance', current_balance);
  END IF;

  new_balance := current_balance - p_amount;

  UPDATE user_credits
  SET balance_paise = new_balance,
      total_used_paise = COALESCE(current_used, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, type, amount_paise, credits_paise, description)
  VALUES (p_user_id, 'usage', p_amount, -p_amount, p_description);

  RETURN jsonb_build_object('success', true, 'charged', p_amount, 'new_balance', new_balance);
END;
$$;

-- Atomic credit pre-check function (just checks balance without deducting)
CREATE OR REPLACE FUNCTION public.check_credit_balance(p_user_id uuid, p_min_balance integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_balance integer;
BEGIN
  SELECT balance_paise INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id;

  IF current_balance IS NULL OR current_balance < p_min_balance THEN
    RETURN jsonb_build_object('sufficient', false, 'balance', COALESCE(current_balance, 0));
  END IF;

  RETURN jsonb_build_object('sufficient', true, 'balance', current_balance);
END;
$$;
