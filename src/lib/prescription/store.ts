/**
 * SUITABILITY STORE
 * ──────────────────
 * The safety answers are session-scoped: they describe today, not the person
 * forever. sessionStorage is deliberate.
 */

import type { SuitabilityInput } from "./types";
import { defaultSuitability } from "./suitability";

const KEY = "satyug:suitability:v1";
const DATE_KEY = "satyug:suitability:date:v1";

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSuitabilityFreshToday(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(DATE_KEY) === todayKey();
  } catch {
    return true;
  }
}

export function loadSuitability(): SuitabilityInput {
  if (typeof window === "undefined") return defaultSuitability();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return defaultSuitability();
    const parsed = JSON.parse(raw) as SuitabilityInput;
    return { ...defaultSuitability(), ...parsed };
  } catch {
    return defaultSuitability();
  }
}

export function saveSuitability(input: SuitabilityInput): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(input));
    window.sessionStorage.setItem(DATE_KEY, todayKey());
  } catch {
    /* private mode — defaults still apply */
  }
}

export function clearSuitability(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
    window.sessionStorage.removeItem(DATE_KEY);
  } catch {
    /* ignore */
  }
}
