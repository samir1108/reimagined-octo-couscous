
ALTER TABLE public.user_karma
  ADD COLUMN IF NOT EXISTS today_event_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS week_event_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_event_date date,
  ADD COLUMN IF NOT EXISTS week_anchor_date date;
