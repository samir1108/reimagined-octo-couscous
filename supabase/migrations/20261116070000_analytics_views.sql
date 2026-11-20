-- ============================================================
-- ANALYTICS VIEWS
-- ------------------------------------------------------------
-- The event pipeline is in place; these are the read models. All views are
-- security_invoker so RLS on the base tables still applies to the caller.
-- ============================================================

-- Completion writes duration_seconds; make sure the column exists.
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- 1. Session funnel, per user per day
CREATE OR REPLACE VIEW public.v_session_funnel
WITH (security_invoker = true) AS
SELECT
  s.user_id,
  date_trunc('day', s.created_at) AS day,
  count(*)                                                             AS started,
  count(*) FILTER (WHERE s.status = 'completed')                       AS completed,
  round(
    100.0 * count(*) FILTER (WHERE s.status = 'completed') / NULLIF(count(*), 0),
    1
  )                                                                    AS completion_pct,
  round(avg(COALESCE(s.duration_seconds, 0))::numeric, 0)              AS avg_seconds
FROM public.sessions s
GROUP BY 1, 2;

-- 2. Step funnel: where steps are shown but never finished
CREATE OR REPLACE VIEW public.v_step_funnel
WITH (security_invoker = true) AS
SELECT
  e.user_id,
  e.kind,
  e.step_index,
  count(*) FILTER (WHERE e.action = 'shown')      AS shown,
  count(*) FILTER (WHERE e.action = 'completed')  AS completed,
  count(*) FILTER (WHERE e.action = 'skipped')    AS skipped,
  round(
    100.0 * count(*) FILTER (WHERE e.action = 'completed')
      / NULLIF(count(*) FILTER (WHERE e.action = 'shown'), 0),
    1
  )                                               AS completion_pct,
  round(avg(e.duration_seconds)::numeric, 0)      AS avg_seconds
FROM public.session_step_events e
GROUP BY 1, 2, 3;

-- 3. Content performance: which ingredients actually land
CREATE OR REPLACE VIEW public.v_content_performance
WITH (security_invoker = true) AS
SELECT
  si.ingredient_id,
  ci.label,
  ci.kind,
  ci.depth,
  count(*)                                            AS attempts,
  count(*) FILTER (WHERE si.completed)                AS completions,
  round(100.0 * count(*) FILTER (WHERE si.completed) / NULLIF(count(*), 0), 1) AS completion_pct,
  round(avg(si.quality)::numeric, 3)                  AS avg_quality,
  round(avg(si.seconds_spent)::numeric, 0)            AS avg_seconds
FROM public.session_ingredients si
LEFT JOIN public.content_ingredients ci ON ci.id = si.ingredient_id
GROUP BY 1, 2, 3, 4;

-- 4. Weekly retention
CREATE OR REPLACE VIEW public.v_retention_weekly
WITH (security_invoker = true) AS
WITH activity AS (
  SELECT DISTINCT user_id, date_trunc('week', created_at) AS week
  FROM public.engagement_events
  WHERE event_type IN ('home_view', 'session_start', 'app_open')
)
SELECT
  a.week,
  count(DISTINCT a.user_id) AS active_users,
  count(DISTINCT p.user_id) AS returning_users,
  round(
    100.0 * count(DISTINCT p.user_id) / NULLIF(count(DISTINCT a.user_id), 0),
    1
  ) AS returning_pct
FROM activity a
LEFT JOIN activity p
  ON p.user_id = a.user_id
 AND p.week = a.week - interval '1 week'
GROUP BY 1;

-- 5. Archetype quality with a UCB score, for the edge bandit
CREATE OR REPLACE VIEW public.v_archetype_quality
WITH (security_invoker = true) AS
SELECT
  sp.archetype,
  count(*) FILTER (WHERE sp.quality_score IS NOT NULL) AS n,
  round(avg(sp.quality_score)::numeric, 3)             AS avg_quality,
  round(stddev_samp(sp.quality_score)::numeric, 3)     AS sd,
  round(
    (avg(sp.quality_score)
      + 0.2 * sqrt(ln(count(*) + 1) / count(*)))::numeric,
    3
  ) AS ucb
FROM public.session_spine sp
WHERE sp.quality_score IS NOT NULL
GROUP BY 1;

-- 6. Crisis activity
CREATE OR REPLACE VIEW public.v_crisis_daily
WITH (security_invoker = true) AS
SELECT
  date_trunc('day', c.created_at) AS day,
  c.surface,
  c.severity,
  count(*) AS events,
  count(*) FILTER (WHERE c.action = 'short_circuit') AS short_circuits
FROM public.crisis_events c
GROUP BY 1, 2, 3;

-- 7. Cost per day and function
CREATE OR REPLACE VIEW public.v_cost_daily
WITH (security_invoker = true) AS
SELECT
  date_trunc('day', a.created_at) AS day,
  a.function_name,
  count(*)                        AS calls,
  sum(a.total_tokens)             AS tokens,
  sum(a.estimated_cost_paise)     AS cost_paise,
  sum(a.charged_paise)            AS charged_paise
FROM public.ai_usage_log a
GROUP BY 1, 2;

GRANT SELECT ON public.v_session_funnel      TO authenticated;
GRANT SELECT ON public.v_step_funnel         TO authenticated;
GRANT SELECT ON public.v_content_performance TO authenticated;
GRANT SELECT ON public.v_retention_weekly    TO authenticated;
GRANT SELECT ON public.v_archetype_quality   TO authenticated;
GRANT SELECT ON public.v_crisis_daily        TO authenticated;
GRANT SELECT ON public.v_cost_daily          TO authenticated;
