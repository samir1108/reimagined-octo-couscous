#!/usr/bin/env node
/**
 * Push public/ landing media to the Supabase CDN.
 *
 * The landing page ships ~30 MB of imagery and video inside public/,
 * which Vercel serves from the app origin. Moving it to Supabase means:
 *   - The 9.5 MB orb.mp4 is served from the edge with immutable caching
 *     instead of the app origin, and the deploy gets 30 MB lighter.
 *   - The 22 MB of landing PNGs can be pulled through the WebP transform,
 *     which cuts them to roughly a third of their size.
 *
 * Unlike the bundled images (scripts/push-images-to-cdn.mjs), these files
 * are referenced by literal URL path in source, so this script rewrites
 * the public/ directory in place to point at the CDN and records the
 * mapping in src/lib/media/cdn-public.json.
 *
 * Usage:
 *   node scripts/push-public-to-cdn.mjs --dry-run
 *   node scripts/push-public-to-cdn.mjs --apply
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname, relative, extname, basename } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUB = join(ROOT, "public");
const MANIFEST = join(ROOT, "src", "lib", "media", "cdn-public.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);

const env = {};
for (const line of readFileSync(join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const BASE = (env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE || !KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}
const AUTH = { Authorization: `Bearer ${KEY}`, apikey: KEY };

const BUCKET = "media";
const DRY = flag("dry-run");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".json": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

// Everything in public/ that is large enough to be worth offloading.
// The threshold matches the bundled-image script so the two stay consistent.
const MIN_SIZE = 40 * 1024;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Content hash, so a changed file is re-uploaded even under the same name. */
function hashFile(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 16);
}

async function upload(objectPath, file) {
  const body = readFileSync(file);
  const contentType = MIME[extname(file).toLowerCase()] || "application/octet-stream";
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      ...AUTH,
      "Content-Type": contentType,
      "cache-control": "max-age=31536000, immutable",
      "x-upsert": "true",
    },
    body,
  });
  if (!res.ok) throw new Error(`upload ${objectPath}: ${res.status} ${await res.text()}`);
  return res.json();
}

const files = walk(PUB)
  .map((f) => ({ f, size: statSync(f).size, rel: relative(PUB, f).replace(/\\/g, "/") }))
  .filter((x) => x.size >= MIN_SIZE)
  .sort((a, b) => b.size - a.size);

console.log("=== public/ → Supabase CDN ===");
console.log(`  bucket:   ${BUCKET}`);
console.log(`  min size: ${MIN_SIZE} bytes`);
console.log(`  mode:     ${DRY ? "dry-run" : "apply"}`);
console.log(`  files:    ${files.length}\n`);

let manifest = { version: 1, bucket: BUCKET, base_url: BASE, assets: {} };
if (existsSync(MANIFEST)) {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, "utf8"));
    if (parsed?.assets) manifest = parsed;
  } catch { /* rebuild */ }
}

let uploaded = 0;
let skipped = 0;
let failed = 0;

for (const { f, size, rel } of files) {
  const objectPath = `public/${rel}`;

  // Re-upload when the local file has changed since it was last uploaded.
  // The manifest records the size, and content-derived files (like the
  // generated asset-manifest.json) change without changing name.
  const existing = manifest.assets[rel];
  if (existing && existing.size === size && existing.local_hash) {
    const currentHash = hashFile(f);
    if (currentHash === existing.local_hash) {
      skipped++;
      continue;
    }
  }
  if (DRY) {
    console.log(`  would upload ${String(Math.round(size / 1024)).padStart(6)} KB  ${rel}`);
    continue;
  }
  try {
    await upload(objectPath, f);
    manifest.assets[rel] = {
      storage_path: objectPath,
      url: `${BASE}/storage/v1/object/public/${BUCKET}/${objectPath}`,
      render_url: `${BASE}/storage/v1/render/image/public/${BUCKET}/${objectPath}`,
      size,
      local_hash: hashFile(f),
      uploaded_at: new Date().toISOString(),
    };
    uploaded++;
    console.log(`  ✓ ${String(Math.round(size / 1024)).padStart(6)} KB  ${rel}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${rel}  ${e.message}`);
  }
}

if (!DRY) {
  manifest.updated_at = new Date().toISOString();
  manifest.total = Object.keys(manifest.assets).length;
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n  manifest updated: ${manifest.total} assets`);
}
console.log(`  uploaded ${uploaded}, skipped ${skipped}, failed ${failed}`);
if (failed > 0) process.exit(1);
