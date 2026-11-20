/**
 * Last-session result — the small "you did it" receipt the orb hands back on
 * Home after a sitting. Kept in localStorage so Home can show it immediately
 * on return, before any network round-trip.
 */
import { localDateKey } from "@/lib/localDate";

export interface LastSessionResult {
  at: string;
  minutes: number;
  steps: number;
  karma: number;
  quality: number;
  shift: string;
  next: string;
}

const KEY = "last-session-result";

export function saveLastSessionResult(result: LastSessionResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* ignore */
  }
}

export function loadLastSessionResult(): LastSessionResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastSessionResult>;
    if (!parsed || typeof parsed.at !== "string") return null;
    return {
      at: parsed.at,
      minutes: Number(parsed.minutes) || 0,
      steps: Number(parsed.steps) || 0,
      karma: Number(parsed.karma) || 0,
      quality: Number(parsed.quality) || 0,
      shift: typeof parsed.shift === "string" ? parsed.shift : "",
      next: typeof parsed.next === "string" ? parsed.next : "",
    };
  } catch {
    return null;
  }
}

export function clearLastSessionResult(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Only surface today's receipt — yesterday's belongs to the journal, not Home. */
export function loadTodaysSessionResult(): LastSessionResult | null {
  const result = loadLastSessionResult();
  if (!result) return null;
  const at = new Date(result.at);
  if (Number.isNaN(at.getTime())) return null;
  return localDateKey(at) === localDateKey() ? result : null;
}
