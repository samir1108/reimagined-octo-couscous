CREATE TABLE public.user_journeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  master_id TEXT NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_days INTEGER NOT NULL DEFAULT 100,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  missed_days INTEGER NOT NULL DEFAULT 0,
  completed_days INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  avg_practice_minutes NUMERIC NOT NULL DEFAULT 0,
  avg_rating NUMERIC NOT NULL DEFAULT 0,
  engagement_level TEXT NOT NULL DEFAULT 'medium',
  preferred_time TEXT NOT NULL DEFAULT 'morning',
  recent_reflections JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_journal_sentiment TEXT NOT NULL DEFAULT 'neutral',
  struggles JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own journeys" ON public.user_journeys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own journeys" ON public.user_journeys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journeys" ON public.user_journeys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journeys" ON public.user_journeys FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_journeys_updated_at BEFORE UPDATE ON public.user_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();