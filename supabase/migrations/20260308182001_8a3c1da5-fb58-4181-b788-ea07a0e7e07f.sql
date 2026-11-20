
CREATE OR REPLACE FUNCTION public.get_admin_cost_dashboard(p_days integer DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    -- Overall totals
    'total_ai_calls', (SELECT count(*) FROM ai_usage_log WHERE created_at > now() - (p_days || ' days')::interval),
    'total_tokens', (SELECT COALESCE(sum(total_tokens), 0) FROM ai_usage_log WHERE created_at > now() - (p_days || ' days')::interval),
    'total_cost_paise', (SELECT COALESCE(sum(estimated_cost_paise), 0) FROM ai_usage_log WHERE created_at > now() - (p_days || ' days')::interval),
    'total_charged_paise', (SELECT COALESCE(sum(charged_paise), 0) FROM ai_usage_log WHERE created_at > now() - (p_days || ' days')::interval),
    'total_revenue_paise', (SELECT COALESCE(sum(credits_paise), 0) FROM credit_transactions WHERE type = 'purchase' AND created_at > now() - (p_days || ' days')::interval),
    'total_purchases', (SELECT count(*) FROM credit_transactions WHERE type = 'purchase' AND created_at > now() - (p_days || ' days')::interval),
    'error_count', (SELECT count(*) FROM ai_usage_log WHERE status = 'error' AND created_at > now() - (p_days || ' days')::interval),
    
    -- Daily breakdown
    'daily_costs', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(created_at) as day,
          count(*) as calls,
          sum(total_tokens) as tokens,
          sum(estimated_cost_paise) as cost_paise,
          sum(charged_paise) as charged_paise
        FROM ai_usage_log
        WHERE created_at > now() - (p_days || ' days')::interval
        GROUP BY DATE(created_at)
        ORDER BY day
      ) t
    ), '[]'::json),
    
    -- Revenue daily
    'daily_revenue', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          DATE(created_at) as day,
          count(*) as purchases,
          sum(credits_paise) as revenue_paise,
          sum(amount_paise) as amount_paise
        FROM credit_transactions
        WHERE type = 'purchase' AND created_at > now() - (p_days || ' days')::interval
        GROUP BY DATE(created_at)
        ORDER BY day
      ) t
    ), '[]'::json),
    
    -- Per function breakdown
    'function_costs', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          function_name,
          count(*) as calls,
          sum(total_tokens) as tokens,
          sum(estimated_cost_paise) as cost_paise,
          sum(charged_paise) as charged_paise,
          ROUND(AVG(total_tokens)) as avg_tokens
        FROM ai_usage_log
        WHERE created_at > now() - (p_days || ' days')::interval
        GROUP BY function_name
        ORDER BY cost_paise DESC
      ) t
    ), '[]'::json),
    
    -- Per model breakdown
    'model_costs', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          COALESCE(model, 'unknown') as model,
          count(*) as calls,
          sum(total_tokens) as tokens,
          sum(estimated_cost_paise) as cost_paise
        FROM ai_usage_log
        WHERE created_at > now() - (p_days || ' days')::interval
        GROUP BY model
        ORDER BY cost_paise DESC
      ) t
    ), '[]'::json),
    
    -- Top spending users
    'top_users', COALESCE((
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT 
          a.user_id,
          p.display_name,
          count(*) as calls,
          sum(a.total_tokens) as tokens,
          sum(a.estimated_cost_paise) as cost_paise,
          sum(a.charged_paise) as charged_paise,
          COALESCE(uc.balance_paise, 0) as balance_paise
        FROM ai_usage_log a
        LEFT JOIN profiles p ON p.user_id = a.user_id
        LEFT JOIN user_credits uc ON uc.user_id = a.user_id
        WHERE a.created_at > now() - (p_days || ' days')::interval
        GROUP BY a.user_id, p.display_name, uc.balance_paise
        ORDER BY cost_paise DESC
        LIMIT 15
      ) t
    ), '[]'::json),

    -- Profit margin
    'margin_pct', (
      SELECT CASE
        WHEN COALESCE(sum(estimated_cost_paise), 0) = 0 THEN 0
        ELSE ROUND(
          ((COALESCE(sum(charged_paise), 0) - COALESCE(sum(estimated_cost_paise), 0))::numeric / 
           NULLIF(COALESCE(sum(estimated_cost_paise), 0), 0)::numeric) * 100
        )
      END
      FROM ai_usage_log
      WHERE created_at > now() - (p_days || ' days')::interval
    )
  ) INTO result;

  RETURN result;
END;
$function$;
