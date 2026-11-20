#!/usr/bin/env node
/**
 * Build public/asset-manifest.json from the relinked src/assets/**\/*.asset.json
 * pointers, so mediaLoader.getMediaUrl(key) resolves against our own Supabase
 * Storage without needing a network fetch of a remote manifest.
 *
 * The `url` in every pointer is already absolute after
 * scripts/migrate-cdn-to-supabase.mjs, so this only indexes them.
 *
 * Usage:
 *   node scripts/generate-asset-manifest.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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

function ext(name) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

const IMAGE = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"]);
const VIDEO = new Set(["mp4", "webm", "mov", "m4v"]);
const AUDIO = new Set(["mp3", "wav", "ogg", "m4a", "aac"]);

const pointers = walk("src/assets");
const files = [];
const bySource = { "src/assets": [], content: [] };
const byType = { image: [], video: [], audio: [] };
let totalBytes = 0;

for (const p of pointers) {
  const rel = relative("src/assets", p).replace(/\.asset\.json$/, "").replace(/\\/g, "/");
  const e = ext(rel);
  let json;
  try {
    json = JSON.parse(readFileSync(p, "utf8"));
  } catch {
    console.warn(`skipping unparseable ${p}`);
    continue;
  }
  if (!json.url) continue;

  const entry = {
    key: rel,
    source: "src/assets",
    remote: `src/assets/${rel}`,
    url: json.url,
    size: json.size || 0,
    type: e,
  };
  files.push(entry);
  bySource["src/assets"].push(rel);
  if (IMAGE.has(e)) byType.image.push(rel);
  else if (VIDEO.has(e)) byType.video.push(rel);
  else if (AUDIO.has(e)) byType.audio.push(rel);
  totalBytes += json.size || 0;
}

const SUPABASE_PROJECT = "vvnihmweqmbmytpggqcw";
const SUPABASE_BUCKET = "media";
const SUPABASE_MEDIA_BASE = `https://${SUPABASE_PROJECT}.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET}`;

const manifest = {
  version: 1,
  generated_at: new Date().toISOString(),
  project_id: SUPABASE_PROJECT,
  bucket: SUPABASE_BUCKET,
  base_url: SUPABASE_MEDIA_BASE,
  total_files: files.length,
  total_size_mb: (totalBytes / 1024 / 1024).toFixed(1),
  files,
  bySource,
  byType,
};

const out = join("public", "asset-manifest.json");
if (!existsSync("public")) mkdirSync("public", { recursive: true });
writeFileSync(out, JSON.stringify(manifest, null, 2));

console.log(`asset-manifest.json -> ${out}`);
console.log(`  files: ${files.length}`);
console.log(`  image: ${byType.image.length}  video: ${byType.video.length}  audio: ${byType.audio.length}`);
console.log(`  size : ${manifest.total_size_mb} MB`);
