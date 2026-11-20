// Shared language preference helpers. Pure functions only — safe to use in
// tests, on the landing page, and in the app shell. Profile persistence lives
// in languageProfile.ts so this module has no Supabase dependency.

import { APP_LANGUAGES, type AppLanguage } from "@/data/languages";

export const LANGUAGE_STORAGE_KEY = "hope-app-user-language";
export const LANGUAGE_CHOSEN_KEY = "satyug-language-chosen";
export const LANGUAGE_CHANGED_EVENT = "app:language-changed";

function readStorage(key: string): string | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

/** The user's saved language code, or null when they have never chosen one. */
export function getStoredLanguage(): string | null {
  return readStorage(LANGUAGE_STORAGE_KEY);
}

/** True when this device has already completed the first-run language step. */
export function hasChosenLanguage(): boolean {
  if (readStorage(LANGUAGE_CHOSEN_KEY) === "1") return true;
  return Boolean(readStorage(LANGUAGE_STORAGE_KEY));
}

/**
 * Persist a language choice and notify the whole app.
 * Also clears the cached theme-of-day so generated content is recreated in the
 * newly selected language.
 */
export function setStoredLanguage(code: string): void {
  const normalized = resolveLanguageCode(code) ?? "en";
  writeStorage(LANGUAGE_STORAGE_KEY, normalized);
  writeStorage(LANGUAGE_CHOSEN_KEY, "1");
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("hope-app-theme-of-day");
      localStorage.removeItem("satyug-app-theme-of-day");
    }
  } catch {
    /* ignore */
  }
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: normalized }));
    }
  } catch {
    /* ignore */
  }
}

/** Mark the first-run language step complete without changing the language. */
export function markLanguageChosen(): void {
  writeStorage(LANGUAGE_CHOSEN_KEY, "1");
  if (!readStorage(LANGUAGE_STORAGE_KEY)) writeStorage(LANGUAGE_STORAGE_KEY, "en");
}

/**
 * Map any BCP-47 tag (e.g. "pt-BR", "zh-Hant", "en_GB") onto one of the
 * language codes the app ships. Returns null when there is no match.
 */
export function resolveLanguageCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = String(raw).trim().replace(/_/g, "-").toLowerCase();
  if (!value) return null;

  const exact = APP_LANGUAGES.find((l) => l.code.toLowerCase() === value);
  if (exact) return exact.code;

  const base = value.split("-")[0];

  // Chinese variants: zh-Hant/HK/MO -> Traditional, everything else -> Simplified.
  if (base === "zh") {
    if (/hant|tw|hk|mo/.test(value)) {
      return APP_LANGUAGES.find((l) => l.code === "zh-TW")?.code ?? "zh";
    }
    return APP_LANGUAGES.find((l) => l.code === "zh")?.code ?? "zh";
  }

  const baseMatch = APP_LANGUAGES.find((l) => l.code.toLowerCase() === base);
  if (baseMatch) return baseMatch.code;

  // Norwegian written standards.
  if (base === "no") return APP_LANGUAGES.find((l) => l.code === "nb")?.code ?? "no";

  return null;
}

/** Best-effort language detected from the browser/OS, defaulting to English. */
export function detectBrowserLanguage(): string {
  const candidates: string[] = [];
  try {
    if (typeof navigator !== "undefined") {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
    }
  } catch {
    /* ignore */
  }
  for (const candidate of candidates) {
    const code = resolveLanguageCode(candidate);
    if (code) return code;
  }
  return "en";
}

export function getLanguageMeta(code: string | null | undefined): AppLanguage {
  const resolved = resolveLanguageCode(code) ?? "en";
  return APP_LANGUAGES.find((l) => l.code === resolved) ?? APP_LANGUAGES[0];
}

export function languageDirection(code: string | null | undefined): "ltr" | "rtl" {
  return getLanguageMeta(code).direction;
}
