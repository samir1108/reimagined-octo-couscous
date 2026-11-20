-- Content library user tables (offline-first sync)

CREATE TABLE IF NOT EXISTS public.user_library_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_library_progress_user ON public.user_library_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON public.user_favorites(user_id);

ALTER TABLE public.user_library_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own progress" ON public.user_library_progress;
CREATE POLICY "Users can read own progress" ON public.user_library_progress
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_library_progress;
CREATE POLICY "Users can upsert own progress" ON public.user_library_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_library_progress;
CREATE POLICY "Users can update own progress" ON public.user_library_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own favorites" ON public.user_favorites;
CREATE POLICY "Users can read own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);
