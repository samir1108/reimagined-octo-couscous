#!/usr/bin/env node
/**
 * Probe every *.asset.json pointer in the repo and report which CDN objects
 * are still alive. Writes supabase/manifests/media-status.json.
 *
 * Usage:
 *   node scripts/check-media.mjs [BASE_URL]
 *
 * BASE_URL defaults to our own Supabase Storage origin. Pointers are absolute
 * after scripts/migrate-cdn-to-supabase.mjs, so this is only used for the
 * key-based fallback lookups.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const base = (process.argv[2] || "https://vvnihmweqmbmytpggqcw.supabase.co/storage/v1/object/public/media").replace(/\/$/, "");

const SKIP = new Set(["node_modules", ".git", "dist", ".lovable", ".kilo", "ios", "android"]);
function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".asset.json")) acc.push(p);
  }
  return acc;
}

const pointers = walk(".");
const alive = [];
const dead = [];
const local = [];

const CONCURRENCY = 12;
let i = 0;
async function worker() {
  while (i < pointers.length) {
    const p = pointers[i++];
    const target = p.slice(0, -".asset.json".length);
    if (existsSync(target)) local.push(target);
    let url;
    try {
      url = JSON.parse(readFileSync(p, "utf8")).url;
    } catch {
      dead.push({ pointer: p, status: "unparseable" });
      continue;
    }
    try {
      const r = await fetch(base + url, { method: "HEAD" });
      (r.ok ? alive : dead).push({ pointer: p, status: r.status });
    } catch (e) {
      dead.push({ pointer: p, status: String(e) });
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const report = {
  base,
  checked_at: new Date().toISOString(),
  total: pointers.length,
  alive: alive.length,
  dead: dead.length,
  present_locally: local.length,
  dead_pointers: dead.sort((a, b) => a.pointer.localeCompare(b.pointer)),
};
writeFileSync("supabase/manifests/media-status.json", JSON.stringify(report, null, 2));
console.log(`${alive.length}/${pointers.length} alive, ${dead.length} dead, ${local.length} present on disk`);
console.log("→ supabase/manifests/media-status.json");
