import { Link, useParams, Navigate } from "react-router-dom";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { LOOPS, LOOP_CATEGORIES, getLoopById } from "@/data/loops";
import { loopIdFromSlug, loopSlug } from "@/lib/seoUtils";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const LoopDetail = () => {
  useForceDarkMode();
  const { slug = "" } = useParams();
  const id = loopIdFromSlug(slug);
  const loop = id ? getLoopById(id) : undefined;

  if (!loop) return <Navigate to="/loops" replace />;

  const cat = LOOP_CATEGORIES[loop.category];
  const related = LOOPS.filter(l => l.category === loop.category && l.id !== loop.id).slice(0, 5);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${loop.name} — Loop Pattern Analysis`,
      description: loop.description,
      author: { "@type": "Organization", name: "ConsciousOS" },
      publisher: { "@type": "Organization", name: "ConsciousOS", url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/loops/${loopSlug(loop)}` },
      keywords: loop.keywords.join(", "),
      articleSection: cat?.label,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ConsciousOS", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Loops", item: `${SITE_URL}/loops` },
        { "@type": "ListItem", position: 3, name: loop.name, item: `${SITE_URL}/loops/${loopSlug(loop)}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: `How to dissolve the ${loop.name} loop`,
      description: loop.dissolution_path,
      step: [{ "@type": "HowToStep", text: loop.dissolution_path }],
    },
  ];

  const rawTitle = `${loop.name} — Recognize & Dissolve This Loop`;
  const title = rawTitle.length > 60 ? `${loop.name} — Dissolve This Loop` : rawTitle;
  const rawDesc = `${loop.description}. Triggers: ${loop.triggers.slice(0, 2).join(", ")}.`;
  const desc = rawDesc.length > 160 ? rawDesc.slice(0, 157) + "…" : rawDesc;

  return (
    <>
      <Seo
        title={title}
        description={desc}
        canonicalPath={`/loops/${loopSlug(loop)}`}
        type="article"
        keywords={loop.keywords.join(", ")}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <article className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
             <Link to="/" className="hover:text-foreground">ConsciousOS</Link>
            <span>/</span>
            <Link to="/loops" className="hover:text-foreground">Loops</Link>
            <span>/</span>
            <span className="text-amber-500/70">{cat?.label}</span>
          </nav>

          <header className="mb-8">
            <div className="text-[10px] uppercase tracking-wider text-amber-500/70 mb-2">
              {cat?.emoji} {cat?.label} · {loop.id}
            </div>
            <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight">{loop.name}</h1>
            <p className="mt-4 text-lg text-foreground/85 leading-relaxed">{loop.description}</p>
          </header>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Triggers</h2>
            <ul className="space-y-2">
              {loop.triggers.map((t, i) => (
                <li key={i} className="text-[15px] text-foreground/90">→ {t}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">How it manifests</h2>
            <ul className="space-y-2">
              {loop.manifestations.map((m, i) => (
                <li key={i} className="text-[15px] text-foreground/90">• {m}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Awareness markers</h2>
            <ul className="space-y-2">
              {loop.awareness_markers.map((a, i) => (
                <li key={i} className="text-[15px] text-foreground/90">✦ {a}</li>
              ))}
            </ul>
          </section>

          <section className="mb-10 p-5 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <h2 className="text-sm uppercase tracking-wider text-amber-300 mb-2">Dissolution path</h2>
            <p className="text-[15.5px] text-foreground/90 leading-relaxed">{loop.dissolution_path}</p>
          </section>

          <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
            <div className="p-3 rounded-lg border border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Dimension</div>
              <div className="capitalize">{loop.related_dimension}</div>
            </div>
            <div className="p-3 rounded-lg border border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Chakra</div>
              <div className="capitalize">{loop.related_chakra.replace("_", " ")}</div>
            </div>
          </div>

          {related.length > 0 && (
            <aside className="mt-12 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Related {cat?.label}</h3>
              <ul className="space-y-3">
                {related.map(r => (
                  <li key={r.id}>
                    <Link to={`/loops/${loopSlug(r)}`} className="text-base hover:text-amber-200 transition">
                      → {r.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm">
            <Link to="/loops" className="text-muted-foreground hover:text-foreground">← All loops</Link>
            <Link to="/auth" className="text-amber-300 hover:text-amber-200">Track your loops →</Link>
          </footer>
        </article>
      </main>
    </>
  );
};

export default LoopDetail;
