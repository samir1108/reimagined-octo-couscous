/**
 * useNextSession — fetches the orchestrator's whatNext() plan for the current user.
 * Lightweight wrapper. Re-runs on demand (refresh) and accepts a time budget.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { whatNext, type NextSessionPlan } from "@/lib/sutra/orchestrator";
import { getCurrentGate } from "@/lib/consciousness/dailyGates";
import { loadSuitability } from "@/lib/prescription";

export function useNextSession(timeAvailableSec?: number) {
  const [plan, setPlan] = useState<NextSessionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentGate, setCurrentGate] = useState(() => getCurrentGate(new Date().getHours()));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPlan(null); return; }
      const next = await whatNext(user.id, { timeAvailableSec, suitability: loadSuitability() });
      setPlan(next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [timeAvailableSec]);

  useEffect(() => {
    const tick = () => setCurrentGate(getCurrentGate(new Date().getHours()));
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    load();
  }, [currentGate, load]);

  return { plan, loading, error, refresh: load };
}
