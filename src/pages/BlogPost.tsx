import { Link, useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Seo, { SITE_URL } from "@/components/seo/Seo";
import { loadBlogPosts, type BlogPost as BlogPostT } from "@/data/blogPosts";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";
import { KnowledgeGraphViz } from "@/components/knowledge-graph";

const BlogPost = () => {
  useForceDarkMode();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<BlogPostT[] | null>(null);

  useEffect(() => {
    loadBlogPosts().then(setAllPosts);
  }, []);

  if (!allPosts) {
    return <main className="min-h-screen bg-background" />;
  }

  const post = allPosts.find(p => p.slug === slug);
  if (!post) return <Navigate to="/blog" replace />;

  const related = allPosts.filter(p => p.slug !== slug && p.pillar === post.pillar).slice(0, 4);
  const wordCount = post.content.split(/\s+/).length;
  const readMin = Math.max(3, Math.round(wordCount / 220));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      author: { "@type": "Person", name: "Samir Sourav", url: `${SITE_URL}/` },
      publisher: { "@type": "Organization", name: "ConsciousOS", url: SITE_URL },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
      keywords: post.keyword,
      wordCount,
      articleSection: post.pillar,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ConsciousOS", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${post.slug}` },
      ],
    },
  ];

  return (
    <>
      <Seo
        title={post.title}
        description={post.metaDescription}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        keywords={post.keyword}
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <article className="max-w-2xl mx-auto px-4 py-10 md:py-16">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/blog"))}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-200 transition mb-5"
            aria-label="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
             <Link to="/" className="hover:text-foreground">ConsciousOS</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground">Journal</Link>
            <span>/</span>
            <span className="text-amber-500/70">{post.pillar}</span>
          </nav>

          <header className="mb-8">
            {post.isKnowledgeEssay && (
              <p className="text-[10px] uppercase tracking-wider text-amber-400/80 mb-3">
                Knowledge Network · Canonical essay
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight">{post.title}</h1>
            {post.subtitle && (
              <p className="mt-4 text-base md:text-lg text-muted-foreground italic leading-relaxed">
                {post.subtitle}
              </p>
            )}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span>By Samir Sourav</span>
              <span>·</span>
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span>·</span>
              <span>{readMin} min read</span>
              <span>·</span>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </header>

          <div className="prose dark:prose-invert prose-amber max-w-none
                         prose-headings:font-light prose-headings:tracking-tight
                         prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                         prose-h3:text-lg prose-h3:mt-6
                         prose-p:text-[15.5px] prose-p:leading-relaxed prose-p:text-foreground/90
                         prose-li:text-[15px] prose-li:text-foreground/90
                         prose-a:text-amber-300 prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-foreground
                         prose-blockquote:border-l-amber-500/40 prose-blockquote:text-foreground/80
                         prose-code:text-amber-200 prose-code:bg-amber-500/10 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {post.citations && post.citations.length > 0 && (
            <section className="mt-14 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-amber-300/80 mb-4">Primary sources</h3>
              <ul className="space-y-2.5">
                {post.citations.map((c, i) => (
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

          {post.practiceLinks && post.practiceLinks.length > 0 && (
            <section className="mt-10 rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
              <h3 className="text-sm uppercase tracking-wider text-amber-300/80 mb-3">The practice, in the app</h3>
              <ul className="space-y-2">
                {post.practiceLinks.map((p, i) => (
                  <li key={i}>
                    <Link to={p.href} className="text-amber-200 hover:text-amber-100">→ {p.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <aside className="mt-16 pt-8 border-t border-border">
              <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Knowledge Graph — Connected Concepts</h3>
              <KnowledgeGraphViz
                centerNodeId={`post::${post.slug}`}
                centerNodeType={post.isKnowledgeEssay ? 'knowledge-essay' : 'blog-post'}
                maxNodes={20}
                maxDepth={2}
                showControls={true}
                className="h-[400px]"
              />
            </aside>
          )}

          <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm">
            <Link to="/blog" className="text-muted-foreground hover:text-foreground">← All essays</Link>
             <Link to="/auth" className="text-amber-300 hover:text-amber-200">Try ConsciousOS →</Link>
          </footer>
        </article>
      </main>
    </>
  );
};

export default BlogPost;
