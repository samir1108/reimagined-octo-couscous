CREATE OR REPLACE FUNCTION public.simtest_confirm_user(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_email IS NULL OR p_email NOT LIKE 'simtest_%' THEN
    RAISE EXCEPTION 'simtest_confirm_user only allowed for simtest_ prefixed emails';
  END IF;

  UPDATE auth.users
     SET email_confirmed_at = COALESCE(email_confirmed_at, now())
   WHERE email = p_email
   RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.simtest_confirm_user(text) TO anon, authenticated;