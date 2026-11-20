
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create guru_memory table
CREATE TABLE public.guru_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_type text NOT NULL DEFAULT 'session',
  source_id uuid,
  content text NOT NULL,
  content_embedding vector(768),
  content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  importance integer NOT NULL DEFAULT 5,
  category text NOT NULL DEFAULT 'insight',
  tags text[] DEFAULT '{}',
  emotional_tone text,
  dimension_relevant text,
  linked_loops text[] DEFAULT '{}',
  access_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_guru_memory_user_id ON public.guru_memory(user_id);
CREATE INDEX idx_guru_memory_tsv ON public.guru_memory USING gin(content_tsv);
CREATE INDEX idx_guru_memory_category ON public.guru_memory(category);
CREATE INDEX idx_guru_memory_importance ON public.guru_memory(importance DESC);
CREATE INDEX idx_guru_memory_created ON public.guru_memory(created_at DESC);

-- Enable RLS
ALTER TABLE public.guru_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own memories"
  ON public.guru_memory FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own memories"
  ON public.guru_memory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Search function: hybrid text search + importance + recency
CREATE OR REPLACE FUNCTION public.search_memories(
  p_user_id uuid,
  p_query text DEFAULT '',
  p_category text DEFAULT NULL,
  p_dimension text DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_days integer DEFAULT 90
)
RETURNS TABLE(
  id uuid,
  content text,
  importance integer,
  category text,
  tags text[],
  emotional_tone text,
  dimension_relevant text,
  linked_loops text[],
  created_at timestamptz,
  relevance_score float
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    m.id,
    m.content,
    m.importance,
    m.category,
    m.tags,
    m.emotional_tone,
    m.dimension_relevant,
    m.linked_loops,
    m.created_at,
    (
      COALESCE(ts_rank(m.content_tsv, plainto_tsquery('english', p_query)), 0) * 10
      + m.importance
      + (1.0 / (1 + EXTRACT(EPOCH FROM (now() - m.created_at)) / 86400 / 7))  -- recency: 1-week half-life
    )::float AS relevance_score
  FROM public.guru_memory m
  WHERE m.user_id = p_user_id
    AND m.created_at > now() - (p_days || ' days')::interval
    AND (p_category IS NULL OR m.category = p_category)
    AND (p_dimension IS NULL OR m.dimension_relevant = p_dimension)
    AND (
      p_query = '' OR p_query IS NULL
      OR m.content_tsv @@ plainto_tsquery('english', p_query)
      OR m.content ILIKE '%' || p_query || '%'
    )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
$$;
