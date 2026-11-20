import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Read models for the seven analytics views. RLS-scoped: a user sees their own
 * aggregates, service-role dashboards see everything.
 */

export interface SessionFunnelRow {
  day: string;
  started: number;
  completed: number;
  completion_pct: number | null;
  avg_seconds: number | null;
}

export interface StepFunnelRow {
  kind: string;
  step_index: number;
  shown: number;
  completed: number;
  skipped: number;
  completion_pct: number | null;
  avg_seconds: number | null;
}

export interface ContentPerformanceRow {
  ingredient_id: string;
  label: string | null;
  kind: string | null;
  depth: string | null;
  attempts: number;
  completions: number;
  completion_pct: number | null;
  avg_quality: number | null;
  avg_seconds: number | null;
}

export interface ArchetypeQualityRow {
  archetype: string;
  n: number;
  avg_quality: number | null;
  ucb: number | null;
}

export interface CostDailyRow {
  day: string;
  function_name: string;
  calls: number;
  tokens: number;
  cost_paise: number;
  charged_paise: number;
}

export interface CrisisDailyRow {
  day: string;
  surface: string;
  severity: string;
  events: number;
  short_circuits: number;
}

export interface RetentionWeeklyRow {
  week: string;
  active_users: number;
  returning_users: number;
  returning_pct: number | null;
}

export interface OpsMetrics {
  funnel: SessionFunnelRow[];
  steps: StepFunnelRow[];
  content: ContentPerformanceRow[];
  archetypes: ArchetypeQualityRow[];
  cost: CostDailyRow[];
  crisis: CrisisDailyRow[];
  retention: RetentionWeeklyRow[];
  loading: boolean;
  error: string | null;
}

const EMPTY: OpsMetrics = {
  funnel: [],
  steps: [],
  content: [],
  archetypes: [],
  cost: [],
  crisis: [],
  retention: [],
  loading: true,
  error: null,
};

async function loadView<T>(view: string, limit = 200): Promise<T[]> {
  const { data, error } = await supabase
    .from(view as never)
    .select("*")
    .limit(limit);
  if (error) throw new Error(`${view}: ${error.message}`);
  return (data ?? []) as T[];
}

export function useOpsMetrics() {
  const [state, setState] = useState<OpsMetrics>(EMPTY);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [funnel, steps, content, archetypes, cost, crisis, retention] = await Promise.all([
        loadView<SessionFunnelRow>("v_session_funnel"),
        loadView<StepFunnelRow>("v_step_funnel"),
        loadView<ContentPerformanceRow>("v_content_performance"),
        loadView<ArchetypeQualityRow>("v_archetype_quality"),
        loadView<CostDailyRow>("v_cost_daily"),
        loadView<CrisisDailyRow>("v_crisis_daily"),
        loadView<RetentionWeeklyRow>("v_retention_weekly"),
      ]);
      setState({ funnel, steps, content, archetypes, cost, crisis, retention, loading: false, error: null });
    } catch (e) {
      setState({ ...EMPTY, loading: false, error: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
