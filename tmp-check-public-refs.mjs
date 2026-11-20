import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
const PUB = path.join(ROOT, "public");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/media/cdn-public.json"), "utf8"));

// Every file that source might reference by literal public path.
const codeFiles = walk(path.join(ROOT, "src")).filter(
  (f) => /\.(ts|tsx|css|html|json|webmanifest)$/.test(f) && !f.includes("cdn-public.json")
);
codeFiles.push(path.join(ROOT, "index.html"));
codeFiles.push(path.join(PUB, "manifest.webmanifest"));
codeFiles.push(path.join(PUB, "robots.txt"));

const text = codeFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

console.log("=== DIRECT (non-CDN) REFERENCES TO CDN-OFFLOADED PATHS ===\n");
let risky = 0;
for (const rel of Object.keys(manifest.assets)) {
  const base = path.basename(rel);
  const dir = path.dirname(rel);
  // a literal "/dir/base" or "/base" reference in source
  const literalDir = `/${dir}/`;
  const literalBase = `/${base}`;

  const hits = [];
  if (text.includes(literalDir) && !text.includes(`publicAssetUrl`) && !text.includes(`publicImageUrl`)) {
    // directory referenced
    hits.push(`dir "${literalDir}"`);
  }
  if (text.includes(literalBase) && !text.includes(`publicAssetUrl(\`${literalBase}`) && !text.includes(`publicImageUrl(\`${literalBase}`)) {
    hits.push(`file "${literalBase}"`);
  }
  if (hits.length) {
    risky++;
    console.log(`  ${rel}`);
    hits.forEach((h) => console.log(`      ${h}`));
  }
}
console.log(`\n  risky paths: ${risky}`);

// Also check: which public files are still referenced anywhere as literals
// that are NOT in the CDN manifest (i.e. genuinely local-only assets)
console.log("\n=== PUBLIC FILES STILL REFERENCED LOCALLY (not offloaded) ===");
const localRefs = new Set();
for (const f of codeFiles) {
  const c = fs.readFileSync(f, "utf8");
  for (const m of c.matchAll(/["'`](\/[A-Za-z0-9._\-/()% ]+\.(png|jpe?g|webp|gif|svg|mp4|webm|json|xml|txt|ico))["'`]/g)) {
    localRefs.add(m[1].replace(/^\//, ""));
  }
}
for (const r of [...localRefs].sort()) {
  if (manifest.assets[r]) continue;
  const p = path.join(PUB, r);
  const size = exists(p) ? Math.round(fs.statSync(p).size / 1024) : -1;
  console.log(`  ${size >= 0 ? String(size).padStart(6) + " KB" : "  MISSING"}  ${r}`);
}
function exists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}
