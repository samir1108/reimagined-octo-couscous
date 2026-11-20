/**
 * Dictionary — public SEO route at /dictionary
 * ─────────────────────────────────────────────
 * Open-source vocabulary of the consciousness operating system.
 * No auth. JSON-LD DefinedTermSet for search indexing.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { DICTIONARY, type DictionaryTerm } from "@/data/dictionary";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const PAGE_TITLE = "The ConsciousOS Dictionary — Loop, V-Level, Sakshi, Three Brains";
const PAGE_DESC =
  "Open-source vocabulary of consciousness. Definitions for Loop, V-Level, Sakshi, Three Brains, Samskara, Lineage, Consciousness Score — ancient tradition meets modern science.";

export default function Dictionary() {
  useForceDarkMode();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<DictionaryTerm | null>(null);

  // SEO head tags + JSON-LD
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const ensureMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };

    const m1 = ensureMeta("description", PAGE_DESC);
    const m2 = ensureMeta("og:title", PAGE_TITLE, "property");
    const m3 = ensureMeta("og:description", PAGE_DESC, "property");

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const hadCanon = !!canon;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/dictionary`;

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "The ConsciousOS Dictionary",
      description: PAGE_DESC,
      url: `${window.location.origin}/dictionary`,
      hasDefinedTerm: DICTIONARY.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.short,
        url: `${window.location.origin}/dictionary#${t.slug}`,
      })),
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      ld.remove();
      if (!hadCanon) canon?.remove();
    };
  }, []);

  const grouped = useMemo(
    () => [...DICTIONARY].sort((a, b) => a.term.localeCompare(b.term)),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="w-4 h-4" />
            <span className="font-display text-sm tracking-wide">Dictionary</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary/80 mb-4">
            Open Source · Free Forever
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
             The ConsciousOS Dictionary
          </h1>
          <p className="text-foreground/75 max-w-xl mx-auto text-base leading-relaxed">
            The vocabulary of awareness. Each term carries an ancient root,
            a modern decode, and a living example.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grouped.map((t, i) => (
            <motion.button
              key={t.slug}
              id={t.slug}
              onClick={() => setSelected(t)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="text-left rounded-2xl p-5 bg-card/40 border border-border/40
                         hover:border-primary/40 hover:bg-card/70 transition group"
            >
              <h2 className="font-display text-xl mb-1 text-foreground group-hover:text-primary transition">
                {t.term}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {t.short}
              </p>
            </motion.button>
          ))}
        </div>

        <p className="mt-16 text-center text-xs text-muted-foreground/70 max-w-md mx-auto">
          Use these terms freely. Translate them. Teach them. The map is open;
          the territory is yours.
        </p>
      </main>

      {/* Detail modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl overflow-y-auto"
          onClick={() => setSelected(null)}
        >
          <motion.article
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl mx-auto px-6 py-12"
          >
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground text-sm mb-6"
            >
              ← Back to dictionary
            </button>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80 mb-3">
              Term
            </p>
            <h2 className="font-display text-4xl mb-4">{selected.term}</h2>
            <p className="text-lg text-foreground/85 leading-relaxed mb-8">
              {selected.short}
            </p>

            <Section label="Tradition" body={selected.tradition} />
            <Section label="Science" body={selected.science} />
            <Section label="Example" body={selected.example} />

            {selected.related && selected.related.length > 0 && (
              <div className="mt-10">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                  Related
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.related.map((r) => {
                    const related = DICTIONARY.find((d) => d.slug === r);
                    if (!related) return null;
                    return (
                      <button
                        key={r}
                        onClick={() => setSelected(related)}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition"
                      >
                        {related.term}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.article>
        </motion.div>
      )}
    </div>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-[15px] text-foreground/85 leading-relaxed">{body}</p>
    </div>
  );
}
