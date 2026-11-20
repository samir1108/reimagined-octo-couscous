/**
 * useForYouPractices — daily personalized practice list.
 *
 * Strategy: cache per-day in localStorage so the tab opens instantly.
 * Background refetch only when the cached date != today.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ForYouPractice {
  domain: string;
  emoji: string;
  title: string;
  why: string;
  duration_min: number;
}

interface ForYouPayload {
  date: string;
  practices: ForYouPractice[];
  goal: string | null;
}

const todayKey = () => new Date().toISOString().split("T")[0];
const LS_KEY = "for-you-practices-v1";

function readCache(): ForYouPayload | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ForYouPayload;
    if (parsed?.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(p: ForYouPayload) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {}
}

async function fetchForYou(): Promise<ForYouPayload> {
  const { data, error } = await supabase.functions.invoke("for-you-practices");
  if (error) throw error;
  const payload: ForYouPayload = {
    date: data?.date ?? todayKey(),
    practices: data?.practices ?? [],
    goal: data?.goal ?? null,
  };
  writeCache(payload);
  return payload;
}

export function useForYouPractices() {
  return useQuery({
    queryKey: ["for-you-practices", todayKey()],
    queryFn: fetchForYou,
    initialData: () => readCache() ?? undefined,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/** Fire-and-forget prefetch — call from parent so the tab opens instantly. */
export function usePrefetchForYou() {
  const qc = useQueryClient();
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      qc.setQueryData(["for-you-practices", todayKey()], cached);
      return;
    }
    qc.prefetchQuery({
      queryKey: ["for-you-practices", todayKey()],
      queryFn: fetchForYou,
      staleTime: 24 * 60 * 60 * 1000,
    });
  }, [qc]);
}
