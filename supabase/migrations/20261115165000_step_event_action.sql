-- Timing funnel: step events need a phase so "shown" and "started" are
-- distinguishable from "completed" and "skipped" without abusing booleans.
ALTER TABLE public.session_step_events
  ADD COLUMN IF NOT EXISTS action TEXT;

CREATE INDEX IF NOT EXISTS session_step_events_action_idx
  ON public.session_step_events (session_id, action, step_index);
