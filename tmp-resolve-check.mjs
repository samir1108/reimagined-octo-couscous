import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
const PUB = path.join(ROOT, "public");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "src/lib/media/cdn-public.json"), "utf8"));
const assets = manifest.assets || {};

// Replicate publicAssetUrl resolution
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;
const resolve = (p, image) => {
  if (!p || /^(https?:|data:|blob:)/i.test(p)) return p;
  const key = p.replace(/^\/+/, "").split("?")[0];
  const e = assets[key];
  if (!e) return p;
  return image && IMAGE_EXT.test(key) && e.render_url
    ? `${e.render_url}?format=webp&quality=85`
    : e.url;
};

console.log("=== RESOLUTION OF EVERY PUBLIC PATH REFERENCED IN SOURCE ===\n");
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d)) {
    const f = path.join(d, e);
    if (fs.statSync(f).isDirectory()) walk(f);
    else if (/\.(ts|tsx|css|html|webmanifest)$/.test(e)) files.push(f);
  }
})(path.join(ROOT, "src"));
files.push(path.join(ROOT, "index.html"));
files.push(path.join(PUB, "manifest.webmanifest"));

const seen = new Set();
for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  for (const m of c.matchAll(/["'`](\/[A-Za-z0-9._\-/()% ]+\.(png|jpe?g|webp|gif|svg|mp4|webm|json|xml|txt|ico))["'`]/g)) {
    seen.add(m[1]);
  }
}

let cdn = 0, local = 0, missing = 0;
for (const p of [...seen].sort()) {
  const key = p.replace(/^\/+/, "");
  const isCdn = !!assets[key];
  const localExists = fs.existsSync(path.join(PUB, key));
  const url = resolve(p, true);
  if (isCdn) cdn++;
  else { local++; if (!localExists) { missing++; console.log(`  MISSING LOCAL + NOT ON CDN: ${p}`); } }
  const flag = isCdn ? "CDN " : (localExists ? "LOCAL" : "BROKEN");
  console.log(`  ${flag}  ${p}`);
}
console.log(`\n  on CDN: ${cdn} | local: ${local} | broken: ${missing}`);
