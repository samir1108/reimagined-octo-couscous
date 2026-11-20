import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import Seo, { SITE_URL, SITE_NAME } from "@/components/seo/Seo";
import { LOOPS, LOOP_CATEGORIES, LoopCategory } from "@/data/loops";
import { loopSlug } from "@/lib/seoUtils";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const Loops = () => {
  useForceDarkMode();
  const [cat, setCat] = useState<"All" | LoopCategory>("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return LOOPS.filter(l =>
      (cat === "All" || l.category === cat) &&
      (q === "" || l.name.toLowerCase().includes(q.toLowerCase()) || l.keywords.some(k => k.toLowerCase().includes(q.toLowerCase())))
    );
  }, [cat, q]);

  const categories = Object.keys(LOOP_CATEGORIES) as LoopCategory[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `The Consciousness Loop Library — ${LOOPS.length}+ Behavioral Patterns`,
    url: `${SITE_URL}/loops`,
    description: `A complete library of ${LOOPS.length} behavioral and consciousness loops with triggers, manifestations, awareness markers, and dissolution paths.`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <Seo
        title={`The Loop Library — ${LOOPS.length}+ Consciousness Patterns`}
        description={`Explore ${LOOPS.length} behavioral loops with triggers, manifestations, awareness markers, and dissolution paths. From people-pleasing to spiritual bypassing.`}
        canonicalPath="/loops"
        keywords="consciousness loops, behavioral patterns, mental loops, awareness, self-inquiry, shadow work"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
          <header className="mb-10">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">← ConsciousOS</Link>
            <h1 className="mt-4 text-4xl md:text-5xl font-light tracking-tight">The Loop Library</h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
              {LOOPS.length} behavioral patterns mapped with triggers, manifestations, awareness markers, and a path to dissolution.
              The atlas your therapist wishes existed.
            </p>
          </header>

          <div className="mb-8 space-y-4">
            <input
              type="search"
              placeholder="Search loops…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCat("All")}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${cat === "All" ? "bg-amber-500/20 border-amber-500/50 text-amber-200" : "bg-transparent border-border text-muted-foreground hover:text-foreground"}`}
              >
                All ({LOOPS.length})
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${cat === c ? "bg-amber-500/20 border-amber-500/50 text-amber-200" : "bg-transparent border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {LOOP_CATEGORIES[c].emoji} {LOOP_CATEGORIES[c].label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-4">{filtered.length} loops</div>

          <ul className="divide-y divide-border">
            {filtered.map(loop => (
              <li key={loop.id} className="py-5">
                <Link to={`/loops/${loopSlug(loop)}`} className="block group">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-amber-500/70">
                      {LOOP_CATEGORIES[loop.category]?.emoji} {LOOP_CATEGORIES[loop.category]?.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">{loop.id}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-medium group-hover:text-amber-200 transition leading-snug">
                    {loop.name}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{loop.description}</p>
                </Link>
              </li>
            ))}
          </ul>

          <footer className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
            <p>© ConsciousOS — the loop library powers our adaptive consciousness engine.</p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Loops;
