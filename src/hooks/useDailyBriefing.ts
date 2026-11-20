/**
 * useDailyBriefing — fetch the structured daily consciousness briefing
 * from the `daily-briefing` edge function.
 *
 * ── Caching strategy ────────────────────────────────────────────────────────
 * The briefing is stable within a day+gate, so it is persisted to
 * localStorage and rehydrated instantly on mount. A background revalidation
 * only fires when the cache is older than the freshness window, so a reload
 * costs zero network. `invalidateBriefing()` is called after a session
 * completes or when the gate rolls over, which forces one fresh fetch.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface DailyBriefing {
  headline: string;
  chakra: { id: string; label: string; color: string };
  watchLoop: {
    id: string;
    name: string;
    trigger: string;
    awarenessMarker: string;
    microPause: string;
    occurrenceCount: number;
  } | null;
  dimensionFocus: {
    dimension: string;
    currentBand: number;
    nextThreshold: number;
  };
  practice: { id: string; name: string; duration: number } | null;
  journalPrompt: string;
  signals: Record<string, string>;
  confidence: "high" | "medium" | "low";
  /** True when the prose was rewritten by the model rather than the graph. */
  flavored: boolean;
  context: {
    journeyDay: number;
    journeyPhase: string;
    dominantPath: string;
    synthesisNote: string | null;
    recentMemorySnippets: Array<{
      content: string;
      category: string;
      tags: string[];
    }>;
    recentSessionSummaries: Array<{
      date: string;
      slot: string;
      status: string;
      summary: string;
    }>;
    freeIntent: string | null;
  };
}

export type BriefingSlot = "morning" | "midday" | "evening" | "night";

interface CachedBriefing {
  storedAt: number;
  briefing: DailyBriefing;
}

/** Re-fetch if the cached briefing is older than this. */
const FRESH_MS = 4 * 60 * 60 * 1000; // 4 hours
/** Drop cached briefings older than this entirely. */
const MAX_AGE_MS = 36 * 60 * 60 * 1000; // 36 hours (survives one night)

function cacheKey(userId: string, slot: BriefingSlot): string {
  return `daily-briefing:${userId}:${slot}`;
}

function readCache(userId: string, slot: BriefingSlot): CachedBriefing | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId, slot));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedBriefing;
    if (!parsed?.briefing || typeof parsed.storedAt !== "number") return null;
    if (Date.now() - parsed.storedAt > MAX_AGE_MS) {
      localStorage.removeItem(cacheKey(userId, slot));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(userId: string, slot: BriefingSlot, briefing: DailyBriefing): void {
  try {
    localStorage.setItem(
      cacheKey(userId, slot),
      JSON.stringify({ storedAt: Date.now(), briefing } satisfies CachedBriefing)
    );
  } catch {
    // Quota or private mode — the briefing is still served from memory.
  }
}

export function clearBriefingCache(userId?: string): void {
  try {
    if (userId) {
      localStorage.removeItem(cacheKey(userId, "morning"));
      localStorage.removeItem(cacheKey(userId, "midday"));
      localStorage.removeItem(cacheKey(userId, "evening"));
      localStorage.removeItem(cacheKey(userId, "night"));
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("daily-briefing:")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

interface UseDailyBriefingOptions {
  timeSlot: BriefingSlot;
  energy?: "low" | "medium" | "high";
  freeIntent?: string;
  enabled?: boolean;
  /** Set false to render the cache only (e.g. while a session is mid-flight). */
  allowRevalidate?: boolean;
}

export function useDailyBriefing({
  timeSlot,
  energy,
  freeIntent,
  enabled = true,
  allowRevalidate = true,
}: UseDailyBriefingOptions) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Resolve the user once so the cache key is stable across renders.
  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (alive) setUserId(data?.user?.id ?? null);
    });
    return () => {
      alive = false;
    };
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const query = useQuery({
    queryKey: ["daily-briefing", today, timeSlot, energy, freeIntent],
    queryFn: async (): Promise<DailyBriefing> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-briefing`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ time_slot: timeSlot, energy, free_intent: freeIntent }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `Error ${resp.status}` }));
        throw new Error(err.error || `daily-briefing failed (${resp.status})`);
      }

      const json = await resp.json();
      if (!json.ok || !json.briefing) {
        throw new Error(json.error || "Invalid briefing response");
      }

      const briefing = json.briefing as DailyBriefing;
      if (userId) writeCache(userId, timeSlot, briefing);
      return briefing;
    },
    enabled: enabled && !!userId && allowRevalidate,
    staleTime: FRESH_MS,
    gcTime: 1000 * 60 * 60 * 8,
    retry: 1,
  });

  // Cached copy rehydrated synchronously so the card paints on first frame.
  const cached = userId ? readCache(userId, timeSlot) : null;
  const [hydrated, setHydrated] = useState<CachedBriefing | null>(null);
  const hydratedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const key = cacheKey(userId, timeSlot);
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;
    setHydrated(readCache(userId, timeSlot));
  }, [userId, timeSlot]);

  /** Drop cache + refetch. Call after a session completes or on gate rollover. */
  const invalidateBriefing = useCallback(() => {
    if (userId) clearBriefingCache(userId);
    setHydrated(null);
    hydratedKeyRef.current = null;
    void queryClient.invalidateQueries({ queryKey: ["daily-briefing"] });
  }, [queryClient, userId]);

  // A fresh server response supersedes whatever was on disk.
  useEffect(() => {
    if (query.data && userId) {
      setHydrated({ storedAt: Date.now(), briefing: query.data });
    }
  }, [query.data, userId]);

  const briefing = query.data ?? hydrated?.briefing ?? null;
  const cachedBriefing = hydrated?.briefing ?? null;
  const servedFromCache = !query.data && !!cachedBriefing;
  const isStale =
    !!cachedBriefing && Date.now() - (hydrated?.storedAt ?? 0) > FRESH_MS;

  return {
    briefing,
    isLoading: enabled && !briefing,
    isFetching: query.isFetching,
    error: query.error ?? null,
    servedFromCache,
    isStale,
    /** True when the displayed briefing is older than the freshness window. */
    needsRefresh: isStale,
    invalidateBriefing,
    refresh: query.refetch,
  };
}
