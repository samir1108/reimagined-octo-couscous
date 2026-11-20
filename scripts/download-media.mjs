#!/usr/bin/env node
/**
 * Download every media object listed in supabase/manifests/storage-media.json
 * into the repo at its original path (e.g. src/assets/games/videos/x.mp4).
 *
 * Usage:
 *   node scripts/download-media.mjs                       # uses .env VITE_SUPABASE_URL
 *   node scripts/download-media.mjs https://<ref>.supabase.co [bucket] [outDir]
 *
 * Requires the bucket to be public, OR set SUPABASE_SERVICE_ROLE_KEY in the env
 * to download from a private bucket.
 *
 * NOTE: the full set is ~347 MB. Keep the downloads OUT of git unless you
 * really want binaries committed (see media/.gitignore note in SELF_HOSTING.md).
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const manifest = JSON.parse(
  readFileSync(new URL("../supabase/manifests/storage-media.json", import.meta.url), "utf8"),
);

const base = (process.argv[2] || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const bucket = process.argv[3] || manifest.bucket || "media";
const outDir = process.argv[4] || ".";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!base) {
  console.error("Missing Supabase URL. Pass it as argv[2] or set VITE_SUPABASE_URL.");
  process.exit(1);
}

let done = 0;
let failed = 0;
for (const obj of manifest.objects) {
  const target = join(outDir, obj.path);
  if (existsSync(target)) {
    done++;
    continue;
  }
  const url = serviceKey
    ? `${base}/storage/v1/object/${bucket}/${obj.path}`
    : `${base}/storage/v1/object/public/${bucket}/${obj.path}`;
  const res = await fetch(url, {
    headers: serviceKey ? { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } : {},
  });
  if (!res.ok) {
    console.error(`FAIL ${res.status} ${obj.path}`);
    failed++;
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  done++;
  console.log(`ok  ${obj.path}`);
}
console.log(`\n${done}/${manifest.objects.length} downloaded, ${failed} failed.`);
