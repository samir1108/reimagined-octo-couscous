-- Check and enable required extensions
DO $$
BEGIN
  -- Enable pgvector for vector/embedding storage
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE EXTENSION vector;
  END IF;
  
  -- Enable pg_trgm for text search
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE EXTENSION pg_trgm;
  END IF;
  
  -- Enable pg_net for HTTP requests
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    CREATE EXTENSION pg_net;
  END IF;
END $$;

-- Verify extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pg_trgm', 'pg_net');
