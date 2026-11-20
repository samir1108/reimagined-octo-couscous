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

const codeFiles = walk(path.join(ROOT, "src")).filter((f) => /\.(ts|tsx|css|html|json|webmanifest)$/.test(f));
codeFiles.push(path.join(ROOT, "index.html"));
for (const extra of ["manifest.webmanifest", "robots.txt", "sitemap.xml"]) {
  const p = path.join(PUB, extra);
  if (fs.existsSync(p)) codeFiles.push(p);
}
const rootFiles = walk(ROOT).filter(
  (f) => /\.(ts|tsx|mjs|js|json|md|xml|html)$/.test(f) &&
    !f.includes(`${path.sep}node_modules${path.sep}`) &&
    !f.includes(`${path.sep}dist${path.sep}`) &&
    !f.includes(`${path.sep}src${path.sep}`) &&
    !f.includes(`${path.sep}.kilo${path.sep}`) &&
    !f.includes(`${path.sep}media-cache${path.sep}`)
);

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/media/cdn-public.json"), "utf8"));
const assets = manifest.assets || {};

// Every file that was deleted from public/ (present in the CDN manifest but
// missing locally) -> is it referenced by a LITERAL path anywhere?
const deleted = Object.keys(assets).filter((rel) => !fs.existsSync(path.join(PUB, rel)));

console.log("=== DELETED FILES: literal-reference audit ===\n");
let risky = 0;
for (const rel of deleted) {
  const base = path.basename(rel);
  const hits = [];
  for (const f of [...codeFiles, ...rootFiles]) {
    let c;
    try { c = fs.readFileSync(f, "utf8"); } catch { continue; }
    // literal path with the leading slash
    const lit = "/" + rel;
    if (c.includes(lit)) {
      const line = c.split("\n").find((l) => l.includes(lit));
      hits.push(`${path.relative(ROOT, f)}  |  ${line.trim().slice(0, 100)}`);
    }
  }
  if (hits.length) {
    risky++;
    console.log(`  ${rel}`);
    hits.forEach((h) => console.log(`      ${h}`));
  }
}
console.log(`\n  deleted files with literal references: ${risky} / ${deleted.length}`);

// Specifically check the ones I know are risky
console.log("\n=== SPECIFIC CHECKS ===");
const SPECIFIC = {
  "asset-manifest.json": "mediaLoader loadManifest()",
  "og-image.jpg": "Seo.tsx DEFAULT_OG_IMAGE",
  "app-screens/01-entry-page.png": "app intro",
  "splash/iphone-14-pro-max.png": "capacitor splash / install",
  "orb.mp4": "orb video",
  "blog-posts.json": "blog loader",
};
for (const [rel, where] of Object.entries(SPECIFIC)) {
  const inCdn = !!assets[rel];
  const lit = "/" + rel;
  const literalUsers = [...codeFiles, ...rootFiles].filter((f) => {
    try { return fs.readFileSync(f, "utf8").includes(lit); } catch { return false; }
  });
  console.log(`  ${rel.padEnd(38)} onCDN=${inCdn ? "Y" : "n"}  literalRefs=${literalUsers.length}  (${where})`);
  literalUsers.slice(0, 3).forEach((f) => console.log(`        ${path.relative(ROOT, f)}`));
}
