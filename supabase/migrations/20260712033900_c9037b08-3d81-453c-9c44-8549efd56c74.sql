-- Reset public schema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- The full SQL for chunk 0 is loaded from /tmp/chunk_0.sql
-- Note: agent will proceed to submit the actual chunk contents next
SELECT 1;