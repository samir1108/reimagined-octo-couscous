/**
 * useSuggestedProgram — fetches the Master-of-Masters routing engine's
 * recommendation for the user's next program / session.
 *
 * Wraps edge function `suggest-next-program`. Cached for 10 min.
 * Call `regenerate()` to force a different recommendation.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface SuggestedSession {
  day: number;
  title: string;
  mode?: string;
  practice_id?: string;
  level?: number;
  duration_min: number;
  master_id?: string;
}

export interface SuggestedProgram {
  kind: "continue" | "template" | "composed" | "single";
  title: string;
  why: string;
  master_id?: string | null;
  template_slug?: string | null;
  days: number;
  current_day?: number;
  sessions: SuggestedSession[];
  cta: string;
  program_id?: string | null;
}

const CACHE_KEY = "suggested-program-v1";
const CACHE_MS = 10 * 60 * 1000;

export function useSuggestedProgram() {
  const [suggestion, setSuggestion] = useState<SuggestedProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOnce = useCallback(async (regenerate = false) => {
    setLoading(true);
    setError(null);
    try {
      // Try cache first (only if not regenerating)
      if (!regenerate) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const { ts, data } = JSON.parse(cached);
            if (Date.now() - ts < CACHE_MS && data) {
              setSuggestion(data);
              setLoading(false);
              return;
            }
          }
        } catch { /* ignore cache parse errors */ }
      }

      const { data, error: fnErr } = await supabase.functions.invoke(
        "suggest-next-program",
        { body: { regenerate } },
      );
      if (fnErr) throw fnErr;
      const sug = data?.suggestion ?? null;
      setSuggestion(sug);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: sug }));
      } catch { /* ignore */ }
    } catch (e) {
      setError(e as Error);
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOnce(false); }, [fetchOnce]);

  return {
    suggestion,
    loading,
    error,
    regenerate: () => fetchOnce(true),
    refresh: () => fetchOnce(false),
  };
}
