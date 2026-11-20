#!/usr/bin/env node
/**
 * Migrate every media pointer off the old Lovable CDN and onto OUR OWN
 * Supabase Storage bucket.
 *
 * For each *.asset.json that still points at lovable.app:
 *   1. download the original (cached under media-cache/ so re-runs are free)
 *   2. upload it to the `media` bucket at its original repo path
 *   3. rewrite the pointer to the public Supabase URL and record storage_path
 *   4. verify the public URL actually serves the file
 *
 * The script is resumable: anything already pointing at the target base URL
 * is skipped, so it can be interrupted and re-run at will.
 *
 * Usage:
 *   node scripts/migrate-cdn-to-supabase.mjs                       # everything
 *   node scripts/migrate-cdn-to-supabase.mjs --filter videos/      # only videos
 *   node scripts/migrate-cdn-to-supabase.mjs --filter videos/ --limit 12
 *   node scripts/migrate-cdn-to-supabase.mjs --dry-run
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, createWriteStream, unlinkSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const flag = (name) => argv.includes(`--${name}`);

const DRY_RUN = flag("dry-run");
const FILTER = arg("filter", null);
const LIMIT = Number(arg("limit", "0")) || 0;
const BUCKET = arg("bucket", "media");
const CACHE_DIR = join(ROOT, "media-cache");

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
const PUBLIC_BASE = `${BASE}/storage/v1/object/public/${BUCKET}`;

const MB = (bytes) => `${(bytes / 1048576).toFixed(1)}MB`;

/* ------------------------------------------------------------------ scan */

function collectAssetPointers(dir, out = []) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      collectAssetPointers(full, out);
      continue;
    }
    if (!entry.endsWith(".asset.json")) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(full, "utf8"));
    } catch {
      continue;
    }
    if (typeof json.url !== "string" || !json.url) continue;
    out.push({ file: full, json });
  }
  return out;
}

const pointers = collectAssetPointers(join(ROOT, "src", "assets"));
const remote = pointers.filter((p) => p.json.url.includes("lovable.app"));
const REUPLOAD = flag("reupload");
const pending = remote.filter((p) => {
  if (!FILTER) return true;
  return relative(ROOT, p.file).replace(/\\/g, "/").includes(FILTER);
});

// --reupload: also revisit files that are already migrated, to refresh
// cache headers on objects that are already in the bucket.
const migrated = REUPLOAD
  ? pointers.filter((p) => p.json.storage_path && (!FILTER || relative(ROOT, p.file).replace(/\\/g, "/").includes(FILTER)))
  : [];

const todo = LIMIT ? [...pending, ...migrated].slice(0, LIMIT) : [...pending, ...migrated];
const already = pointers.length - remote.length;

console.log("=== Lovable CDN -> our Supabase Storage ===");
console.log(`project : ${BASE}`);
console.log(`bucket  : ${BUCKET}`);
console.log(`public  : ${PUBLIC_BASE}`);
console.log(`pointers total ${pointers.length} | already off-CDN ${already} | on CDN ${remote.length}`);
if (FILTER) console.log(`filter "${FILTER}" -> ${pending.length} of ${remote.length}`);
if (REUPLOAD) console.log(`reupload -> +${migrated.length} already-migrated object(s)`);
console.log(`to migrate now: ${todo.length}\n`);

if (DRY_RUN) {
  todo.forEach((p) => console.log("  would migrate", relative(ROOT, p.file), MB(p.json.size || 0)));
  process.exit(0);
}

/* --------------------------------------------------------------- helpers */

async function ensureBucket() {
  const res = await fetch(`${BASE}/storage/v1/bucket`, { headers: AUTH });
  const buckets = await res.json();
  if (Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET)) {
    console.log(`✓ bucket "${BUCKET}" exists`);
    return;
  }
  const create = await fetch(`${BASE}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...AUTH, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!create.ok) {
    const text = await create.text();
    console.error(`✗ could not create bucket: ${create.status} ${text}`);
    process.exit(1);
  }
  console.log(`✓ created public bucket "${BUCKET}"`);
}

async function download(url, target) {
  mkdirSync(dirname(target), { recursive: true });
  const res = await fetch(url, { headers: AUTH });
  if (!res.ok) throw new Error(`download ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));
  return statSync(target).size;
}

async function upload(localPath, storagePath, contentType) {
  const res = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: "POST",
    headers: {
      ...AUTH,
      "Content-Type": contentType,
      // Media filenames are immutable, so let the browser and the edge hold them.
      // Supabase expects the `max-age=<seconds>` form.
      "cache-control": "max-age=31536000",
      "x-upsert": "true",
    },
    body: readFileSync(localPath),
  });
  if (!res.ok) throw new Error(`upload ${res.status} ${await res.text()}`);
}

function contentTypeFor(file) {
  if (file.endsWith(".mp4")) return "video/mp4";
  if (file.endsWith(".webm")) return "video/webm";
  if (file.endsWith(".mov")) return "video/quicktime";
  if (file.endsWith(".mp3")) return "audio/mpeg";
  if (file.endsWith(".wav")) return "audio/wav";
  if (file.endsWith(".ogg")) return "audio/ogg";
  if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".svg")) return "image/svg+xml";
  if (file.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

/**
 * The bucket's per-object limit is fixed by the project plan (50 MB here).
 * Anything bigger gets re-encoded once, hard enough to fit, and the re-encoded
 * file is what ships. Web delivery gets faster, not slower.
 */
const OBJECT_LIMIT = 45 * 1024 * 1024;

async function transcodeToFit(input, output) {
  const attempts = [
    { crf: "26", maxrate: "3200k", preset: "slow" },
    { crf: "28", maxrate: "2400k", preset: "slow" },
    { crf: "30", maxrate: "1600k", preset: "veryfast" },
  ];
  for (const attempt of attempts) {
    await exec("ffmpeg", [
      "-y", "-i", input,
      "-c:v", "libx264", "-profile:v", "high", "-preset", attempt.preset,
      "-crf", attempt.crf, "-maxrate", attempt.maxrate, "-bufsize", "9000k",
      "-vf", "scale='min(1920,iw)':-2",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      output,
    ], { maxBuffer: 1024 * 1024 * 64 });
    const size = statSync(output).size;
    if (size <= OBJECT_LIMIT) return size;
  }
  throw new Error("could not compress under the object limit");
}

async function prepareLocal(localCache, storagePath) {
  let size = statSync(localCache).size;
  let transcoded = false;

  if (size > OBJECT_LIMIT && /\.mp4$/i.test(storagePath)) {
    const shrunk = `${localCache}.fit.mp4`;
    process.stdout.write("transcoding… ");
    size = await transcodeToFit(localCache, shrunk);
    transcoded = true;
    return { path: shrunk, size, transcoded };
  }

  if (size > OBJECT_LIMIT) {
    throw new Error(`object ${(size / 1048576).toFixed(1)}MB exceeds the bucket limit and is not re-encodable`);
  }

  return { path: localCache, size, transcoded };
}

/* ------------------------------------------------------------------ run */

await ensureBucket();

let ok = 0;
let failed = 0;
let uploadedBytes = 0;
const failures = [];
const manifestRows = [];

for (let i = 0; i < todo.length; i += 1) {
  const { file, json } = todo[i];
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  // src/assets/film/scene1.mp4.asset.json -> src/assets/film/scene1.mp4
  const storagePath = rel.replace(/\.asset\.json$/, "");
  const localCache = join(CACHE_DIR, storagePath.replace(/\//g, sep));
  const publicUrl = `${PUBLIC_BASE}/${storagePath}`;

  const label = `[${String(i + 1).padStart(3)}/${todo.length}] ${storagePath}`;

  try {
    if (!existsSync(localCache)) {
      process.stdout.write(`${label} downloading… `);
      await download(json.url, localCache);
    } else {
      process.stdout.write(`${label} cached `);
    }

    const prepared = await prepareLocal(localCache, storagePath);
    const size = prepared.size;

    await upload(prepared.path, storagePath, contentTypeFor(storagePath));

    const verify = await fetch(publicUrl, { method: "HEAD" });
    if (!verify.ok) throw new Error(`verify ${verify.status}`);

    const next = {
      ...json,
      bucket: BUCKET,
      storage_path: storagePath,
      url: publicUrl,
      size,
      migrated_at: new Date().toISOString(),
      migrated_from: json.migrated_from || json.url,
    };
    if (prepared.transcoded) next.transcoded = true;
    writeFileSync(file, JSON.stringify(next, null, 2) + "\n");

    manifestRows.push({ path: storagePath, size, mime: contentTypeFor(storagePath) });
    uploadedBytes += size;
    ok += 1;
    console.log(`✓ ${MB(size)}`);
  } catch (err) {
    failed += 1;
    failures.push({ file: rel, error: String(err.message || err) });
    console.log(`✗ ${String(err.message || err)}`);
    if (/quota|exceeded|413|402/i.test(String(err.message || err))) {
      console.log("\n⛔ storage quota reached — stopping. Re-run after freeing space.");
      break;
    }
  }
}

console.log(`\n=== done ===`);
console.log(`migrated ${ok} | failed ${failed} | ${MB(uploadedBytes)} uploaded`);
if (failures.length) {
  console.log("failures:");
  failures.forEach((f) => console.log(`  - ${f.file}: ${f.error}`));
}

// Keep the repo manifest in step with what now lives in the bucket.
if (manifestRows.length) {
  const manifestPath = join(ROOT, "supabase", "manifests", "storage-media.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const known = new Set((manifest.objects || []).map((o) => o.path));
    let added = 0;
    for (const row of manifestRows) {
      if (known.has(row.path)) continue;
      manifest.objects.push({ path: row.path, size: row.size, mime: row.mime, etag: null });
      added += 1;
    }
    manifest.bucket = BUCKET;
    manifest.base_url = BASE;
    manifest.updated_at = new Date().toISOString();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`manifest: +${added} object(s) -> ${relative(ROOT, manifestPath)}`);
  }
}
