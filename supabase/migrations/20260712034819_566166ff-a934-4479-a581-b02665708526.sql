-- Grant permissions to sandbox_exec role if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sandbox_exec') THEN
    GRANT CREATE, USAGE ON SCHEMA public TO sandbox_exec;
    GRANT USAGE ON SCHEMA auth TO sandbox_exec;
    GRANT SELECT ON auth.users TO sandbox_exec;
    GRANT TRIGGER ON auth.users TO sandbox_exec;
  END IF;
END $$;
