#!/usr/bin/env node
/**
 * Point every src/assets/**\/*.asset.json media pointer at the Lovable CDN.
 *
 * Background: these pointers were originally relative URLs (/__l5e/assets-v1/...)
 * which only resolve on the Lovable preview origin, and a half-finished migration
 * overwrote some of them with absolute URLs on a now-dead Supabase project.
 * Both forms break the app, because `url` is consumed directly as a <video src>
 * or <img src> (e.g. src/components/hope/HopeVoidSection.tsx uses flameVideo.url).
 *
 * Every Lovable asset is addressable as:
 *   https://id-preview--<project_id>.lovable.app/__l5e/assets-v1/<asset_id>/<filename>
 * and project_id / asset_id / original_filename are already recorded in each
 * pointer, so the absolute URL is fully deterministic — no network lookup needed.
 *
 * Usage:
 *   node scripts/relink-assets-lovable.mjs            # rewrite pointers
 *   node scripts/relink-assets-lovable.mjs --check     # dry run
 *   node scripts/relink-assets-lovable.mjs <dir>       # restrict to a directory
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const CHECK_ONLY = process.argv.includes("--check");
const DIR_ARG = process.argv.slice(2).find((a) => !a.startsWith("-")) || "src/assets";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".lovable", ".kilo", "ios", "android"]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (entry.endsWith(".asset.json")) acc.push(p);
  }
  return acc;
}

const files = walk(DIR_ARG);
let relinked = 0;
let alreadyOk = 0;
const unmappable = [];
let blobsMissing = 0;

for (const file of files) {
  let json;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    unmappable.push({ pointer: rel(file), reason: "unparseable json" });
    continue;
  }

  const projectId = json.project_id;
  const assetId = json.asset_id;
  const filename = json.original_filename;

  if (!projectId || !assetId || !filename) {
    unmappable.push({
      pointer: rel(file),
      reason: `missing project_id/asset_id/original_filename`,
    });
    continue;
  }

  const cdnUrl = `https://id-preview--${projectId}.lovable.app/__l5e/assets-v1/${assetId}/${filename}`;

  if (json.url === cdnUrl) {
    alreadyOk++;
  } else {
    if (!CHECK_ONLY) {
      writeFileSync(file, `${JSON.stringify({ ...json, url: cdnUrl }, null, 2)}\n`);
    }
    relinked++;
  }

  // The media blob itself is never committed — it lives on the CDN. Track that.
  if (!existsSync(file.replace(/\.asset\.json$/, ""))) blobsMissing++;
}

function rel(p) {
  return `./${p.replace(/\\/g, "/")}`;
}

console.log(`scanned               : ${files.length}`);
console.log(`already CDN-absolute  : ${alreadyOk}`);
console.log(`${CHECK_ONLY ? "to relink" : "relinked"} : ${relinked}`);
console.log(`unmappable            : ${unmappable.length}`);
if (CHECK_ONLY) console.log("(dry run - no files written)");
if (unmappable.length) {
  console.log("\nunmappable pointers:");
  for (const u of unmappable) console.log(`  ${u.pointer} - ${u.reason}`);
}
