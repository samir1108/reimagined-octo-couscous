DO $$
DECLARE
  uid uuid;
  t text;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'samirsourav7@gmail.com';
  IF uid IS NULL THEN
    RAISE NOTICE 'No user found';
    RETURN;
  END IF;

  FOR t IN
    SELECT c.table_name FROM information_schema.columns c
    JOIN information_schema.tables tbl
      ON tbl.table_schema = c.table_schema
      AND tbl.table_name = c.table_name
      AND tbl.table_type = 'BASE TABLE'
    WHERE c.table_schema = 'public'
      AND c.column_name = 'user_id'
  LOOP
    EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', t) USING uid;
  END LOOP;

  DELETE FROM auth.users WHERE id = uid;
END $$;