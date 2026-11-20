// LanguageContext: applies the user's chosen language to <html>, mounts
// AutoTranslateRoot for the whole document (including public landing pages),
// and exposes useT().
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { APP_LANGUAGES } from "@/data/languages";
import { getCached } from "@/lib/translateCache";
import { getStatic, preloadLanguage } from "@/lib/i18n";
import { resolveLanguageCode } from "@/lib/languagePreference";
import AutoTranslateRoot from "@/components/AutoTranslateRoot";

interface Ctx {
  language: string;
  dir: "ltr" | "rtl";
  t: (s: string) => string;
}

const LanguageCtx = createContext<Ctx>({
  language: "en",
  dir: "ltr",
  t: (s) => s,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const stored = useUserLanguage();
  const language = resolveLanguageCode(stored) ?? "en";
  const dir = useMemo<"ltr" | "rtl">(() => {
    const meta = APP_LANGUAGES.find((l) => l.code === language);
    return meta?.direction ?? "ltr";
  }, [language]);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    } catch { /* */ }
  }, [language, dir]);

  // Eagerly load the pre-built static dict for the active language.
  useEffect(() => {
    if (language && language !== "en") preloadLanguage(language);
  }, [language]);

  const value = useMemo<Ctx>(
    () => ({
      language,
      dir,
      t: (s: string) => {
        if (!s || language === "en") return s;
        // 1) Pre-built static translation (instant, offline-ready)
        const stat = getStatic(language, s);
        if (stat) return stat;
        // 2) Dynamic AI translation cache
        return getCached(language, s) ?? s;
      },
    }),
    [language, dir],
  );

  return (
    <LanguageCtx.Provider value={value}>
      {children}
      <AutoTranslateRoot language={language} />
    </LanguageCtx.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageCtx);
}

/** Sync translation hook. Returns cached translation or the original until cache fills. */
export function useT(s: string): string {
  const { t } = useContext(LanguageCtx);
  return t(s);
}
