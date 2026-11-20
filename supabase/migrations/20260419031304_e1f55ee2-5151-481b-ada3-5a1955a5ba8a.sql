CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );

  -- Give 11 free credits welcome bonus (1100 paise)
  INSERT INTO public.user_credits (user_id, balance_paise, total_purchased_paise)
  VALUES (NEW.id, 1100, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the welcome bonus transaction
  INSERT INTO public.credit_transactions (user_id, type, amount_paise, credits_paise, description)
  VALUES (NEW.id, 'bonus', 0, 1100, 'Welcome bonus: 11 free credits');

  -- Send welcome notification
  INSERT INTO public.notifications (user_id, type, title, body, metadata)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome to ConsciousOS 🪔',
    'You''ve received 11 free credits to begin your journey. Step into the Temple whenever you''re ready.',
    jsonb_build_object('credits', 11, 'source', 'signup_bonus')
  );

  RETURN NEW;
END;
$function$;