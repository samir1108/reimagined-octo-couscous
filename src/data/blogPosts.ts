import { KNOWLEDGE_ESSAYS, type Citation } from "./knowledgeEssays";
import { loopsAsBlogPosts } from "./loopBlogPosts";
import { breakthroughsAsBlogPosts } from "./breakthroughBlogPosts";
import { newConceptsAsBlogPosts } from "./newConceptBlogPosts";
import { deepConceptsAsBlogPosts } from "./deepConceptBlogPosts";
import { thirdConceptsAsBlogPosts } from "./thirdConceptBlogPosts";
import { publicAssetUrl } from "@/lib/media/publicAssets";


export interface BlogPost {
  slug: string;
  title: string;
  keyword: string;
  pillar: string;
  metaDescription: string;
  content: string;
  publishedAt: string;
  /** Optional extras (used by Knowledge Network essays). */
  subtitle?: string;
  citations?: Citation[];
  practiceLinks?: { label: string; href: string }[];
  isKnowledgeEssay?: boolean;
}

let _cache: BlogPost[] | null = null;
let _inflight: Promise<BlogPost[]> | null = null;

/** Map a KnowledgeEssay → BlogPost shape so the blog UI can render both. */
function knowledgeAsBlogPosts(): BlogPost[] {
  return KNOWLEDGE_ESSAYS.map(e => ({
    slug: e.slug,
    title: e.title,
    keyword: e.keywords,
    pillar: e.categoryLabel,
    metaDescription: e.metaDescription,
    content: e.content,
    publishedAt: e.publishedAt,
    subtitle: e.subtitle,
    citations: e.citations,
    practiceLinks: e.practiceLinks,
    isKnowledgeEssay: true,
  }));
}

export async function loadBlogPosts(): Promise<BlogPost[]> {
  if (_cache) return _cache;
  if (_inflight) return _inflight;
  // Served from the Supabase CDN (2.8 MB), so it is an edge hit rather
  // than a trip to the app origin. The local copy in public/ stays as a
  // fallback for anyone running without the CDN manifest.
  _inflight = fetch(publicAssetUrl("/blog-posts.json"), { cache: "force-cache" })
    .then((r) => r.json())
    .then((data: BlogPost[]) => {
      // Knowledge essays render first — they are the canonical long-form work.
      // Existing JSON posts continue to render after.
      // Loop atlas essays (one per loop in src/data/loops.ts) render last so the
      // /blog index automatically covers all 600+ loops in the engine.
      // Breakthrough atlas essays (one per generated breakthrough) render last
      // so /blog automatically covers all 1000+ breakthroughs in the catalog.
      const merged = [...knowledgeAsBlogPosts(), ...data, ...loopsAsBlogPosts(), ...breakthroughsAsBlogPosts(), ...newConceptsAsBlogPosts(), ...deepConceptsAsBlogPosts(), ...thirdConceptsAsBlogPosts()];
      _cache = merged;
      _inflight = null;
      return merged;
    })
    .catch((e) => {
      _inflight = null;
      console.warn("Failed to load blog posts", e);
      // Even if JSON fetch fails, still surface the knowledge + loop essays.
      _cache = [...knowledgeAsBlogPosts(), ...loopsAsBlogPosts(), ...breakthroughsAsBlogPosts()];
      return _cache;
    });
  return _inflight;
}

export async function loadBlogPillars(): Promise<string[]> {
  const posts = await loadBlogPosts();
  return Array.from(new Set(posts.map((p) => p.pillar)));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await loadBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<BlogPost[]> {
  const posts = await loadBlogPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return [];
  return posts.filter((p) => p.slug !== slug && p.pillar === post.pillar).slice(0, limit);
}
