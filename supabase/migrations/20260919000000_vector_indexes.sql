
-- Ensure pgvector extension is available
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector index to guru_memory.content_embedding if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'guru_memory') THEN
    CREATE INDEX IF NOT EXISTS idx_guru_memory_content_embedding
      ON public.guru_memory USING hnsw (content_embedding vector_cosine_ops);
  END IF;
END $$;

-- Add vector index to director_brain_nodes.embedding if missing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.director_brain_nodes'::regclass
      AND attname = 'embedding'
      AND NOT attisdropped
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_director_brain_nodes_embedding
      ON public.director_brain_nodes USING hnsw (embedding vector_cosine_ops);
  END IF;
END $$;
