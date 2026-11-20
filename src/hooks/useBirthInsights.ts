/**
 * useBirthInsights
 * ─────────────────
 * Loads the user's birth chart from localStorage (set during onboarding by
 * BirthDetails.tsx) — falling back to the profiles row — and returns a fully
 * computed PersonalProfile from the numerology / astrology / Vedic / rhythm
 * engines.
 *
 * Re-computes once per calendar day so personal-day, dasha-remaining, and
 * Rahu-kalam stay fresh without needing realtime.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  computePersonalProfile,
  type BirthChart,
  type PersonalProfile,
} from "@/lib/personalization";

interface Options {
  /** Optional override — useful for previews and tests. */
  chart?: BirthChart | null;
  /** Display name used for expression / soul-urge numerology. */
  name?: string;
}

export function useBirthInsights(userId?: string, opts: Options = {}) {
  const [chart, setChart] = useState<BirthChart | null>(opts.chart ?? null);
  const [loading, setLoading] = useState(!opts.chart);

  useEffect(() => {
    if (opts.chart) { setChart(opts.chart); setLoading(false); return; }
    if (!userId) { setLoading(false); return; }

    let cancelled = false;
    (async () => {
      // 1) Fast path — localStorage written by BirthDetails on submit.
      try {
        const raw = localStorage.getItem(`birth_chart_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as BirthChart;
          if (!cancelled) setChart(parsed);
        }
      } catch { /* ignore */ }

      // 2) Authoritative — profiles.lifestyle.birth_chart.
      try {
        const { data } = await supabase
          .from("profiles")
          .select("lifestyle, display_name")
          .eq("user_id", userId)
          .maybeSingle();
        const lifestyle = (data?.lifestyle as Record<string, unknown> | null) || null;
        const remote = (lifestyle?.birth_chart as BirthChart | undefined) || null;
        if (remote && !cancelled) {
          setChart(remote);
          try { localStorage.setItem(`birth_chart_${userId}`, JSON.stringify(remote)); } catch {}
        }
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, opts.chart]);

  // Recompute once per day. The dateKey forces useMemo to re-run at midnight.
  const dateKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const profile: PersonalProfile | null = useMemo(
    () => computePersonalProfile(chart, opts.name, new Date(`${dateKey}T12:00:00`)),
    [chart, opts.name, dateKey],
  );

  return { profile, chart, loading, hasChart: Boolean(chart?.date_of_birth) };
}
