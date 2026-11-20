import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { loadBlogPosts, type BlogPost } from "@/data/blogPosts";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0, 0, 0.2, 1] as const },
  }),
};

const pillarColors: Record<string, string> = {
  "Ancient Tech": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Engine": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "Neuroscience": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Loops": "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "Paths": "text-rose-400 bg-rose-400/10 border-rose-400/20",
  "Witness": "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  "default": "text-primary bg-primary/10 border-primary/20",
};

function getPillarStyle(pillar: string) {
  return pillarColors[pillar] || pillarColors.default;
}

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts().then((data) => {
      const sorted = [...data].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setPosts(sorted);
      setLoading(false);
    });
  }, []);

  const featuredPosts = posts.slice(0, 6);
  const totalPosts = posts.length;

  if (loading) {
    return (
      <section id="blog" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-body tracking-[0.3em] uppercase text-primary/70 mb-4">The Journal</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-center text-foreground">
              Deep Essays on <span className="text-gradient-sunrise">Consciousness</span>
            </h2>
            <p className="text-lg font-body font-light text-muted-foreground text-center max-w-3xl mx-auto">
              Ancient wisdom meets modern neuroscience. Written by Samir Sourav, founder of ConsciousOS.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} className="p-6 rounded-2xl border border-border/40 bg-card/20 animate-pulse">
                <div className="h-4 bg-muted/20 rounded w-3/4 mb-3" />
                <div className="h-6 bg-muted/20 rounded w-full mb-2" />
                <div className="h-4 bg-muted/20 rounded w-1/2 mb-4" />
                <div className="h-4 bg-muted/20 rounded w-5/6 mb-2" />
                <div className="h-4 bg-muted/20 rounded w-4/6" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          className="text-center mb-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-body text-primary">{totalPosts}+ Essays Published</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground leading-tight">
            The <span className="text-gradient-sunrise">ConsciousOS Journal</span>
          </h2>
          <p className="text-lg md:text-xl font-body font-light text-muted-foreground mb-4 max-w-3xl mx-auto">
            Deep, citation-rich essays at the intersection of ancient wisdom, neuroscience, and the engineering of consciousness.
          </p>
          <p className="text-sm font-body text-muted-foreground/60 max-w-2xl mx-auto">
            {totalPosts}+ essays across Ancient Tech, Neuroscience, Engine Architecture, Loop Atlas, Breakthrough Atlas, Yoga Paths & The Witness.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
        >
          {featuredPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              className="group relative p-6 rounded-2xl border border-border/40 bg-card/20 hover:border-primary/30 hover:bg-card/40 transition-all duration-500 overflow-hidden"
              custom={index + 2}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background/95" />
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative mb-4">
                <span className={`text-[10px] font-body tracking-widest uppercase px-2.5 py-1 rounded-full border ${getPillarStyle(post.pillar)}`}>
                  {post.pillar}
                </span>
                {post.isKnowledgeEssay && (
                  <span className="ml-2 text-[9px] font-body tracking-widest uppercase px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Canonical
                  </span>
                )}
              </div>

              <Link to={`/blog/${post.slug}`} className="block group">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition leading-snug">
                  {post.title}
                </h3>
                {post.subtitle ? (
                  <p className="text-sm text-foreground/70 italic line-clamp-2 mb-4">{post.subtitle}</p>
                ) : (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.metaDescription}</p>
                )}
              </Link>

              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <span className="text-xs font-body text-muted-foreground/60">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-body text-primary/80 hover:text-primary transition"
                >
                  Read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}
        >
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-[var(--shadow-glow-strong)] transition-all duration-500 group"
          >
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
            <span className="font-display font-semibold text-lg">Read All {totalPosts}+ Essays</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm font-body text-muted-foreground/60">
            Filter by pillar · Search by keyword · Canonical knowledge essays · Loop atlas entries · Breakthrough atlas entries
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;