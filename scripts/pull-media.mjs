#!/usr/bin/env node
/**
 * Pull every object in the private `media` bucket down to a local folder,
 * using signed URLs minted by the `media-export` edge function.
 *
 * Usage:
 *   MEDIA_EXPORT_TOKEN=... node scripts/pull-media.mjs [SUPABASE_URL] [outDir]
 *
 * Defaults: SUPABASE_URL from .env (VITE_SUPABASE_URL), outDir = "."
 * (outDir "." writes the binaries next to their .asset.json pointers)
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const manifest = JSON.parse(
  readFileSync(new URL("../supabase/manifests/storage-media.json", import.meta.url), "utf8"),
);

const base = (process.argv[2] || process.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const outDir = process.argv[3] || ".";
const token = process.env.MEDIA_EXPORT_TOKEN;

if (!base || !token) {
  console.error("Usage: MEDIA_EXPORT_TOKEN=... node scripts/pull-media.mjs <SUPABASE_URL> [outDir]");
  process.exit(1);
}

const paths = manifest.objects.map((o) => o.path);
const res = await fetch(`${base}/functions/v1/media-export`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-migration-token": token },
  body: JSON.stringify({ paths }),
});
const json = await res.json();
if (!json.urls) {
  console.error(res.status, JSON.stringify(json).slice(0, 500));
  process.exit(1);
}

let ok = 0;
let failed = 0;
for (const u of json.urls) {
  const target = join(outDir, u.path);
  if (existsSync(target) && statSync(target).size > 0) { ok++; continue; }
  if (!u.signedUrl) { console.error("no url", u.path, u.error); failed++; continue; }
  const r = await fetch(u.signedUrl);
  if (!r.ok) { console.error(`FAIL ${r.status} ${u.path}`); failed++; continue; }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(await r.arrayBuffer()));
  ok++;
  console.log(`ok  ${u.path}`);
}
console.log(`\n${ok}/${paths.length} downloaded, ${failed} failed.`);
