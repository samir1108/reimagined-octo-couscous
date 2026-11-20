ALTER TABLE public.consciousness_signals
  ADD COLUMN IF NOT EXISTS game_id TEXT,
  ADD COLUMN IF NOT EXISTS game_signals JSONB;

CREATE INDEX IF NOT EXISTS idx_consciousness_signals_game_id
  ON public.consciousness_signals(user_id, game_id)
  WHERE game_id IS NOT NULL;