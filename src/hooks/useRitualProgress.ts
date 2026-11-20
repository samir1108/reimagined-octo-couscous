/**
 * useRitualProgress
 * ─────────────────
 * Tracks per-ritual journey: when the user first opted in, how many times
 * they've completed it, and the last completion. Drives the progressive
 * "depth" system on the Off-App tab (Day 1–6 base · Day 7+ deepen ·
 * Day 21+ subtle) so practices evolve as the user matures with them.
 *
 * localStorage-only by design (per-device, no migration risk). Mirrors the
 * pattern used by useOffAppReminders.
 */
import { useCallback, useEffect, useState } from "react";
import type { OffAppRitualId } from "@/data/offAppRituals";

const KEY = "off_app_ritual_progress_v1";

export interface RitualProgressEntry {
  enrolledAt: string;       // ISO date
  completionCount: number;
  lastCompletedAt?: string; // ISO datetime
  lastReflection?: string;
}

type Map = Partial<Record<OffAppRitualId, RitualProgressEntry>>;

export type RitualDepth = "base" | "deepen" | "subtle";

export interface RitualDepthInfo {
  depth: RitualDepth;
  daysSinceEnrolled: number;
  completionCount: number;
  /** Days remaining until the next depth tier unlocks (0 if at top). */
  daysToNext: number;
  nextDepth: RitualDepth | null;
}

const THRESHOLDS = { deepen: 7, subtle: 21 } as const;

function load(): Map {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function save(m: Map) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

function daysBetween(isoFrom: string, to: Date = new Date()): number {
  const from = new Date(isoFrom);
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));
}

export function getDepthForDays(days: number): RitualDepth {
  if (days >= THRESHOLDS.subtle) return "subtle";
  if (days >= THRESHOLDS.deepen) return "deepen";
  return "base";
}

export function useRitualProgress() {
  const [map, setMap] = useState<Map>(() => load());

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setMap(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ensureEnrolled = useCallback((id: OffAppRitualId) => {
    const cur = load();
    if (!cur[id]) {
      cur[id] = { enrolledAt: new Date().toISOString(), completionCount: 0 };
      save(cur);
      setMap({ ...cur });
    }
  }, []);

  const recordCompletion = useCallback(
    (id: OffAppRitualId, reflection?: string) => {
      const cur = load();
      const entry = cur[id] ?? { enrolledAt: new Date().toISOString(), completionCount: 0 };
      entry.completionCount += 1;
      entry.lastCompletedAt = new Date().toISOString();
      if (reflection?.trim()) entry.lastReflection = reflection.trim().slice(0, 280);
      cur[id] = entry;
      save(cur);
      setMap({ ...cur });
    },
    [],
  );

  const getInfo = useCallback((id: OffAppRitualId): RitualDepthInfo => {
    const e = map[id];
    if (!e) {
      return { depth: "base", daysSinceEnrolled: 0, completionCount: 0, daysToNext: THRESHOLDS.deepen, nextDepth: "deepen" };
    }
    const d = daysBetween(e.enrolledAt);
    const depth = getDepthForDays(d);
    let nextDepth: RitualDepth | null = null;
    let daysToNext = 0;
    if (depth === "base") { nextDepth = "deepen"; daysToNext = THRESHOLDS.deepen - d; }
    else if (depth === "deepen") { nextDepth = "subtle"; daysToNext = THRESHOLDS.subtle - d; }
    return { depth, daysSinceEnrolled: d, completionCount: e.completionCount, daysToNext, nextDepth };
  }, [map]);

  return { ensureEnrolled, recordCompletion, getInfo };
}
