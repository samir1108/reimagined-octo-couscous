-- Root cause: every table in public lost its grants (blanket REVOKE).
-- This restores Supabase-default privileges for anon / authenticated / service_role.
--
-- Run via: supabase db push  (executes as postgres)

-- 1. schema access
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. existing objects
GRANT ALL ON ALL TABLES     IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES  IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- 3. future objects created by postgres (supabase db push / migration runner)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES
  TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS
  TO anon, authenticated, service_role;
