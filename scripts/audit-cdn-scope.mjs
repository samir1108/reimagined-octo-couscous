#!/usr/bin/env node
/**
 * Scope report: how much media still points at the old Lovable CDN.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = ["src/assets", "public", "content"];
const found = [];

const walk = (dir) => {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.endsWith(".asset.json")) continue;
    const json = JSON.parse(readFileSync(full, "utf8"));
    if (typeof json.url === "string" && json.url.includes("lovable.app")) {
      found.push({ file: full, url: json.url, size: json.size || 0, storage_path: json.storage_path || null });
    }
  }
};

roots.forEach((r) => walk(r));

const byExt = {};
let total = 0;
for (const f of found) {
  const ext = f.file.split(".").slice(-2)[0];
  byExt[ext] = byExt[ext] || { count: 0, bytes: 0 };
  byExt[ext].count += 1;
  byExt[ext].bytes += f.size;
  total += f.size;
}

console.log(`asset.json files still on lovable CDN: ${found.length}`);
console.log(`declared total: ${(total / 1048576).toFixed(1)} MB`);
console.log("by extension:");
for (const [ext, info] of Object.entries(byExt)) {
  console.log(`  ${ext.padEnd(10)} ${String(info.count).padStart(4)} files  ${(info.bytes / 1048576).toFixed(1)} MB`);
}
console.log("with storage_path already:", found.filter((f) => f.storage_path).length);
console.log("sample:");
found.slice(0, 5).forEach((f) => console.log("  ", f.file, f.size));
