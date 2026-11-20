#!/usr/bin/env node
/**
 * Generates public/sitemap.xml from blog posts + loop library + static routes.
 * Run: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SITE = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://consciousos.app").replace(/\/+$/, "");
const today = new Date().toISOString().slice(0, 10);

/**
 * Blogs.
 *
 * The canonical copy lives in Supabase Storage (see
 * scripts/push-public-to-cdn.mjs) and the local public/ copy is pruned
 * from the repo, so fall back to the CDN when the file is not on disk.
 */
async function loadBlogs() {
  const local = resolve(root, "public/blog-posts.json");
  if (existsSync(local)) {
    return JSON.parse(readFileSync(local, "utf8"));
  }
  const manifestPath = resolve(root, "src/lib/media/cdn-public.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entry = manifest.assets?.["blog-posts.json"];
  if (!entry) throw new Error("blog-posts.json not found locally and not on the CDN");
  const res = await fetch(entry.url);
  if (!res.ok) throw new Error(`failed to fetch blog-posts.json: ${res.status}`);
  return res.json();
}

const blogs = await loadBlogs();

// Loops — parse loops.ts via regex (avoids needing TS runtime)
const loopsFile = readFileSync(resolve(root, "src/data/loops.ts"), "utf8");
const loopRegex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)"/g;
const loops = [];
let m;
while ((m = loopRegex.exec(loopsFile)) !== null) {
  loops.push({ id: m[1], name: m[2] });
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const loopSlug = (l) => `${slugify(l.name)}-${l.id.toLowerCase()}`;

// Generated breakthroughs — parse breakthroughs.generated.ts via regex (avoids needing TS runtime)
const btFile = readFileSync(resolve(root, "src/data/breakthroughs.generated.ts"), "utf8");
const btRegex = /\{\s*id:\s*"(BTG[^"]+)",\s*name:\s*"([^"]+)"/g;
const breakthroughs = [];
let b;
while ((b = btRegex.exec(btFile)) !== null) {
  breakthroughs.push({ id: b[1], name: b[2] });
}
const btSlug = (t) => `breakthrough-${slugify(t.name)}-${t.id.toLowerCase()}`;

// Static high-value routes
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "weekly" },
  { path: "/loops", priority: "0.9", changefreq: "weekly" },
  { path: "/auth", priority: "0.6", changefreq: "monthly" },
  { path: "/inner-llms", priority: "0.7", changefreq: "monthly" },
  { path: "/journey", priority: "0.7", changefreq: "monthly" },
  { path: "/enterprise/auth", priority: "0.5", changefreq: "monthly" },
  { path: "/hope-preview", priority: "0.7", changefreq: "weekly" },
];

const urls = [
  ...staticRoutes.map((r) => ({
    loc: `${SITE}${r.path}`,
    changefreq: r.changefreq,
    priority: r.priority,
    lastmod: today,
  })),
  ...blogs.map((b) => ({
    loc: `${SITE}/blog/${b.slug}`,
    changefreq: "monthly",
    priority: "0.7",
    lastmod: b.publishedAt || today,
  })),
  ...loops.map((l) => ({
    loc: `${SITE}/loops/${loopSlug(l)}`,
    changefreq: "monthly",
    priority: "0.6",
    lastmod: today,
  })),
  ...breakthroughs.map((t) => ({
    loc: `${SITE}/blog/${btSlug(t)}`,
    changefreq: "monthly",
    priority: "0.5",
    lastmod: today,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync(resolve(root, "public/sitemap.xml"), xml, "utf8");
console.log(`✓ Wrote sitemap.xml with ${urls.length} URLs (${blogs.length} blogs + ${loops.length} loops + ${breakthroughs.length} breakthroughs + ${staticRoutes.length} static)`);
