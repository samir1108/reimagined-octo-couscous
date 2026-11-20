/**
 * Reads latest fused signals (stress / focus / burnout) for current user.
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface FusedSignal {
  id: string;
  window_start: string;
  window_end: string;
  stress_norm: number | null;
  focus_norm: number | null;
  burnout_risk: number | null;
  detected_loops: string[] | null;
  meta: any;
}

export function useFusedSignals(limit = 24) {
  const [rows, setRows] = useState<FusedSignal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("fused_signals" as any)
      .select("*")
      .eq("user_id", u.user.id)
      .order("window_end", { ascending: false })
      .limit(limit);
    setRows((data as any) ?? []);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = rows[0];
  return { rows, latest, loading, reload: load };
}
