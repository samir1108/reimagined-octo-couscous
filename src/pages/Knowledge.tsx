import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Seo, { SITE_URL, SITE_NAME } from "@/components/seo/Seo";
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_ESSAYS } from "@/data/knowledgeEssays";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const Knowledge = () => {
  useForceDarkMode();
  const navigate = useNavigate();

  const totalPlanned = KNOWLEDGE_CATEGORIES.reduce((s, c) => s + c.plannedCount, 0);
  const totalWritten = KNOWLEDGE_ESSAYS.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} — The Knowledge Network`,
    url: `${SITE_URL}/knowledge`,
    description: "200 canonical essays on consciousness, ancient practice, and modern neuroscience. The reference essay on each topic.",
  };

  return (
    <>
      <Seo
        title="The Knowledge Network — 200 canonical essays on consciousness"
        description="Not blog posts. The reference essay on each topic. 5,000–8,000 words. Cited. Cross-linked. The map of the inner life, by Samir Sourav."
        canonicalPath="/knowledge"
        keywords="consciousness essays, yoga philosophy, meditation neuroscience, 11 bands of consciousness, witness practice, what is religion"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
          <header className="mb-12">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="mt-6 text-4xl md:text-5xl font-light tracking-tight leading-tight">
              The Knowledge Network
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Not blog posts. The reference essay on each topic. Five to eight thousand words. Cited.
              Cross-linked. The map of the inner life — written so that, once written, it does not need
              to be written again.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {totalWritten} of {totalPlanned} essays published · A multi-year project · By Samir Sourav
            </p>
          </header>

          <ul className="space-y-1">
            {KNOWLEDGE_CATEGORIES.sort((a, b) => a.order - b.order).map(cat => {
              const written = KNOWLEDGE_ESSAYS.filter(e => e.category === cat.slug).length;
              return (
                <li key={cat.slug}>
                  <Link
                    to={`/knowledge/${cat.slug}`}
                    className="group block py-5 px-1 border-b border-border hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-amber-500/60 tabular-nums">
                        {String(cat.order).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {written} / {cat.plannedCount}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-light group-hover:text-amber-200 transition leading-snug">
                      {cat.label}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground italic">{cat.tagline}</p>
                    <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{cat.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-amber-300/80 opacity-0 group-hover:opacity-100 transition">
                      Enter <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <footer className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground space-y-2">
            <p>© ConsciousOS — written by Samir Sourav, sole founder.</p>
            <p>
              Looking for shorter pieces?{" "}
              <Link to="/blog" className="text-amber-300/80 hover:text-amber-200">Read the Journal →</Link>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Knowledge;
