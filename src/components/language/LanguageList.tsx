import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, Sparkles, X } from "lucide-react";
import { APP_LANGUAGES, type AppLanguage } from "@/data/languages";
import { detectBrowserLanguage } from "@/lib/languagePreference";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;
  onSelect: (code: string) => void;
  suggested?: string | null;
  autoFocus?: boolean;
  className?: string;
  listClassName?: string;
}

function matches(lang: AppLanguage, query: string): boolean {
  const q = query.toLowerCase();
  return (
    lang.label.toLowerCase().includes(q) ||
    lang.nativeLabel.toLowerCase().includes(q) ||
    lang.code.toLowerCase().includes(q)
  );
}

/**
 * Searchable list of every language the app supports. Used by the first-run
 * language gate, the landing-page language dialog, and Settings.
 */
export default function LanguageList({
  value = "",
  onSelect,
  suggested,
  autoFocus = false,
  className,
  listClassName,
}: Props) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const suggestion = suggested ?? detectBrowserLanguage();

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return APP_LANGUAGES;
    return APP_LANGUAGES.filter((l) => matches(l, q));
  }, [query]);

  const ordered = useMemo(() => {
    if (query.trim()) return filtered;
    const sug = APP_LANGUAGES.find((l) => l.code === suggestion);
    if (!sug) return filtered;
    return [sug, ...filtered.filter((l) => l.code !== sug.code)];
  }, [filtered, query, suggestion]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    itemRefs.current[highlight]?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, ordered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      const lang = ordered[highlight];
      if (lang) {
        e.preventDefault();
        onSelect(lang.code);
      }
    } else if (e.key === "Escape" && query) {
      e.preventDefault();
      setQuery("");
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(ordered.length - 1);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", className)} onKeyDown={handleKeyDown}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${APP_LANGUAGES.length} languages...`}
          aria-label="Search languages"
          className="w-full rounded-xl border border-border/50 bg-card/50 py-2.5 pl-10 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div
        role="listbox"
        aria-label="Languages"
        className={cn(
          "max-h-[48vh] overflow-y-auto rounded-xl border border-border/40 bg-card/30 p-1",
          listClassName,
        )}
      >
        {ordered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No languages match "{query}".
          </p>
        ) : (
          ordered.map((lang, i) => {
            const selected = lang.code === value;
            const isSuggestion = !query.trim() && i === 0 && lang.code === suggestion;
            return (
              <button
                key={lang.code}
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => onSelect(lang.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  i === highlight ? "bg-primary/15" : "hover:bg-primary/10",
                  selected && "bg-primary/10 text-primary",
                )}
              >
                <span
                  data-no-translate
                  className="min-w-0 flex-1 truncate font-body text-foreground"
                >
                  {lang.nativeLabel}
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {lang.label}
                </span>
                {isSuggestion && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary">
                    <Sparkles className="h-2.5 w-2.5" />
                    Suggested
                  </span>
                )}
                {selected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            );
          })
        )}
      </div>

      <p className="px-1 text-center text-[10px] text-muted-foreground/70">
        {APP_LANGUAGES.length} languages · use ↑ ↓ and Enter to choose
      </p>
    </div>
  );
}
