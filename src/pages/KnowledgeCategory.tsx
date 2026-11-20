import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { getCategory, essaysInCategory } from "@/data/knowledgeEssays";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const KnowledgeCategory = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { category = "" } = useParams();
  const cat = getCategory(category);
  if (!cat) return <Navigate to="/knowledge" replace />;
  const essays = essaysInCategory(cat.slug);

  return (
    <>
      <Seo
         title={`${cat.label} — ConsciousOS Knowledge Network`}
        description={cat.description}
        canonicalPath={`/knowledge/${cat.slug}`}
        keywords={cat.label}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/knowledge"))}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
            <Link to="/knowledge" className="hover:text-foreground">Knowledge</Link>
            <span>/</span>
            <span className="text-amber-500/70">{cat.label}</span>
          </nav>

          <header className="mb-10">
            <p className="text-[10px] uppercase tracking-wider text-amber-500/70">
              Series {String(cat.order).padStart(2, "0")} · {essays.length} of {cat.plannedCount} published
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-light leading-tight tracking-tight">{cat.label}</h1>
            <p className="mt-3 text-base text-foreground/80 italic">{cat.tagline}</p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
          </header>

          {essays.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              This series is in writing. The first essay will appear here soon. In the meantime, read{" "}
              <Link to="/knowledge" className="text-amber-300 hover:text-amber-200">the other series</Link>.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {essays.map((e, i) => (
                <li key={e.slug} className="py-5">
                  <Link to={`/knowledge/${cat.slug}/${e.slug}`} className="block group">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-amber-500/60 tabular-nums">
                        Essay {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{e.readMinutes} min</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-medium group-hover:text-amber-200 transition leading-snug">
                      {e.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{e.subtitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
            <Link to="/knowledge" className="hover:text-foreground">← All series</Link>
            <span className="mx-3">·</span>
            <Link to={`${SITE_URL ? "" : ""}/blog`} className="hover:text-foreground">The Journal</Link>
          </footer>
        </div>
      </main>
    </>
  );
};

export default KnowledgeCategory;
