import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Check, Search, RotateCcw } from "lucide-react";
import { APP_LANGUAGES, type AppLanguage } from "@/data/languages";
import { preloadLanguage } from "@/lib/i18n";
import { persistLanguageToProfile } from "@/lib/languageProfile";
import { getStoredLanguage, resolveLanguageCode, setStoredLanguage } from "@/lib/languagePreference";

export default function LanguagePicker() {
  const [selected, setSelected] = useState(() => resolveLanguageCode(getStoredLanguage()) ?? "en");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSelect = async (lang: AppLanguage) => {
    setSelected(lang.code);
    setExpanded(false);
    setStoredLanguage(lang.code);
    void preloadLanguage(lang.code);
    await persistLanguageToProfile(lang.code);
  };

  const filtered = search
    ? APP_LANGUAGES.filter(l =>
        l.label.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeLabel.toLowerCase().includes(search.toLowerCase())
      )
    : APP_LANGUAGES;

  const current = APP_LANGUAGES.find(l => l.code === selected) || APP_LANGUAGES[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-body text-foreground">Language</span>
        </div>
        {selected !== "en" && (
          <button
            onClick={() => handleSelect(APP_LANGUAGES[0])}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-body text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass-subtle text-left"
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-sm font-body text-foreground flex-1">
          {current.nativeLabel} <span className="text-muted-foreground">({current.label})</span>
        </span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-muted-foreground text-xs">▼</motion.span>
      </motion.button>

      {expanded && (
        <motion.div
          className="mt-2 rounded-xl glass-card border border-border/20 overflow-hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="p-2 border-b border-border/10">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-subtle">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search language..."
                className="bg-transparent text-sm font-body text-foreground outline-none w-full placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[250px] overflow-y-auto p-1">
            {filtered.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm font-body transition-all ${
                  selected === lang.code
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/20"
                }`}
              >
                <span className="flex-1">{lang.nativeLabel}</span>
                <span className="text-xs text-muted-foreground">{lang.label}</span>
                {selected === lang.code && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
