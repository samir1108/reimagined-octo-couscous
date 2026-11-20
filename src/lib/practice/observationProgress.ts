/**
 * Observation Progress
 * ────────────────────
 * Local-first run log for the observation ladder: which seeds were sat,
 * felt shift, arrival state, and level progress.
 *
 * Local-first on purpose — the public /experience/observation session must
 * work without auth. Remote sync (supabase `observation_runs`) can mirror
 * this log once the user is signed in; the local shape is the source of truth
 * for the picker's no-repeat window.
 */
import { OBS_SEEDS, OBS_TOTAL, OBS_LEVEL_META, type ObsSeed } from "@/data/observationSessions";

export type FeltShift = "lighter" | "same" | "heavier";

export interface ObservationRun {
  seedId: string;
  level: number;
  lens: string;
  method: string;
  sessionNumber: number;
  durationSec: number;
  completed: boolean;
  feltShift?: FeltShift;
  arrivalState?: string;
  journalLine?: string;
  at: string;
}

const RUNS_KEY = "orb-observation-runs-v1";
const LEVEL_KEY = "orb-observation-level-v1";
const MAX_RUNS = 200;
const EPOCH_UTC = Date.UTC(2026, 0, 1);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep the session running */
  }
}

export function getObservationRuns(): ObservationRun[] {
  const runs = read<ObservationRun[]>(RUNS_KEY, []);
  return Array.isArray(runs) ? runs : [];
}

export function logObservationRun(
  run: Omit<ObservationRun, "at"> & { at?: string },
): ObservationRun[] {
  const entry: ObservationRun = { ...run, at: run.at ?? new Date().toISOString() };
  const next = [entry, ...getObservationRuns()].slice(0, MAX_RUNS);
  write(RUNS_KEY, next);
  return next;
}

export function clearObservationRuns(): void {
  write(RUNS_KEY, []);
}

/** Attach the felt shift to the most recent run (optionally matching a seed). */
export function setLatestRunFeltShift(shift: FeltShift, seedId?: string): void {
  const runs = getObservationRuns();
  const idx = runs.findIndex((r) => !seedId || r.seedId === seedId);
  if (idx === -1) return;
  runs[idx] = { ...runs[idx], feltShift: shift };
  write(RUNS_KEY, runs);
}

export function recentObservationSeedIds(limit = 14): string[] {
  return getObservationRuns()
    .slice(0, limit)
    .map((r) => r.seedId);
}

export function getObserveLevel(): number {
  const raw = read<number>(LEVEL_KEY, 1);
  return Math.max(1, Math.min(7, Number(raw) || 1));
}

export function setObserveLevel(level: number): void {
  write(LEVEL_KEY, Math.max(1, Math.min(7, Math.round(level))));
}

/** Days since 2026-01-01 (UTC) — stable session numbering across devices. */
export function observeDayNumber(now: Date = new Date()): number {
  const days = Math.floor((now.getTime() - EPOCH_UTC) / 86_400_000) + 1;
  return Math.max(1, days);
}

/** Day number plus today's repeat sittings, so a second sitting gets a new seed. */
export function currentObservationSessionNumber(now: Date = new Date()): number {
  const day = observeDayNumber(now);
  const sameDay = getObservationRuns().filter(
    (r) => observeDayNumber(new Date(r.at)) === day,
  ).length;
  return day + sameDay;
}

export interface ObservationStats {
  totalRuns: number;
  completed: number;
  uniqueSeeds: number;
  byLevel: Record<number, number>;
  byLens: Record<string, number>;
  lastSeedId: string | null;
  percent: number;
}

export function getObservationStats(): ObservationStats {
  const runs = getObservationRuns();
  const completedRuns = runs.filter((r) => r.completed);
  const unique = new Set(completedRuns.map((r) => r.seedId));
  const byLevel: Record<number, number> = {};
  const byLens: Record<string, number> = {};

  for (const id of unique) {
    const seed = OBS_SEEDS.find((s) => s.id === id);
    if (!seed) continue;
    byLevel[seed.level] = (byLevel[seed.level] ?? 0) + 1;
    byLens[seed.lens] = (byLens[seed.lens] ?? 0) + 1;
  }

  return {
    totalRuns: runs.length,
    completed: completedRuns.length,
    uniqueSeeds: unique.size,
    byLevel,
    byLens,
    lastSeedId: runs[0]?.seedId ?? null,
    percent: Math.round((unique.size / OBS_TOTAL) * 100),
  };
}

/** A level opens once three distinct seeds from the level below are complete. */
export function recommendedObserveLevel(): number {
  const stats = getObservationStats();
  let level = 1;
  for (const meta of OBS_LEVEL_META) {
    if (level >= 7) break;
    if ((stats.byLevel[meta.level] ?? 0) >= 3) level = Math.min(7, meta.level + 1);
  }
  return Math.max(getObserveLevel(), level);
}

export function levelCompletion(level: number): { done: number; total: number } {
  const stats = getObservationStats();
  const total = OBS_SEEDS.filter((s) => s.level === level).length;
  return { done: stats.byLevel[level] ?? 0, total };
}

export interface NextUnlock {
  level: number;
  title: string;
  remaining: number;
}

export function nextObsUnlock(): NextUnlock | null {
  const stats = getObservationStats();
  for (const meta of OBS_LEVEL_META) {
    const done = stats.byLevel[meta.level] ?? 0;
    if (done < 3) {
      return { level: meta.level, title: meta.title, remaining: Math.max(0, 3 - done) };
    }
  }
  return null;
}

/** Position of a seed inside the 100-session ladder (1-based). */
export function obsSeedPosition(seed: ObsSeed): number {
  return OBS_SEEDS.findIndex((s) => s.id === seed.id) + 1;
}
