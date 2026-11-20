import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { getEssay, getCategory, KNOWLEDGE_ESSAYS } from "@/data/knowledgeEssays";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const KnowledgeEssay = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const { category = "", slug = "" } = useParams();
  const essay = getEssay(slug);
  if (!essay || essay.category !== category) return <Navigate to="/knowledge" replace />;
  const cat = getCategory(category);
  const wordCount = essay.content.split(/\s+/).length;

  const related = essay.related
    .map(s => KNOWLEDGE_ESSAYS.find(e => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => !!e);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: essay.title,
      description: essay.metaDescription,
      datePublished: essay.publishedAt,
      dateModified: essay.updatedAt,
      author: { "@type": "Person", name: "Samir Sourav", url: `${SITE_URL}/` },
      publisher: { "@type": "Organization", name: "ConsciousOS", url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/knowledge/${category}/${slug}` },
      keywords: essay.keywords,
      wordCount,
      articleSection: essay.categoryLabel,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ConsciousOS", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Knowledge", item: `${SITE_URL}/knowledge` },
        { "@type": "ListItem", position: 3, name: essay.categoryLabel, item: `${SITE_URL}/knowledge/${category}` },
        { "@type": "ListItem", position: 4, name: essay.title, item: `${SITE_URL}/knowledge/${category}/${slug}` },
      ],
    },
  ];

  return (
    <>
      <Seo
        title={essay.title}
        description={essay.metaDescription}
        canonicalPath={`/knowledge/${category}/${slug}`}
        type="article"
        keywords={essay.keywords}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <article className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(`/knowledge/${category}`))}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-200 transition mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
             <Link to="/" className="hover:text-foreground">ConsciousOS</Link>
            <span>/</span>
            <Link to="/knowledge" className="hover:text-foreground">Knowledge</Link>
            <span>/</span>
            <Link to={`/knowledge/${category}`} className="hover:text-foreground">{essay.categoryLabel}</Link>
          </nav>

          <header className="mb-10">
            <h1 className="text-3xl md:text-[42px] font-light leading-tight tracking-tight">{essay.title}</h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground italic leading-relaxed">{essay.subtitle}</p>
            <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>By Samir Sourav</span>
              <span>·</span>
              <time dateTime={essay.publishedAt}>Published {essay.publishedAt}</time>
              <span>·</span>
              <span>{essay.readMinutes} min read</span>
              <span>·</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </header>

          <div className="prose dark:prose-invert prose-amber max-w-none
                         prose-headings:font-light prose-headings:tracking-tight
                         prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-amber-100/90
                         prose-h3:text-lg prose-h3:mt-8
                         prose-p:text-[16px] prose-p:leading-[1.8] prose-p:text-foreground/90
                         prose-li:text-[15.5px] prose-li:text-foreground/90 prose-li:leading-relaxed
                         prose-a:text-amber-300 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground prose-strong:font-semibold
                         prose-blockquote:border-l-amber-500/40 prose-blockquote:text-foreground/80 prose-blockquote:italic
                         prose-code:text-amber-200 prose-code:bg-amber-500/10 prose-code:px-1 prose-code:rounded
                         prose-table:text-sm prose-th:text-amber-200/90 prose-th:font-medium
                         prose-hr:border-border">
            <ReactMarkdown>{essay.content}</ReactMarkdown>
          </div>

          {essay.citations.length > 0 && (
            <section className="mt-14 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-amber-300/80 mb-4">Primary sources</h3>
              <ul className="space-y-2.5">
                {essay.citations.map((c, i) => (
                  <li key={i} className="text-sm text-foreground/80">
                    <span className="text-amber-500/60 mr-2 tabular-nums">[{i + 1}]</span>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-amber-200 underline-offset-2 hover:underline">
                        {c.label}
                      </a>
                    ) : (
                      <span>{c.label}</span>
                    )}
                    {c.note && <span className="text-muted-foreground"> — {c.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {essay.practiceLinks && essay.practiceLinks.length > 0 && (
            <section className="mt-10 rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm uppercase tracking-wider text-amber-300/80 mb-3">The practice, in the app</h3>
              <ul className="space-y-2">
                {essay.practiceLinks.map((p, i) => (
                  <li key={i}>
                    <Link to={p.href} className="text-amber-200 hover:text-amber-100">→ {p.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <aside className="mt-14 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Read next</h3>
              <ul className="space-y-3">
                {related.map(r => (
                  <li key={r.slug}>
                    <Link to={`/knowledge/${r.category}/${r.slug}`} className="text-base hover:text-amber-200 transition">
                      → {r.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.categoryLabel}</p>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm">
            <Link to={`/knowledge/${category}`} className="text-muted-foreground hover:text-foreground">
              ← All essays in {essay.categoryLabel}
            </Link>
             <Link to="/auth" className="text-amber-300 hover:text-amber-200">Try ConsciousOS →</Link>
          </footer>
        </article>
      </main>
    </>
  );
};

export default KnowledgeEssay;
