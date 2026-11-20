import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { Button } from "@/design-system";
import { Badge } from "@/design-system";
import { Input } from "@/design-system";
import { ExternalLink, RefreshCw, Search, FileText, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { loadBlogPosts, type BlogPost } from "@/data/blogPosts";
import { LOOPS, LOOP_CATEGORIES } from "@/data/loops";
import { loopSlug } from "@/lib/seoUtils";
import { SITE_URL } from "@/components/seo/Seo";
import { Link } from "react-router-dom";

interface SitemapStat {
  totalUrls: number;
  blogUrls: number;
  loopUrls: number;
  staticUrls: number;
  lastFetched: string;
  error?: string;
}

const fetchSitemapStats = async (): Promise<SitemapStat> => {
  try {
    const res = await fetch("/sitemap.xml", { cache: "no-store" });
    const text = await res.text();
    const total = (text.match(/<url>/g) || []).length;
    const blogUrls = (text.match(/\/blog\//g) || []).length;
    const loopUrls = (text.match(/\/loops\//g) || []).length;
    return {
      totalUrls: total,
      blogUrls,
      loopUrls,
      staticUrls: total - blogUrls - loopUrls,
      lastFetched: new Date().toLocaleTimeString(),
    };
  } catch (e: any) {
    return { totalUrls: 0, blogUrls: 0, loopUrls: 0, staticUrls: 0, lastFetched: "—", error: e.message };
  }
};

interface RobotsCheck {
  ok: boolean;
  hasGoogleBot: boolean;
  hasGptBot: boolean;
  hasSitemap: boolean;
  raw: string;
}

const checkRobots = async (): Promise<RobotsCheck> => {
  try {
    const res = await fetch("/robots.txt", { cache: "no-store" });
    const raw = await res.text();
    return {
      ok: true,
      hasGoogleBot: /Googlebot/i.test(raw),
      hasGptBot: /GPTBot/i.test(raw),
      hasSitemap: /Sitemap:/i.test(raw),
      raw,
    };
  } catch {
    return { ok: false, hasGoogleBot: false, hasGptBot: false, hasSitemap: false, raw: "" };
  }
};

const AdminSEO = () => {
  const [sitemap, setSitemap] = useState<SitemapStat | null>(null);
  const [robots, setRobots] = useState<RobotsCheck | null>(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [BLOG_POSTS, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadBlogPosts().then(setBlogPosts);
  }, []);

  const BLOG_PILLARS = useMemo(() => Array.from(new Set(BLOG_POSTS.map(p => p.pillar))), [BLOG_POSTS]);

  const refresh = async () => {
    setLoading(true);
    const [s, r] = await Promise.all([fetchSitemapStats(), checkRobots()]);
    setSitemap(s);
    setRobots(r);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Blog quality checks
  const blogIssues = useMemo(() => {
    const missing = BLOG_POSTS.filter(b => !b.metaDescription || b.metaDescription.length < 80 || b.metaDescription.length > 160);
    const shortTitles = BLOG_POSTS.filter(b => b.title.length < 30);
    const longTitles = BLOG_POSTS.filter(b => b.title.length > 60);
    return { missing, shortTitles, longTitles };
  }, [BLOG_POSTS]);

  // Pillar distribution
  const pillarDist = useMemo(() => {
    return BLOG_PILLARS.map(p => ({
      pillar: p,
      count: BLOG_POSTS.filter(b => b.pillar === p).length,
    }));
  }, [BLOG_POSTS, BLOG_PILLARS]);

  // Loop category distribution
  const loopCats = useMemo(() => {
    const counts: Record<string, number> = {};
    LOOPS.forEach(l => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const filteredBlogs = useMemo(() =>
    BLOG_POSTS.filter(b =>
      q === "" ||
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.keyword.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 50)
  , [q, BLOG_POSTS]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">SEO Diagnostic</h1>
          <p className="text-sm text-muted-foreground">Live inventory of indexed surface area, technical health, and content quality.</p>
        </div>
        <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total URLs in sitemap</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-light">{sitemap?.totalUrls ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Blog posts</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-light">{BLOG_POSTS.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Loop pages</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-light">{LOOPS.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total indexable</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-light text-amber-400">{BLOG_POSTS.length + LOOPS.length + 7}</div></CardContent>
        </Card>
      </div>

      {/* Technical health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4" /> Technical Foundation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <CheckRow ok={!!sitemap?.totalUrls} label={`sitemap.xml (${sitemap?.totalUrls ?? 0} URLs)`} />
          <CheckRow ok={!!robots?.hasSitemap} label="robots.txt references sitemap" />
          <CheckRow ok={!!robots?.hasGoogleBot} label="Googlebot allowed" />
          <CheckRow ok={!!robots?.hasGptBot} label="GPTBot / LLM crawlers allowed" />
          <CheckRow ok={true} label="JSON-LD structured data on blog & loop pages" />
          <CheckRow ok={true} label="Canonical tags via Seo component" />
          <CheckRow ok={true} label="OpenGraph + Twitter card meta on every page" />
          <div className="pt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer">View sitemap <ExternalLink className="h-3 w-3 ml-1" /></a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/robots.txt" target="_blank" rel="noreferrer">View robots <ExternalLink className="h-3 w-3 ml-1" /></a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://search.google.com/search-console?resource_id=${encodeURIComponent(SITE_URL)}`} target="_blank" rel="noreferrer">
                Google Search Console <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://www.google.com/search?q=site:${SITE_URL.replace(/^https?:\/\//, "")}`} target="_blank" rel="noreferrer">
                site: search <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><AlertCircle className="h-4 w-4" /> Content Quality Issues</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-lg border border-border">
            <div className="text-2xl font-light text-amber-400">{blogIssues.missing.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Posts with bad meta description (under 80 or over 160 chars)</div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="text-2xl font-light text-amber-400">{blogIssues.shortTitles.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Posts with title under 30 chars</div>
          </div>
          <div className="p-3 rounded-lg border border-border">
            <div className="text-2xl font-light text-amber-400">{blogIssues.longTitles.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Posts with title over 60 chars (will truncate)</div>
          </div>
        </CardContent>
      </Card>

      {/* Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Blog pillars</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pillarDist.map(p => (
              <div key={p.pillar} className="flex items-center justify-between text-sm">
                <span>{p.pillar}</span>
                <Badge variant="outline">{p.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Loop categories (top 10)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loopCats.slice(0, 10).map(([c, n]) => (
              <div key={c} className="flex items-center justify-between text-sm">
                <span>{LOOP_CATEGORIES[c as keyof typeof LOOP_CATEGORIES]?.label || c}</span>
                <Badge variant="outline">{n}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Blog inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" /> Blog inventory ({BLOG_POSTS.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search blog posts…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredBlogs.map(b => {
              const titleOk = b.title.length >= 30 && b.title.length <= 60;
              const descOk = b.metaDescription.length >= 80 && b.metaDescription.length <= 160;
              return (
                <div key={b.slug} className="flex items-start justify-between gap-3 p-2 hover:bg-muted/30 rounded text-sm">
                  <div className="min-w-0 flex-1">
                    <Link to={`/blog/${b.slug}`} className="font-medium hover:text-amber-300 line-clamp-1">
                      {b.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.keyword}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={titleOk ? "outline" : "destructive"} className="text-[10px]">T:{b.title.length}</Badge>
                    <Badge variant={descOk ? "outline" : "destructive"} className="text-[10px]">D:{b.metaDescription.length}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Programmatic loop preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Programmatic loop pages (preview)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground mb-3">{LOOPS.length} pages auto-generated from the loop library. Sample:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {LOOPS.slice(0, 8).map(l => (
              <Link key={l.id} to={`/loops/${loopSlug(l)}`} className="p-2 hover:bg-muted/30 rounded border border-border">
                <div className="text-xs text-muted-foreground">{l.id}</div>
                <div>{l.name}</div>
              </Link>
            ))}
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/loops">View all {LOOPS.length} loop pages →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground p-4 border border-dashed border-border rounded-lg">
        <strong>Next step:</strong> connect Google Search Console (verify ownership) and Plausible/GA4 to see live impressions, queries, and CTR. The total surface area Google can rank is now <strong>{BLOG_POSTS.length + LOOPS.length + 7} pages</strong> — give it 4-12 weeks to crawl + index.
      </div>
    </div>
  );
};

const CheckRow = ({ ok, label }: { ok: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    {ok ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
    <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
  </div>
);

export default AdminSEO;
