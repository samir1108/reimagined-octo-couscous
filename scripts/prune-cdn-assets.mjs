#!/usr/bin/env node
/**
 * Remove files from public/ that are already served from the Supabase CDN.
 *
 * scripts/push-public-to-cdn.mjs uploads the large public/ files to the
 * `media` bucket and records them in src/lib/media/cdn-public.json. The
 * source references them through publicAssetUrl(), so the app never fetches
 * the local copy — but Vite still copies the whole public/ directory into
 * dist, which bloats the deploy.
 *
 * This script deletes the offloaded originals from public/ once they are
 * confirmed on the CDN. The local copy stays in git history, so it can be
 * restored by re-running the upload script.
 *
 * Usage:
 *   node scripts/prune-cdn-assets.mjs --dry-run
 *   node scripts/prune-cdn-assets.mjs --apply
 */
import { readFileSync, writeFileSync, existsSync, statSync, unlinkSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const MANIFEST = join(ROOT, "src", "lib", "media", "cdn-public.json");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");

// These must stay in public/: they are referenced by index.html, the PWA
// manifest, robots.txt, or the admin SEO page, and browsers fetch them
// outside the app's JS.
const KEEP = new Set([
  "pwa-icon-192.png",
  "pwa-icon-512.png",
  "pwa-icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon.ico",
  "favicon.png",
  "manifest.webmanifest",
  "robots.txt",
  // Referenced by src/pages/admin/AdminSEO.tsx and robots.txt. Sitemaps must
  // live at the site root to be discoverable.
  "sitemap.xml",
]);

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const assets = manifest.assets || {};

console.log("=== Prune CDN-offloaded public assets ===");
console.log(`  mode: ${APPLY ? "apply" : "dry-run"}\n`);

let removed = 0;
let bytes = 0;
let kept = 0;

for (const rel of Object.keys(assets)) {
  if (KEEP.has(rel)) {
    kept++;
    console.log(`  keep  ${rel}  (referenced by index.html / manifest)`);
    continue;
  }
  const local = join(PUB, rel);
  if (!existsSync(local)) {
    console.log(`  skip  ${rel}  (already removed)`);
    continue;
  }
  const size = statSync(local).size;
  bytes += size;
  if (APPLY) {
    unlinkSync(local);
    // Clean up now-empty parent directories.
    let dir = dirname(local);
    while (dir.startsWith(PUB) && dir !== PUB) {
      try {
        rmSync(dir, { recursive: false });
      } catch {
        break;
      }
      dir = dirname(dir);
    }
  }
  removed++;
  console.log(
    `  ${APPLY ? "removed" : "would remove"}  ${String(Math.round(size / 1024)).padStart(6)} KB  ${rel}`
  );
}

console.log(
  `\n  ${removed} files, ${Math.round(bytes / 1024 / 1024 * 100) / 100} MB  |  kept ${kept}`
);
if (!APPLY) console.log("  (run with --apply to delete)");
