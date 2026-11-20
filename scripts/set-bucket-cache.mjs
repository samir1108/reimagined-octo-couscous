#!/usr/bin/env node
/**
 * Set edge-cache headers on the Supabase Storage buckets that serve media.
 *
 * Why this matters: Supabase's default object response is
 *   Cache-Control: private, no-cache
 * which forces the browser to revalidate every media file on every visit
 * AND stops the Supabase edge from serving it from cache. For immutable,
 * content-addressed media (films, audio, stills) that is pure waste.
 *
 * The bucket-level `cacheConfig.cacheControl` sets the default for every
 * object in the bucket. Objects already uploaded keep whatever per-object
 * header they were given, so we also re-stamp them (see --reupload).
 *
 * Usage:
 *   node scripts/set-bucket-cache.mjs                 # apply bucket defaults
 *   node scripts/set-bucket-cache.mjs --reupload      # also re-stamp objects
 *   node scripts/set-bucket-cache.mjs --dry-run
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

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

/**
 * One year, immutable. Media filenames are content-stable (they carry the
 * repo path, and content is re-uploaded with a new path when it changes),
 * so the browser can hold them for a year and the edge never revalidates.
 */
const IMMUTABLE = "max-age=31536000, immutable";
const REVALIDATE = "max-age=0, must-revalidate";

const BUCKETS = [
  { id: "media", cacheControl: IMMUTABLE },
  { id: "org-logos", cacheControl: IMMUTABLE },
  { id: "affirmation-audio", cacheControl: IMMUTABLE },
  // User recordings are private and user-specific: never cache at the edge.
  { id: "practice-recordings", cacheControl: REVALIDATE },
];

const DRY = flag("dry-run");
const REUPLOAD = flag("reupload");

async function getBuckets() {
  const res = await fetch(`${BASE}/storage/v1/bucket`, { headers: AUTH });
  if (!res.ok) throw new Error(`list buckets ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * The update endpoint validates the WHOLE bucket, not a patch, so every
 * existing field has to be echoed back with only cacheConfig changed.
 */
async function setBucketCache(bucket, cacheControl) {
  const body = {
    id: bucket.id,
    name: bucket.id,
    public: bucket.public,
    file_size_limit: bucket.file_size_limit ?? null,
    allowed_mime_types: bucket.allowed_mime_types ?? null,
    cacheConfig: { cacheControl },
  };
  const res = await fetch(`${BASE}/storage/v1/bucket/${bucket.id}`, {
    method: "PUT",
    headers: { ...AUTH, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`update ${bucket.id}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function listObjects(bucket, prefix = "") {
  const res = await fetch(
    `${BASE}/storage/v1/object/list/${bucket}?limit=1000${prefix ? `&prefix=${encodeURIComponent(prefix)}` : ""}`,
    { headers: AUTH }
  );
  if (!res.ok) throw new Error(`list ${bucket} ${res.status}`);
  return res.json();
}

/** Re-stamp an object's cache-control by copying it onto itself with upsert. */
async function restampObject(bucket, path) {
  const src = await fetch(`${BASE}/storage/v1/object/${bucket}/${path}`, { headers: AUTH });
  if (!src.ok) return false;
  const body = Buffer.from(await src.arrayBuffer());
  const res = await fetch(`${BASE}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      ...AUTH,
      "Content-Type": src.headers.get("content-type") || "application/octet-stream",
      "cache-control": IMMUTABLE,
      "x-upsert": "true",
    },
    body,
  });
  return res.ok;
}

console.log("=== Supabase Storage cache config ===");
console.log(`project: ${BASE}`);
console.log(`mode   : ${DRY ? "dry-run" : "apply"}${REUPLOAD ? " + reupload" : ""}\n`);

const existing = await getBuckets();
const existingIds = new Set(existing.map((b) => b.id));
let failures = 0;

for (const b of BUCKETS) {
  if (!existingIds.has(b.id)) {
    console.log(`- ${b.id.padEnd(22)} bucket not present, skipping`);
    continue;
  }
  if (DRY) {
    console.log(`- ${b.id.padEnd(22)} would set cacheControl="${b.cacheControl}"`);
    continue;
  }
  const live = existing.find((x) => x.id === b.id);
  try {
    const updated = await setBucketCache(live, b.cacheControl);
    const applied = updated?.cacheConfig?.cacheControl;
    console.log(
      `✓ ${b.id.padEnd(22)} cacheControl="${applied ?? b.cacheControl}"` +
        (applied && applied !== b.cacheControl ? "  (server clamped)" : "")
    );
  } catch (e) {
    failures++;
    console.log(`✗ ${b.id.padEnd(22)} ${e.message}`);
  }
}

if (REUPLOAD && !DRY) {
  console.log("\n--- re-stamping existing objects ---");
  for (const b of BUCKETS) {
    if (!existingIds.has(b.id)) continue;
    let stamped = 0;
    let failed = 0;
    const walk = async (prefix) => {
      const items = await listObjects(b.id, prefix);
      for (const it of items) {
        if (it.id === null) {
          // A "folder" entry: recurse into it.
          await walk(prefix ? `${prefix}/${it.name}` : it.name);
          continue;
        }
        const path = prefix ? `${prefix}/${it.name}` : it.name;
        try {
          if (await restampObject(b.id, path)) stamped++;
          else failed++;
        } catch {
          failed++;
        }
      }
    };
    try {
      await walk("");
    } catch (e) {
      console.log(`  ! ${b.id}: ${e.message}`);
    }
    console.log(`  ${b.id.padEnd(22)} stamped ${stamped}, failed ${failed}`);
  }
}

if (failures > 0) {
  console.log(`\n${failures} bucket(s) failed to update.`);
  process.exit(1);
}
console.log("\nDone. Supabase's edge will now serve these buckets with the configured Cache-Control.");
