-- Helper: confirm a simulated test user's email (only simtest_ prefix allowed)
CREATE OR REPLACE FUNCTION public.simtest_confirm_user(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- HARD GUARD: only act on simtest_ prefixed emails
  IF p_email IS NULL OR p_email NOT LIKE 'simtest_%' THEN
    RAISE EXCEPTION 'simtest_confirm_user only allowed for simtest_ prefixed emails';
  END IF;

  UPDATE auth.users
     SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
         confirmed_at       = COALESCE(confirmed_at, now())
   WHERE email = p_email
   RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;

-- Helper: purge all data for a simulated user (only simtest_ prefix allowed)
CREATE OR REPLACE FUNCTION public.simtest_purge_user(p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_count integer := 0;
BEGIN
  IF p_email IS NULL OR p_email NOT LIKE 'simtest_%' THEN
    RAISE EXCEPTION 'simtest_purge_user only allowed for simtest_ prefixed emails';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Delete from public tables that reference user_id (best-effort, ignore missing tables)
  BEGIN DELETE FROM public.session_messages WHERE session_id IN (SELECT id FROM public.sessions WHERE user_id = v_user_id); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.sessions WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.journal_entries WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.daily_tasks WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.guru_memory WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_consciousness_profile WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_psyche_profile WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_loops WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_samskaras WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.notifications WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.credit_transactions WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_credits WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_karma WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.karma_events WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.consciousness_signals WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.user_goals WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM public.profiles WHERE user_id = v_user_id; EXCEPTION WHEN undefined_table THEN NULL; END;
  -- Finally remove the auth user
  DELETE FROM auth.users WHERE id = v_user_id;

  v_count := 1;
  RETURN v_count;
END;
$$;

-- Allow anon + authenticated to call (guarded by prefix check inside)
GRANT EXECUTE ON FUNCTION public.simtest_confirm_user(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.simtest_purge_user(text) TO anon, authenticated;