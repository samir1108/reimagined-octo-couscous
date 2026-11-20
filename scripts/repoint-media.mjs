#!/usr/bin/env node
/**
 * Repoint every *.asset.json media pointer at a Supabase Storage bucket.
 *
 * Usage:
 *   node scripts/repoint-media.mjs <SUPABASE_URL> [bucket]
 *
 * Example (after moving to your own Supabase project):
 *   node scripts/repoint-media.mjs https://abcd1234.supabase.co media
 *
 * Only pointers that already carry a `storage_path` are rewritten, so dead
 * legacy CDN pointers are left untouched.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { globSync } from "node:fs";

const base = (process.argv[2] || "").replace(/\/$/, "");
const bucket = process.argv[3] || "media";
if (!base) {
  console.error("Usage: node scripts/repoint-media.mjs <SUPABASE_URL> [bucket]");
  process.exit(1);
}

const files = globSync("**/*.asset.json", {
  exclude: (p) => p.includes("node_modules") || p.includes("dist"),
});

let changed = 0;
for (const file of files) {
  const json = JSON.parse(readFileSync(file, "utf8"));
  if (!json.storage_path) continue;
  json.bucket = bucket;
  json.url = `${base}/storage/v1/object/public/${bucket}/${json.storage_path}`;
  writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
  changed++;
}
console.log(`Repointed ${changed} media pointer(s) to ${base}/storage/v1/object/public/${bucket}/`);
