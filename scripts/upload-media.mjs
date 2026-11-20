#!/usr/bin/env node
/**
 * Upload local media files (downloaded via scripts/download-media.mjs) into
 * YOUR OWN Supabase Storage bucket, preserving the manifest paths.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-media.mjs https://<your-ref>.supabase.co [bucket] [srcDir]
 *
 * Then repoint the .asset.json pointers:
 *   node scripts/repoint-media.mjs https://<your-ref>.supabase.co media
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const manifest = JSON.parse(
  readFileSync(new URL("../supabase/manifests/storage-media.json", import.meta.url), "utf8"),
);

const base = (process.argv[2] || "").replace(/\/$/, "");
const bucket = process.argv[3] || manifest.bucket || "media";
const srcDir = process.argv[4] || ".";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!base || !key) {
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-media.mjs <SUPABASE_URL> [bucket] [srcDir]");
  process.exit(1);
}

let ok = 0;
let missing = 0;
let failed = 0;
for (const obj of manifest.objects) {
  const file = join(srcDir, obj.path);
  if (!existsSync(file)) {
    console.warn(`skip (not downloaded) ${obj.path}`);
    missing++;
    continue;
  }
  const res = await fetch(`${base}/storage/v1/object/${bucket}/${obj.path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": obj.mime || "application/octet-stream",
      "x-upsert": "true",
    },
    body: readFileSync(file),
  });
  if (!res.ok) {
    console.error(`FAIL ${res.status} ${obj.path} — ${await res.text()}`);
    failed++;
    continue;
  }
  ok++;
  console.log(`up  ${obj.path}`);
}
console.log(`\n${ok} uploaded, ${missing} missing locally, ${failed} failed.`);
