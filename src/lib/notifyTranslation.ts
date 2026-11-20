// Native OS notifications render outside the DOM, so the DOM translator can
// never reach their title/body. These strings still belong to the product UI
// (ritual names, practice labels, reminders), so resolve them through the same
// static/cache/edge-function pipeline before the notification is shown.
import { supabase } from "@/lib/supabase";
import { getCached, setCached } from "@/lib/translateCache";
import { getStatic } from "@/lib/i18n";
import { getStoredLanguage, resolveLanguageCode } from "@/lib/languagePreference";

function activeLanguage(): string {
  return resolveLanguageCode(getStoredLanguage()) ?? "en";
}

function lookup(lang: string, source: string): string | undefined {
  return getStatic(lang, source) ?? getCached(lang, source);
}

async function requestTranslations(lang: string, strings: string[]): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-ui`, {
      method: "POST",
      headers,
      body: JSON.stringify({ targetLang: lang, strings }),
      signal: controller.signal,
    });
    if (!resp.ok) return;
    const j = await resp.json();
    const arr: string[] = Array.isArray(j?.translations) ? j.translations : [];
    const missing = Array.isArray(j?.missing) ? new Set(j.missing.map(Number)) : null;
    strings.forEach((src, i) => {
      const tx = (arr[i] && String(arr[i]).trim()) || "";
      if (tx && tx !== src) setCached(lang, src, tx);
      else if (missing && !missing.has(i)) setCached(lang, src, src);
    });
  } catch {
    // Notification falls back to the English source â€” never block delivery.
  } finally {
    clearTimeout(timer);
  }
}

/** Translate notification title/body strings for the active language. */
export async function translateNotificationTexts(texts: string[]): Promise<string[]> {
  const lang = activeLanguage();
  if (lang === "en") return texts;

  const resolved = texts.map((t) => lookup(lang, t.trim()) ?? t);
  const missing = [
    ...new Set(
      texts.filter(
        (t, i) => resolved[i] === t && /[A-Za-z]/.test(t) && t.trim().length > 1,
      ),
    ),
  ];
  if (!missing.length) return resolved;

  await requestTranslations(lang, missing);
  return texts.map((t) => lookup(lang, t.trim()) ?? t);
}
