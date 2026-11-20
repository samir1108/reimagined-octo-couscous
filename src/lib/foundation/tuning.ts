import type { AdaptivePath, AvailableMinutes, FoundationPace, FoundationTone, FoundationTuning } from "./types";

export type { FoundationPace, FoundationTone, FoundationTuning };

/**
 * Everything the user is allowed to tune. The engine treats these as
 * preferences, never as overrides of safety or of the day's required outcome.
 */

export const DEFAULT_TUNING: FoundationTuning = {
  minutes: 10,
  pace: "steady",
  inquiry: true,
  tone: "warm",
  voice: false,
};

const KEY = "satyug-foundation-tuning-v1";

export function normalizeTuning(raw: unknown): FoundationTuning {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_TUNING };
  const value = raw as Partial<FoundationTuning>;
  const minutes: AvailableMinutes =
    value.minutes === 3 || value.minutes === 10 || value.minutes === 20 || value.minutes === 40
      ? value.minutes
      : DEFAULT_TUNING.minutes;
  const pace: FoundationPace =
    value.pace === "gentle" || value.pace === "deep" ? value.pace : "steady";
  const tone: FoundationTone =
    value.tone === "plain" || value.tone === "philosophical" ? value.tone : "warm";
  const path: AdaptivePath | undefined =
    value.path === "observer" ||
    value.path === "inquirer" ||
    value.path === "integrator" ||
    value.path === "devotional"
      ? value.path
      : undefined;

  return {
    minutes,
    pace,
    path,
    inquiry: typeof value.inquiry === "boolean" ? value.inquiry : true,
    tone,
    voice: Boolean(value.voice),
  };
}

export function loadTuning(): FoundationTuning {
  if (typeof localStorage === "undefined") return { ...DEFAULT_TUNING };
  try {
    return normalizeTuning(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {
    return { ...DEFAULT_TUNING };
  }
}

export function saveTuning(tuning: FoundationTuning): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(normalizeTuning(tuning)));
  } catch {
    /* storage full or blocked — tuning falls back to defaults next load */
  }
}
