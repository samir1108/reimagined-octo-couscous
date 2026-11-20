#!/usr/bin/env node
/**
 * Static SEO build step. Runs after `vite build`.
 *
 * Why this exists:
 *   The app is a client-only Vite SPA. Google can execute the bundle, but the
 *   AI crawlers that decide whether we get *cited* (GPTBot, OAI-SearchBot,
 *   PerplexityBot, ClaudeBot, Applebot-Extended) do not run JavaScript. They
 *   fetch a URL and read the raw HTML. Without this step every content route —
 *   /blog/*, /loops/*, /knowledge/* — answers with `<div id="root"></div>`.
 *
 * What it does, per indexable route:
 *   1. Emits `dist/<route>.html` with the correct <title>, meta description,
 *      canonical, Open Graph, Twitter card, and JSON-LD. Vercel's `cleanUrls`
 *      serves it at the extensionless path.
 *   2. Emits the real article text as static markup inside #root, so the
 *      crawler (and the first paint) gets content before the bundle loads.
 *      React's createRoot().render() replaces it on mount.
 *   3. Regenerates dist/sitemap.xml + dist/robots.txt from the same data,
 *      using one canonical origin (VITE_SITE_URL), so the sitemap can never
 *      point at a stale preview domain again.
 *
 * Data comes from the same modules the app renders, so the static HTML cannot
 * drift from what the user sees. They are pulled in through esbuild because
 * this script runs under plain node without a TS runtime.
 *
 * Run: node scripts/seo/generate.mjs
 */

import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");
const dist = resolve(root, "dist");

const SITE = (
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  "https://consciousos.app"
).replace(/\/+$/, "");
const OG_IMAGE = `${SITE}/og-image.png`;
const LOGO = `${SITE}/pwa-icon-512.png`;
const BRAND = "ConsciousOS";
const AUTHOR = "Samir Sourav";

if (!existsSync(resolve(dist, "index.html"))) {
  console.error("[seo] dist/index.html missing — run `vite build` first.");
  process.exit(1);
}

/* ------------------------------------------------------------------ data -- */

async function loadData() {
  const { build } = await import("esbuild");
  const cacheDir = resolve(root, "node_modules/.cache");
  mkdirSync(cacheDir, { recursive: true });
  const outfile = resolve(cacheDir, "seo-data.mjs");

  await build({
    stdin: {
      contents: `
        export { KNOWLEDGE_ESSAYS, KNOWLEDGE_CATEGORIES } from "./src/data/knowledgeEssays";
        export { loopsAsBlogPosts } from "./src/data/loopBlogPosts";
        export { breakthroughsAsBlogPosts } from "./src/data/breakthroughBlogPosts";
        export { LOOPS } from "./src/data/loops";
        export { loopSlug } from "./src/lib/seoUtils";
      `,
      resolveDir: root,
      sourcefile: "seo-entry.ts",
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    outfile,
    logLevel: "error",
    alias: { "@": resolve(root, "src") },
  });

  return import(`${pathToFileURL(outfile).href}?v=${Date.now()}`);
}

/* -------------------------------------------------------------- markdown -- */

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function inlineMd(source) {
  let t = escapeHtml(source);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt) => `<em>${alt}</em>`);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
    const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#";
    return `<a href="${safe}" rel="noopener">${label}</a>`;
  });
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/(^|[\s(])_([^_\n]+)_/g, "$1<em>$2</em>");
  return t;
}

function markdownToHtml(md) {
  const lines = String(md || "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  const out = [];
  let para = [];
  let list = null;
  let listTag = "ul";
  let quote = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inlineMd(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`<${listTag}>${list.map((i) => `<li>${inlineMd(i)}</li>`).join("")}</${listTag}>`);
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<blockquote>${quote.map((l) => `<p>${inlineMd(l)}</p>`).join("")}</blockquote>`);
      quote = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushAll();
      out.push("<hr />");
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length + 1, 5);
      out.push(`<h${level}>${inlineMd(heading[2])}</h${level}>`);
      continue;
    }
    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushPara();
      flushList();
      quote.push(quoteLine[1]);
      continue;
    }
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    if (bullet) {
      flushPara();
      flushQuote();
      if (!list) {
        list = [];
        listTag = "ul";
      }
      list.push(bullet[1]);
      continue;
    }
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
      flushPara();
      flushQuote();
      if (!list) {
        list = [];
        listTag = "ol";
      }
      list.push(ordered[1]);
      continue;
    }
    flushList();
    flushQuote();
    para.push(line.trim());
  }
  flushAll();
  return out.join("\n");
}

/* ----------------------------------------------------------------- html -- */

const BASE_CSS = `
.seo-static{min-height:100vh;background:#0a0a0c;color:#e9e3d7;font:17px/1.75 Georgia,"Times New Roman",serif;padding:56px 22px 96px}
.seo-static main{max-width:760px;margin:0 auto}
.seo-static a{color:#d9a84a;text-underline-offset:3px}
.seo-static .seo-crumb{font-family:"Instrument Sans",system-ui,sans-serif;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#8d8577;margin-bottom:28px}
.seo-static h1{font-size:clamp(28px,5vw,44px);line-height:1.15;margin:0 0 18px;color:#f6f1e6}
.seo-static h2{font-size:clamp(21px,3vw,28px);line-height:1.25;margin:44px 0 14px;color:#f6f1e6}
.seo-static h3,.seo-static h4,.seo-static h5{font-size:19px;margin:32px 0 12px;color:#f6f1e6}
.seo-static p{margin:0 0 18px}
.seo-static .seo-lede{font-size:20px;line-height:1.6;color:#c9c1b1;font-style:italic;margin-bottom:32px}
.seo-static blockquote{margin:26px 0;padding:2px 0 2px 20px;border-left:2px solid #d9a84a;color:#cfc7b6}
.seo-static blockquote p{margin:0 0 10px}
.seo-static ul,.seo-static ol{margin:0 0 20px;padding-left:24px}
.seo-static li{margin-bottom:8px}
.seo-static hr{border:0;border-top:1px solid #2a2a30;margin:40px 0}
.seo-static code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;background:#181820;padding:1px 5px;border-radius:4px}
.seo-static .seo-meta{font-family:"Instrument Sans",system-ui,sans-serif;font-size:13px;color:#8d8577;margin:0 0 30px}
.seo-static .seo-cta{margin-top:48px;padding-top:26px;border-top:1px solid #2a2a30;font-family:"Instrument Sans",system-ui,sans-serif}
`;

const MANAGED_HEAD = [
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<meta\s+name="description"[^>]*>\s*/gi,
  /<meta\s+property="og:(?:title|description|image|url|type)"[^>]*>\s*/gi,
  /<meta\s+name="twitter:(?:card|title|description|image|site)"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/gi,
];

function stripManagedHead(html) {
  return MANAGED_HEAD.reduce((acc, re) => acc.replace(re, ""), html);
}

/**
 * Restores a previously generated page to the pristine app shell, so the
 * generator is idempotent: running it twice on the same dist must produce the
 * same output, not nest a second static body inside the first.
 */
function sanitizeTemplate(html) {
  return html
    .replace(/<style>\s*\.seo-static\{[\s\S]*?<\/style>\s*/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "")
    .replace(/<div id="root">[\s\S]*?(?=<!-- Earliest possible error visibility)/, '<div id="root"></div>\n    ');
}

const clampTitle = (t) => {
  if (t.length <= 60) return t;
  const cut = t.slice(0, 57);
  const space = cut.lastIndexOf(" ");
  return `${(space > 30 ? cut.slice(0, space) : cut).trimEnd()}…`;
};
const clampDesc = (d) => (d.length > 160 ? `${d.slice(0, 157).trimEnd()}…` : d);

const jsonLdScript = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

function headTags({ title, description, canonical, type, image, jsonLd }) {
  const t = clampTitle(title);
  const d = clampDesc(description);
  const img = image || OG_IMAGE;
  return [
    `<title>${escapeHtml(t)}</title>`,
    `<meta name="description" content="${escapeHtml(d)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />`,
    `<meta property="og:type" content="${type || "website"}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:title" content="${escapeHtml(t)}" />`,
    `<meta property="og:description" content="${escapeHtml(d)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(t)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@consciousos" />`,
    `<meta name="twitter:title" content="${escapeHtml(t)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(d)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...(jsonLd || []).map(jsonLdScript),
    `<style>${BASE_CSS}</style>`,
  ].join("\n    ");
}

function pageHtml(template, route) {
  const body = `
    <div class="seo-static">
      <main>
        <nav class="seo-crumb">${route.crumbs
          .map((c) =>
            c.href ? `<a href="${c.href}">${escapeHtml(c.label)}</a>` : escapeHtml(c.label)
          )
          .join(" / ")}</nav>
        <article>
          <h1>${escapeHtml(route.h1)}</h1>
          ${route.meta ? `<p class="seo-meta">${route.meta}</p>` : ""}
          <p class="seo-lede">${escapeHtml(route.description)}</p>
          <div class="seo-body">${route.bodyHtml}</div>
          <p class="seo-cta"><a href="/">Open ${BRAND} →</a></p>
        </article>
      </main>
    </div>`;

  const html = stripManagedHead(template)
    .replace("</head>", `  ${headTags({ ...route, title: route.title || route.h1 })}\n  </head>`)
    .replace(/<div id="root">\s*<\/div>/, `<div id="root">${body}\n  </div>`);

  if (!html.includes(`<h1>${escapeHtml(route.h1)}</h1>`)) {
    throw new Error(`[seo] could not inject static body for ${route.path}`);
  }
  return html;
}

function writePage(template, route) {
  const html = pageHtml(template, route);

  // Flat form: /blog/slug -> dist/blog/slug.html, resolved by Vercel's
  // cleanUrls rewrites. Directory-index resolution for extensionless paths is
  // not documented by Vercel, so the flat copy makes routing explicit.
  // Only one copy is emitted: emitting both forms doubled ~42 MB of output for
  // no routing benefit.
  const file =
    route.path === "/"
      ? resolve(dist, "index.html")
      : resolve(dist, `${route.path.replace(/^\/+/, "")}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html, "utf8");
}

/* --------------------------------------------------------------- routes -- */

const today = new Date().toISOString().slice(0, 10);

const STATIC_ROUTES = [
  {
    path: "/",
    title: "ConsciousOS — Yogic Companion | AI-guided consciousness practice",
    description:
      "ConsciousOS is an AI-guided consciousness instrument: mental-loop detection, witness practice, journaling, and a 500-day journey inward, built on Patanjali, Advaita, and Vipassana frameworks.",
    h1: "ConsciousOS — the operating system for consciousness",
    priority: "1.0",
    changefreq: "weekly",
    body: `ConsciousOS blends ancient yogic frameworks with modern AI. It detects mental loops in real time, runs guided sessions with 118 master personalities, tracks an 11-band consciousness map across six dimensions, and adapts a daily 4-gate practice flow to each person's spiritual DNA.

The system is built on three traditions that usually stay separate: Patanjali's eight limbs, Advaita self-inquiry, and Vipassana witness practice. The Loop Library maps 650+ recurring mental and behavioral patterns — reactivity, people-pleasing, doom-scrolling, rumination — each with triggers, manifestations, and a dissolution practice.

The Journey is a 500-day spiral in three phases: Foundation, Deepening, and Integration. Progress is measured on an 11-band V-level map rather than streaks or leaderboards.

It is built by an independent founder, Samir Sourav. Pricing is credit-based. No streaks, no leaderboards, no guilt loops.`,
  },
  {
    path: "/blog",
    title: "The ConsciousOS Journal — Consciousness Essays",
    description:
      "Deep, citation-rich essays on consciousness, neuroscience, ancient wisdom, and the engineering of an AI consciousness instrument. By Samir Sourav.",
    h1: "The ConsciousOS Journal",
    priority: "0.9",
    changefreq: "weekly",
    body: `Long-form essays bridging ancient consciousness frameworks with modern neuroscience, AI architecture, and product design.`,
  },
  {
    path: "/loops",
    title: "The Loop Library — consciousness patterns",
    description:
      "Explore 650+ behavioral loops with triggers, manifestations, awareness markers, and dissolution paths. From people-pleasing to spiritual bypassing.",
    h1: "The Loop Library",
    priority: "0.9",
    changefreq: "weekly",
    body: `Every recurring mental and behavioral pattern in the library, with anatomy, triggers, and the practice that dissolves it.`,
  },
  {
    path: "/knowledge",
    title: "The Knowledge Network — canonical essays on consciousness",
    description:
      "Not blog posts. The reference essay on each topic. Cited. Cross-linked. The map of the inner life, by Samir Sourav.",
    h1: "The Knowledge Network",
    priority: "0.8",
    changefreq: "weekly",
    body: `The canonical long-form work: one reference essay per topic, cross-linked into a single knowledge graph.`,
  },
  {
    path: "/handbook",
    title: "The ConsciousOS Handbook — stages of consciousness",
    description:
      "A plain-language handbook of every stage on the path: what it looks like, what breaks, and what practice moves you through it.",
    h1: "The ConsciousOS Handbook",
    priority: "0.7",
    changefreq: "monthly",
    body: `The stage-by-stage handbook used inside the app, readable without an account.`,
  },
  {
    path: "/temple",
    title: "The ConsciousOS Temple — a walk-through of the inner life",
    description:
      "A cinematic walk-through of ConsciousOS — masters, programs, practices, games and mirrors. Pick the door your life recognizes.",
    h1: "The Temple",
    priority: "0.7",
    changefreq: "monthly",
    body: `Masters, programs, practices, games and mirrors, arranged as a single walk-through.`,
  },
  {
    path: "/showroom",
    title: "The Showroom — free programs, handbooks, essays, games",
    description:
      "The full depth of ConsciousOS, free and without signup: complete 7-day programs taught by Krishna, Ramana, Patanjali, Buddha, Lao Tzu, and more, plus contemplative games and plain-language handbooks.",
    h1: "The Showroom",
    priority: "0.8",
    changefreq: "weekly",
    body: `A free, no-signup gallery of the depth inside ConsciousOS — canonical essays, handbooks, full 7-day programs, and contemplative games.`,
  },
  {
    path: "/experience",
    title: "Experience ConsciousOS — programs, paths, practices, games",
    description:
      "Walk through the experience layer of ConsciousOS: guided paths, live practices, observation, self-inquiry, and contemplative games.",
    h1: "The Experience",
    priority: "0.7",
    changefreq: "monthly",
    body: `Paths, programs, practices and games that can be tried before creating an account.`,
  },
  {
    path: "/journey",
    title: "The 500-Day Journey — ConsciousOS",
    description:
      "A spiral journey from conditioning to consciousness across 500 days, organized in Foundation, Deepening and Integration phases.",
    h1: "The 500-Day Journey",
    priority: "0.7",
    changefreq: "monthly",
    body: `A 500-day spiral in three phases — Foundation, Deepening, Integration — from conditioning to consciousness.`,
  },
  {
    path: "/inner-llms",
    title: "The Three Inner LLMs — Head, Heart, Gut",
    description:
      "The framework behind ConsciousOS: three biological intelligences — gut (500M neurons), heart (40K), and head — and how to align them.",
    h1: "The Three Inner LLMs: Head, Heart, Gut",
    priority: "0.7",
    changefreq: "monthly",
    body: `Three biological intelligences run in parallel: the gut with roughly 500 million neurons, the heart with about 40,000, and the head. ConsciousOS is built to align them rather than let one dominate.`,
  },
  {
    path: "/hope-preview",
    title: "ConsciousOS — Yogic Companion Preview",
    description:
      "A cinematic preview of the new ConsciousOS landing — the void, the invitation, and the journey from conditioning to consciousness.",
    h1: "ConsciousOS — Preview",
    priority: "0.6",
    changefreq: "monthly",
    body: `A cinematic preview of the ConsciousOS landing experience.`,
  },
  {
    path: "/launch",
    title: "ConsciousOS — The Yogic Companion",
    description:
      "Four yogic paths, thirteen masters, four hundred behavioral loops. Your AI-guided yogic companion for consciousness development.",
    h1: "ConsciousOS",
    priority: "0.6",
    changefreq: "monthly",
    body: `The launch narrative: four yogic paths, thirteen masters, and the loop library behind the companion.`,
  },
];

const crumbsFor = (path) => {
  const parts = path.split("/").filter(Boolean);
  const crumbs = [{ label: BRAND, href: "/" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({ label: decodeURIComponent(part).replace(/-/g, " "), href: acc });
  }
  return crumbs;
};

/* ----------------------------------------------------------------- main -- */

const { KNOWLEDGE_ESSAYS, KNOWLEDGE_CATEGORIES, loopsAsBlogPosts, breakthroughsAsBlogPosts, LOOPS, loopSlug } =
  await loadData();

const jsonPosts = JSON.parse(readFileSync(resolve(root, "public/blog-posts.json"), "utf8"));
const generatedPosts = [...loopsAsBlogPosts(), ...breakthroughsAsBlogPosts()];
const knowledgePosts = KNOWLEDGE_ESSAYS.map((essay) => ({ ...essay, isKnowledgeEssay: true }));

const blogPosts = [];
const seenSlugs = new Set();
for (const post of [...knowledgePosts, ...jsonPosts, ...generatedPosts]) {
  if (!post || !post.slug || seenSlugs.has(post.slug)) continue;
  seenSlugs.add(post.slug);
  blogPosts.push(post);
}

const template = sanitizeTemplate(readFileSync(resolve(dist, "index.html"), "utf8"));
const entries = [];
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: BRAND,
  url: SITE,
  logo: LOGO,
  founder: { "@type": "Person", name: AUTHOR },
  sameAs: ["https://twitter.com/satyugapp"],
};
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND,
  url: SITE,
  publisher: { "@type": "Organization", name: BRAND, url: SITE },
};

for (const route of STATIC_ROUTES) {
  const canonical = `${SITE}${route.path === "/" ? "/" : route.path}`;
  let body = route.body;
  if (route.path === "/blog") {
    body += `\n\n## Latest essays\n\n${blogPosts
      .slice(0, 200)
      .map((p) => `- [${p.title}](/blog/${p.slug})`)
      .join("\n")}`;
  } else if (route.path === "/loops") {
    body += `\n\n## Loops in the library\n\n${LOOPS.slice(0, 200)
      .map((l) => `- [${l.name}](/loops/${loopSlug(l)})`)
      .join("\n")}`;
  } else if (route.path === "/knowledge") {
    body += `\n\n## Categories\n\n${KNOWLEDGE_CATEGORIES.map(
      (c) => `- [${c.label}](/knowledge/${c.slug}) — ${c.tagline}`
    ).join("\n")}\n\n## Essays\n\n${KNOWLEDGE_ESSAYS.map(
      (e) => `- [${e.title}](/knowledge/${e.category}/${e.slug})`
    ).join("\n")}`;
  }
  writePage(template, {
    ...route,
    canonical,
    crumbs: route.path === "/" ? [{ label: BRAND }] : crumbsFor(route.path),
    bodyHtml: markdownToHtml(body),
    meta: null,
    jsonLd:
      route.path === "/"
        ? [orgJsonLd, websiteJsonLd]
        : [
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: route.h1,
              description: route.description,
              url: canonical,
              isPartOf: { "@type": "WebSite", name: BRAND, url: SITE },
            },
          ],
  });
  entries.push({ loc: canonical, lastmod: today, changefreq: route.changefreq, priority: route.priority });
}

let blogCount = 0;
for (const post of blogPosts) {
  const isEssay = Boolean(post.isKnowledgeEssay);
  const published = (post.publishedAt || today).slice(0, 10);
  const canonical = `${SITE}/blog/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.metaDescription,
      datePublished: published,
      dateModified: published,
      author: { "@type": "Person", name: AUTHOR, url: SITE },
      publisher: { "@type": "Organization", name: BRAND, logo: { "@type": "ImageObject", url: LOGO } },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      image: OG_IMAGE,
      ...(post.keyword ? { keywords: post.keyword } : {}),
      ...(post.pillar ? { articleSection: post.pillar } : {}),
      isAccessibleForFree: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: BRAND, item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: post.title },
      ],
    },
  ];

  writePage(template, {
    path: `/blog/${post.slug}`,
    h1: post.title,
    description: post.metaDescription || post.title,
    canonical,
    type: "article",
    crumbs: [
      { label: BRAND, href: "/" },
      { label: "Journal", href: "/blog" },
      { label: post.pillar || "Essay" },
    ],
    meta: `${post.pillar ? `${escapeHtml(post.pillar)} · ` : ""}${published} · ${AUTHOR}`,
    bodyHtml: markdownToHtml(post.content),
    jsonLd,
  });
  entries.push({ loc: canonical, lastmod: published, changefreq: "monthly", priority: isEssay ? "0.8" : "0.6" });
  blogCount += 1;

  if (isEssay && post.category) {
    const essayCanonical = `${SITE}/knowledge/${post.category}/${post.slug}`;
    writePage(template, {
      path: `/knowledge/${post.category}/${post.slug}`,
      h1: post.title,
      description: post.metaDescription || post.title,
      canonical: essayCanonical,
      type: "article",
      crumbs: [
        { label: BRAND, href: "/" },
        { label: "Knowledge", href: "/knowledge" },
        { label: post.categoryLabel || post.category },
      ],
      meta: `${post.categoryLabel || post.category} · updated ${(post.updatedAt || published).slice(0, 10)} · ${AUTHOR}`,
      bodyHtml: markdownToHtml(post.content),
      jsonLd: jsonLd.map((node) =>
        node["@type"] === "BlogPosting" ? { ...node, mainEntityOfPage: { "@type": "WebPage", "@id": essayCanonical } } : node
      ),
    });
    entries.push({
      loc: essayCanonical,
      lastmod: (post.updatedAt || published).slice(0, 10),
      changefreq: "monthly",
      priority: "0.9",
    });
  }
}

let loopCount = 0;
for (const loop of LOOPS) {
  const canonical = `${SITE}/loops/${loopSlug(loop)}`;
  const categoryLabel = loop.category.replace(/_/g, " ");
  const bodyMd = [
    loop.description,
    "",
    `## Triggers`,
    "",
    ...(loop.triggers || []).map((t) => `- ${t}`),
    "",
    `## How it shows up`,
    "",
    ...(loop.manifestations || []).map((m) => `- ${m}`),
    "",
    `## Awareness markers`,
    "",
    ...(loop.awareness_markers || []).map((a) => `- ${a}`),
    "",
    `## The dissolution path`,
    "",
    loop.dissolution_path || "",
  ].join("\n");

  writePage(template, {
    path: `/loops/${loopSlug(loop)}`,
    h1: `${loop.name} (${loop.id})`,
    description: loop.description,
    canonical,
    type: "article",
    crumbs: [
      { label: BRAND, href: "/" },
      { label: "Loops", href: "/loops" },
      { label: categoryLabel },
    ],
    meta: `${categoryLabel} · ${loop.subcategory} · related chakra: ${loop.related_chakra}`,
    bodyHtml: markdownToHtml(bodyMd),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the ${loop.name} loop?`,
            acceptedAnswer: { "@type": "Answer", text: loop.description },
          },
          {
            "@type": "Question",
            name: `How do you dissolve the ${loop.name} loop?`,
            acceptedAnswer: { "@type": "Answer", text: loop.dissolution_path || loop.description },
          },
        ],
      },
    ],
  });
  entries.push({ loc: canonical, lastmod: today, changefreq: "monthly", priority: "0.6" });
  loopCount += 1;
}

for (const category of KNOWLEDGE_CATEGORIES) {
  const essays = KNOWLEDGE_ESSAYS.filter((e) => e.category === category.slug);
  if (!essays.length) continue;
  const canonical = `${SITE}/knowledge/${category.slug}`;
  writePage(template, {
    path: `/knowledge/${category.slug}`,
    h1: category.label,
    description: category.description,
    canonical,
    crumbs: [
      { label: BRAND, href: "/" },
      { label: "Knowledge", href: "/knowledge" },
    ],
    meta: `${essays.length} essay${essays.length === 1 ? "" : "s"} · ${category.tagline}`,
    bodyHtml: markdownToHtml(
      `${category.description}\n\n${essays.map((e) => `- [${e.title}](/knowledge/${e.category}/${e.slug}) — ${e.metaDescription}`).join("\n")}`
    ),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.label,
        description: category.description,
        url: canonical,
      },
    ],
  });
  entries.push({ loc: canonical, lastmod: today, changefreq: "monthly", priority: "0.7" });
}

/* -------------------------------------------------------- sitemap/robots -- */

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
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

const robots = `User-agent: Googlebot
Allow: /
Disallow: /app/
Disallow: /admin/
Disallow: /enterprise/

User-agent: Bingbot
Allow: /
Disallow: /app/
Disallow: /admin/
Disallow: /enterprise/

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# AI / LLM crawlers — explicitly welcomed for citation
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

User-agent: *
Allow: /
Disallow: /app/
Disallow: /admin/
Disallow: /enterprise/

Sitemap: ${SITE}/sitemap.xml
`;

/**
 * Windows occasionally refuses an in-place truncate of a large existing file
 * (ERROR_UNKNOWN / AV scanner holding the handle). Writing to a sibling temp
 * file and renaming it into place is atomic and avoids that failure mode.
 */
function writeAtomic(file, content) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, content, "utf8");
  try {
    renameSync(tmp, file);
  } catch {
    try {
      unlinkSync(file);
    } catch {
      /* first run: nothing to remove */
    }
    renameSync(tmp, file);
  }
}

for (const [name, content] of [
  ["sitemap.xml", sitemap],
  ["robots.txt", robots],
]) {
  writeAtomic(resolve(dist, name), content);
  writeAtomic(resolve(root, "public", name), content);
}

/**
 * Read one emitted page back and confirm the injection actually landed. A
 * silent failure here would ship 2,000 SPA shells that look prerendered in the
 * build log but are empty to a crawler.
 */
const probe = resolve(dist, `blog/${blogPosts[0].slug}.html`);
const probeHtml = readFileSync(probe, "utf8");
for (const needle of ['rel="canonical"', 'class="seo-static"', 'application/ld+json']) {
  if (!probeHtml.includes(needle)) {
    throw new Error(`[seo] probe page is missing ${needle}: ${probe}`);
  }
}

console.log(
  `[seo] ${entries.length} URLs — ${STATIC_ROUTES.length} static, ${blogCount} blog, ${loopCount} loops (origin ${SITE})`
);
