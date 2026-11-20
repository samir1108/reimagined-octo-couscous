import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthReady } from "@/hooks/useAuthReady";
import { PRACTICES, type Practice, type PracticeStatus } from "@/lib/sutra/practices";

export interface Constellation {
  phase: "diverge" | "t-shape" | "breathe" | "integrate";
  weights: Record<Practice, number>;
  levels: Record<Practice, number>;
  statuses: Record<Practice, PracticeStatus>;
  computedAt: string;
}

function rowToConstellation(row: any): Constellation {
  const weights = {} as Record<Practice, number>;
  const levels = {} as Record<Practice, number>;
  const statuses = {} as Record<Practice, PracticeStatus>;
  for (const p of PRACTICES) {
    weights[p] = Number(row[`${p}_weight`]) || 0.083;
    levels[p] = Number(row[`${p}_level`]) || 0;
    statuses[p] = (row[`${p}_status`] as PracticeStatus) || "secondary";
  }
  return {
    phase: row.phase || "diverge",
    weights, levels, statuses,
    computedAt: row.computed_at || new Date().toISOString(),
  };
}

export function useConstellation() {
  const { user } = useAuthReady();
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from("user_practice_constellation")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    if (data) setConstellation(rowToConstellation(data));
    setLoading(false);
  }, [user]);

  const recompute = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: err } = await supabase.functions.invoke("compute-constellation");
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    await load();
    return data;
  }, [user, load]);

  useEffect(() => { load(); }, [load]);

  return { constellation, loading, error, recompute, reload: load };
}
