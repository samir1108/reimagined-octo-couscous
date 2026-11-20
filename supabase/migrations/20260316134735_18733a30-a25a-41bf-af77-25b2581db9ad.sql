
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

  -- Give 100 free credits (₹100 = 10000 paise)
  INSERT INTO public.user_credits (user_id, balance_paise, total_purchased_paise)
  VALUES (NEW.id, 10000, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log the welcome bonus
  INSERT INTO public.credit_transactions (user_id, type, amount_paise, credits_paise, description)
  VALUES (NEW.id, 'bonus', 0, 10000, 'Welcome bonus: ₹100 free credits');

  RETURN NEW;
END;
$function$;
