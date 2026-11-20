
CREATE TABLE public.practice_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_key TEXT NOT NULL,
  insight TEXT NOT NULL CHECK (char_length(insight) BETWEEN 1 AND 240),
  user_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_practice_insights_key_recent
  ON public.practice_insights (practice_key, created_at DESC);

ALTER TABLE public.practice_insights ENABLE ROW LEVEL SECURITY;

-- Public read (anonymous wall)
CREATE POLICY "Anyone can read insights"
  ON public.practice_insights
  FOR SELECT
  USING (true);

-- Only signed-in users can post; insight is anonymous (no user_id on row).
CREATE POLICY "Authenticated users can post insights"
  ON public.practice_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
