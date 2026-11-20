#!/usr/bin/env node
/**
 * Probe every *.asset.json pointer and report which CDN objects are alive.
 * Writes supabase/manifests/media-status.json.
 *
 * Unlike check-media.mjs (which prefixes pointers with one base URL), this
 * probes the final absolute URL, so pointers may live on any host.
 *
 * Usage:
 *   node scripts/probe-asset-urls.mjs [--limit N]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".lovable", ".kilo", "ios", "android"]);
const LIMIT = Number(process.argv[process.argv.indexOf("--limit") + 1]) || Infinity;
const CONCURRENCY = 16;

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (entry.endsWith(".asset.json")) acc.push(p);
  }
  return acc;
}

const pointers = walk("src/assets").slice(0, LIMIT);
const results = [];
let i = 0;
let done = 0;

async function worker() {
  while (i < pointers.length) {
    const p = pointers[i++];
    let json;
    try {
      json = JSON.parse(readFileSync(p, "utf8"));
    } catch {
      results.push({ pointer: `./${p.replace(/\\/g, "/")}`, status: "unparseable" });
      continue;
    }
    if (!json.url) {
      results.push({ pointer: `./${p.replace(/\\/g, "/")}`, status: "no-url" });
      continue;
    }
    let status = "fetch-failed";
    try {
      const r = await fetch(json.url, { method: "GET", headers: { Range: "bytes=0-0" } });
      status = String(r.status);
    } catch (e) {
      status = String(e && e.message).slice(0, 60);
    }
    results.push({
      pointer: `./${p.replace(/\\/g, "/")}`,
      url: json.url,
      status,
      host: (() => { try { return new URL(json.url).host; } catch { return "?"; } })(),
    });
    if (++done % 50 === 0) process.stdout.write(`  ${done}/${pointers.length}\n`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const alive = results.filter((r) => r.status === "200" || r.status === "206");
const dead = results.filter((r) => r.status !== "200" && r.status !== "206");

const byHost = {};
for (const r of alive) byHost[r.host] = (byHost[r.host] || 0) + 1;

const report = {
  checked_at: new Date().toISOString(),
  total: pointers.length,
  alive: alive.length,
  dead: dead.length,
  alive_by_host: byHost,
  dead_pointers: dead.sort((a, b) => a.pointer.localeCompare(b.pointer)),
};

const outDir = "supabase/manifests";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "media-status.json"), JSON.stringify(report, null, 2));

console.log(`${alive.length}/${pointers.length} alive, ${dead.length} dead`);
for (const [host, n] of Object.entries(byHost)) console.log(`  ${n} from ${host}`);
if (dead.length) console.log(`\ndead: ${join(outDir, "media-status.json")}`);
