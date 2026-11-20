-- PostgREST caches the schema; tables added by migrations are invisible to the
-- REST API (404 / PGRST205) until it reloads. Notify it explicitly.
NOTIFY pgrst, 'reload schema';
