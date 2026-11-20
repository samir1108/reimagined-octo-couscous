
-- AI Usage Log: tracks every AI call with token-level metering
CREATE TABLE public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  model text DEFAULT 'unknown',
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  estimated_cost_paise integer NOT NULL DEFAULT 0,
  charged_paise integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for user queries and analytics
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage_log (user_id, created_at DESC);
CREATE INDEX idx_ai_usage_function ON public.ai_usage_log (function_name, created_at DESC);

-- RLS
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users view own usage" ON public.ai_usage_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Service role inserts usage (edge functions use service client)
CREATE POLICY "Service inserts usage" ON public.ai_usage_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Admins can view all usage
CREATE POLICY "Admins view all usage" ON public.ai_usage_log
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
