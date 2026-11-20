-- Enable realtime broadcasting on engine_signals so the client Consciousness Bus
-- can stream live engine events (loop detected, band shift, plateau, breakthrough, etc.)
ALTER TABLE public.engine_signals REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'engine_signals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.engine_signals;
  END IF;
END $$;