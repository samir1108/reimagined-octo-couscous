-- Add JSONB payload for type-specific data
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS type_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Index for per-user, per-type timeline queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_type_created
  ON public.sessions(user_id, type, created_at DESC);

-- Backfill 4 rows from practice_sessions_v2 → sessions
INSERT INTO public.sessions (
  id, user_id, session_date, time_slot, type, status,
  started_at, ended_at, created_at, type_payload
)
SELECT
  v.id,
  v.user_id,
  v.session_date,
  v.time_slot,
  'practice',
  'completed',
  v.created_at,
  v.created_at + (COALESCE(v.duration_seconds, 0) || ' seconds')::interval,
  v.created_at,
  jsonb_build_object(
    'practice_type',     v.practice_type,
    'level',             v.level,
    'quality_score',     v.quality_score,
    'duration_seconds',  v.duration_seconds,
    'dimension_impacts', v.dimension_impacts,
    'loop_relevant',     v.loop_relevant,
    'chakra_relevant',   v.chakra_relevant,
    'repeat_count',      v.repeat_count,
    'template_id',       v.template_id,
    'mood_before',       v.mood_before,
    'mood_after',        v.mood_after,
    'energy_before',     v.energy_before,
    'energy_after',      v.energy_after,
    'notes',             v.notes,
    'migrated_from',     'practice_sessions_v2'
  )
FROM public.practice_sessions_v2 v
WHERE NOT EXISTS (SELECT 1 FROM public.sessions s WHERE s.id = v.id);