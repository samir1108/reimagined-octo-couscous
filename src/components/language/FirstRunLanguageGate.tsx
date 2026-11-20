import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";
import LanguageList from "@/components/language/LanguageList";
import { APP_LANGUAGES } from "@/data/languages";
import { preloadLanguage } from "@/lib/i18n";
import { persistLanguageToProfile } from "@/lib/languageProfile";
import {
  detectBrowserLanguage,
  getLanguageMeta,
  hasChosenLanguage,
  markLanguageChosen,
  setStoredLanguage,
} from "@/lib/languagePreference";

interface Props {
  children: ReactNode;
}

/**
 * Blocks the very first render on this device until the user either picks a
 * language or continues in English. The choice is applied to the entire app,
 * including public landing pages, and synced to the profile when signed in.
 */
export default function FirstRunLanguageGate({ children }: Props) {
  const [chosen, setChosen] = useState(() => hasChosenLanguage());
  const suggested = useMemo(() => detectBrowserLanguage(), []);
  const suggestedMeta = getLanguageMeta(suggested);

  if (chosen) return <>{children}</>;

  const apply = (code: string) => {
    setStoredLanguage(code);
    void preloadLanguage(code);
    void persistLanguageToProfile(code);
    setChosen(true);
  };

  const continueInEnglish = () => {
    markLanguageChosen();
    apply("en");
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-25%] right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col justify-center px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-8 flex items-center justify-center gap-2 text-primary">
            <Globe className="h-5 w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em]">
              First step
            </span>
          </div>

          <h1 className="text-center font-display text-3xl leading-tight text-foreground sm:text-4xl">
            Choose your language
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            {APP_LANGUAGES.length} languages. Everything — the landing page, the app, your
            guides and your reflections — will speak in your tongue.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary">
              <Sparkles className="h-3 w-3" />
              Suggested: {suggestedMeta.nativeLabel}
            </span>
            <span>Español</span>
            <span>·</span>
            <span>हिन्दी</span>
            <span>·</span>
            <span>العربية</span>
            <span>·</span>
            <span>中文</span>
            <span>·</span>
            <span>Русский</span>
          </div>

          <div className="mt-6">
            <LanguageList
              value=""
              suggested={suggested}
              onSelect={apply}
              autoFocus
              listClassName="max-h-[42vh]"
            />
          </div>

          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={continueInEnglish}
              className="rounded-full border border-border/50 px-5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Continue in English
            </button>
            <p className="text-center text-[10px] text-muted-foreground/60">
              You can change this anytime from the globe icon or Settings.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
