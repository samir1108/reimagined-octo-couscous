
CREATE TABLE public.journal_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  intention TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  entry_count INTEGER NOT NULL DEFAULT 0,
  last_entry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_threads TO authenticated;
GRANT ALL ON public.journal_threads TO service_role;
ALTER TABLE public.journal_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journal threads" ON public.journal_threads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER journal_threads_touch BEFORE UPDATE ON public.journal_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX journal_threads_user_status_idx ON public.journal_threads(user_id, status, last_entry_at DESC);

CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  thread_id UUID REFERENCES public.journal_threads(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journal entries" ON public.journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER journal_entries_touch BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX journal_entries_user_created_idx ON public.journal_entries(user_id, created_at DESC);
CREATE INDEX journal_entries_thread_idx ON public.journal_entries(thread_id, created_at);

CREATE OR REPLACE FUNCTION public.bump_journal_thread()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.thread_id IS NOT NULL THEN
    UPDATE public.journal_threads
       SET entry_count = entry_count + 1,
           last_entry_at = COALESCE(NEW.created_at, now()),
           updated_at = now()
     WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER journal_entries_bump_thread AFTER INSERT ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.bump_journal_thread();
