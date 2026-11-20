#!/usr/bin/env node
/**
 * Push local images to Supabase Storage so they are served from the CDN
 * with edge caching, instead of being bundled into dist/assets and
 * shipped from the app origin.
 *
 * Why:
 *   - The bundle currently carries ~22 MB of imagery, including a 2.3 MB
 *     PNG (the-elder) that is only needed inside onboarding.
 *   - Supabase's image transform endpoint turns that 2.3 MB PNG into a
 *     ~30 kB WebP at the width the UI actually renders.
 *   - Bucket objects are served with `public, max-age=31536000` from the
 *     edge (see scripts/set-bucket-cache.mjs), so repeat views cost zero
 *     origin traffic.
 *
 * Writes src/lib/media/cdn-images.json mapping each local asset path to
 * its CDN URL. The Vite plugin in vite.config.ts reads that manifest and
 * rewrites matching image imports to the CDN URL at build time, so no
 * source file needs to change.
 *
 * Usage:
 *   node scripts/push-images-to-cdn.mjs --dry-run
 *   node scripts/push-images-to-cdn.mjs --min-size 40000
 *   node scripts/push-images-to-cdn.mjs --only the-elder
 */
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, relative, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const MANIFEST = join(SRC, "lib", "media", "cdn-images.json");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? d : argv[i + 1];
};

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
const MIN_SIZE = Number(opt("min-size", "40000"));
const ONLY = opt("only", null);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (IMAGE_EXT.has(extname(full).toLowerCase())) out.push(full);
  }
  return out;
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

// Load any existing manifest so repeated runs are incremental.
let manifest = { version: 1, bucket: BUCKET, base_url: BASE, images: {} };
if (existsSync(MANIFEST)) {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, "utf8"));
    if (parsed && parsed.images) manifest = parsed;
  } catch {
    /* rebuild from scratch */
  }
}

const files = walk(SRC)
  .map((f) => ({ f, size: statSync(f).size }))
  .filter((x) => x.size >= MIN_SIZE)
  .filter((x) => (ONLY ? basename(x.f).includes(ONLY) : true))
  .sort((a, b) => b.size - a.size);

console.log("=== Image → Supabase CDN ===");
console.log(`  bucket:   ${BUCKET}`);
console.log(`  min size: ${MIN_SIZE} bytes`);
console.log(`  mode:     ${DRY ? "dry-run" : "apply"}`);
console.log(`  manifest: ${relative(ROOT, MANIFEST)}`);
console.log(`  files:    ${files.length}\n`);

let uploaded = 0;
let skipped = 0;
let failed = 0;
let bytes = 0;

for (const { f, size } of files) {
  const rel = relative(SRC, f).replace(/\\/g, "/");
  const objectPath = `src/assets/${rel}`;

  if (manifest.images[rel]) {
    skipped++;
    continue;
  }

  bytes += size;
  if (DRY) {
    console.log(`  would upload ${String(Math.round(size / 1024)).padStart(6)} KB  ${rel}`);
    continue;
  }

  try {
    await upload(objectPath, f);
    manifest.images[rel] = {
      storage_path: objectPath,
      url: `${BASE}/storage/v1/object/public/${BUCKET}/${objectPath}`,
      render_url: `${BASE}/storage/v1/render/image/public/${BUCKET}/${objectPath}`,
      size,
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
  manifest.total = Object.keys(manifest.images).length;
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n  manifest updated: ${manifest.total} images`);
}

console.log(
  `  uploaded ${uploaded}, skipped (already on CDN) ${skipped}, failed ${failed}, ` +
    `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`
);
if (failed > 0) process.exit(1);
