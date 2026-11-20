
-- Enable pg_trgm for fuzzy/semantic-like text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add memory graph + decay columns to guru_memory
ALTER TABLE public.guru_memory
  ADD COLUMN IF NOT EXISTS linked_memory_ids uuid[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS parent_memory_id uuid REFERENCES public.guru_memory(id),
  ADD COLUMN IF NOT EXISTS decay_factor numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS pattern_cluster text,
  ADD COLUMN IF NOT EXISTS consolidated_into uuid REFERENCES public.guru_memory(id),
  ADD COLUMN IF NOT EXISTS is_consolidated boolean NOT NULL DEFAULT false;

-- Create index for trigram similarity search
CREATE INDEX IF NOT EXISTS idx_guru_memory_content_trgm ON public.guru_memory USING gin(content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_guru_memory_pattern_cluster ON public.guru_memory(pattern_cluster);

-- Create memory_patterns table for cross-session pattern detection
CREATE TABLE public.memory_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pattern_name text NOT NULL,
  description text NOT NULL,
  frequency integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  memory_ids uuid[] DEFAULT '{}',
  dimension text,
  linked_loops text[] DEFAULT '{}',
  emotional_trend text,
  significance text NOT NULL DEFAULT 'emerging',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memory_patterns_user ON public.memory_patterns(user_id);
ALTER TABLE public.memory_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own patterns"
  ON public.memory_patterns FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own patterns"
  ON public.memory_patterns FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own patterns"
  ON public.memory_patterns FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own patterns"
  ON public.memory_patterns FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add delete policy to guru_memory so users can manage their memories
CREATE POLICY "Users delete own memories"
  ON public.guru_memory FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add update policy to guru_memory for consolidation and access tracking
CREATE POLICY "Users update own memories"
  ON public.guru_memory FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Enhanced search function with trigram similarity
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
      -- Trigram similarity (0-1 range, scaled to 10)
      COALESCE(similarity(m.content, p_query), 0) * 10
      -- Full-text search rank
      + COALESCE(ts_rank(m.content_tsv, plainto_tsquery('english', p_query)), 0) * 5
      -- Importance weight
      + m.importance * m.decay_factor
      -- Recency: 1-week half-life
      + (1.0 / (1 + EXTRACT(EPOCH FROM (now() - m.created_at)) / 86400 / 7))
    )::float AS relevance_score
  FROM public.guru_memory m
  WHERE m.user_id = p_user_id
    AND m.created_at > now() - (p_days || ' days')::interval
    AND m.is_consolidated = false
    AND m.consolidated_into IS NULL
    AND (p_category IS NULL OR m.category = p_category)
    AND (p_dimension IS NULL OR m.dimension_relevant = p_dimension)
    AND (
      p_query = '' OR p_query IS NULL
      OR m.content_tsv @@ plainto_tsquery('english', p_query)
      OR m.content ILIKE '%' || p_query || '%'
      OR similarity(m.content, p_query) > 0.1
    )
  ORDER BY relevance_score DESC
  LIMIT p_limit;
$$;

-- Decay function: reduces importance of old low-access memories
CREATE OR REPLACE FUNCTION public.decay_memories(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.guru_memory
  SET decay_factor = GREATEST(0.1,
    CASE
      -- High importance (8-10): very slow decay
      WHEN importance >= 8 THEN decay_factor * 0.995
      -- Medium importance (5-7): moderate decay
      WHEN importance >= 5 THEN decay_factor * 0.98
      -- Low importance (1-4): faster decay
      ELSE decay_factor * 0.95
    END
  )
  WHERE user_id = p_user_id
    AND consolidated_into IS NULL
    AND created_at < now() - interval '7 days'
    AND last_accessed_at < now() - interval '3 days';

  GET DIAGNOSTICS affected = ROW_COUNT;

  -- Auto-archive memories with very low effective importance
  UPDATE public.guru_memory
  SET is_consolidated = true
  WHERE user_id = p_user_id
    AND decay_factor < 0.2
    AND importance <= 3
    AND consolidated_into IS NULL;

  RETURN affected;
END;
$$;

-- Trigger to update last_accessed_at and access_count when memory is read
CREATE OR REPLACE FUNCTION public.track_memory_access()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Boost decay_factor slightly on access (max 1.0)
  NEW.access_count := OLD.access_count + 1;
  NEW.last_accessed_at := now();
  NEW.decay_factor := LEAST(1.0, OLD.decay_factor + 0.05);
  RETURN NEW;
END;
$$;
