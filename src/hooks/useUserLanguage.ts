/**
 * useUserLanguage — single source of truth for the user's app language.
 * Reads from localStorage (written by the first-run gate / LanguagePicker),
 * then seeds from profiles.bio JSON when this device has never chosen.
 * Pass the returned `language` code into every AI edge function call.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getStoredLanguage,
  LANGUAGE_CHANGED_EVENT,
  LANGUAGE_STORAGE_KEY,
  resolveLanguageCode,
} from "@/lib/languagePreference";

export function useUserLanguage(): string {
  const [language, setLanguage] = useState<string>(() => {
    return resolveLanguageCode(getStoredLanguage()) ?? "en";
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("bio")
          .eq("user_id", user.id)
          .single();
        if (cancelled || !data?.bio) return;
        try {
          const prefs = JSON.parse(data.bio);
          const remote = resolveLanguageCode(prefs?.language);
          // The device-level choice (first-run gate / Settings) wins. The
          // profile is only used to seed a device that has never chosen.
          if (remote && !getStoredLanguage()) {
            setLanguage(remote);
            try { localStorage.setItem(LANGUAGE_STORAGE_KEY, remote); } catch { /* ignore */ }
          }
        } catch { /* bio is plain text */ }
      } catch { /* silent */ }
    })();

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      const code = resolveLanguageCode(detail) ?? resolveLanguageCode(getStoredLanguage()) ?? "en";
      setLanguage(code);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== LANGUAGE_STORAGE_KEY) return;
      setLanguage(resolveLanguageCode(e.newValue) ?? "en");
    };

    window.addEventListener(LANGUAGE_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(LANGUAGE_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return language;
}
