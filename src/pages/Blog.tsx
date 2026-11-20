import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Seo, { SITE_URL, SITE_NAME } from "@/components/seo/Seo";
import { loadBlogPosts, type BlogPost } from "@/data/blogPosts";
import { useForceDarkMode } from "@/hooks/useForceDarkMode";

const Blog = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pillar, setPillar] = useState<string>(searchParams.get("pillar") ?? "All");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(120);

  useEffect(() => {
    loadBlogPosts().then(setPosts);
  }, []);

  useEffect(() => {
    if (pillar === "All") {
      if (searchParams.has("pillar")) {
        searchParams.delete("pillar");
        setSearchParams(searchParams, { replace: true });
      }
    } else if (searchParams.get("pillar") !== pillar) {
      searchParams.set("pillar", pillar);
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillar]);


  const pillars = useMemo(() => Array.from(new Set(posts.map(p => p.pillar))), [posts]);

  const filtered = useMemo(() => {
    return posts.filter(p =>
      (pillar === "All" || p.pillar === pillar) &&
      (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || p.keyword.toLowerCase().includes(q.toLowerCase()))
    );
  }, [pillar, q, posts]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Journal`,
    url: `${SITE_URL}/blog`,
    description: "Deep essays on consciousness, ancient wisdom, neuroscience, and the engineering behind ConsciousOS.",
    blogPost: posts.slice(0, 20).map(p => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      author: { "@type": "Person", name: "Samir Sourav" },
    })),
  };

  return (
    <>
      <Seo
        title="The ConsciousOS Journal — Consciousness Essays"
        description="Deep, citation-rich essays on consciousness, neuroscience, ancient wisdom, and the engineering of an AI consciousness instrument. By Samir Sourav."
        canonicalPath="/blog"
        keywords="consciousness, meditation, neuroscience, ancient wisdom, yoga sutras, AI, default mode network, consciousness app"
        jsonLd={jsonLd}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
          <header className="mb-10">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="mt-4 text-4xl md:text-5xl font-light tracking-tight">The Journal</h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
              Deep essays at the intersection of ancient wisdom, neuroscience, and the engineering of consciousness.
              Written by Samir Sourav, sole founder of ConsciousOS.
            </p>
          </header>

          <div className="mb-8 space-y-4">
            <input
              type="search"
              placeholder="Search essays…"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <div className="flex flex-wrap gap-2">
              {["All", ...pillars].map(p => (
                <button
                  key={p}
                  onClick={() => setPillar(p)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    pillar === p
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                      : "bg-transparent border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground mb-4">{filtered.length} essays</div>

          <ul className="divide-y divide-border">
            {visible.map(post => (
              <li key={post.slug} className="py-5">
                <Link to={`/blog/${post.slug}`} className="block group">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider text-amber-500/70">{post.pillar}</span>
                    {post.isKnowledgeEssay && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-300/90 border border-amber-500/30">
                        Canonical · {Math.max(3, Math.round(post.content.split(/\s+/).length / 220))} min
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg md:text-xl font-medium group-hover:text-amber-200 transition leading-snug">
                    {post.title}
                  </h2>
                  {post.subtitle ? (
                    <p className="mt-1.5 text-sm text-foreground/70 italic line-clamp-2">{post.subtitle}</p>
                  ) : (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{post.metaDescription}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {filtered.length > visible.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setVisibleCount(c => c + 120)}
                className="text-sm px-6 py-2.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-amber-500/40 transition"
              >
                Show more essays ({filtered.length - visible.length} remaining)
              </button>
            </div>
          )}

          <footer className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground">
             <p>© ConsciousOS — written by Samir Sourav. Citations link to peer-reviewed research and primary sources.</p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Blog;
