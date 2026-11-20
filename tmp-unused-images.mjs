import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
const SRC = path.join(ROOT, "src");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const codeFiles = walk(SRC).filter(
  (f) => /\.(ts|tsx|css|html|json)$/.test(f) && !f.includes(`${path.sep}assets${path.sep}`) && !f.includes("cdn-images.json")
);
const codeText = codeFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

const IMAGES = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const imageFiles = walk(path.join(SRC, "assets")).filter((f) => IMAGES.has(path.extname(f).toLowerCase()));

const used = [];
const unused = [];
for (const f of imageFiles) {
  const base = path.basename(f);
  const rel = path.relative(SRC, f).replace(/\\/g, "/");
  const stem = base.replace(/\.[^.]+$/, "");
  const referenced =
    codeText.includes(base) ||
    codeText.includes(rel) ||
    codeText.includes(`assets/${rel.split("/").slice(1).join("/")}`) ||
    new RegExp(`from\\s+"[^"]*${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(codeText);
  const size = fs.statSync(f).size;
  (referenced ? used : unused).push({ f, rel, size });
}

unused.sort((a, b) => b.size - a.size);
console.log(`=== UNREFERENCED IMAGES: ${unused.length}, ${Math.round(unused.reduce((a, x) => a + x.size, 0) / 1024 / 1024 * 100) / 100} MB ===\n`);
unused.slice(0, 25).forEach((x) =>
  console.log(`  ${String(Math.round(x.size / 1024)).padStart(6)} KB  ${x.rel}`)
);

console.log(`\n=== SUMMARY ===`);
console.log(`  referenced:   ${used.length} images, ${Math.round(used.reduce((a, x) => a + x.size, 0) / 1024 / 1024 * 100) / 100} MB`);
console.log(`  unreferenced: ${unused.length} images, ${Math.round(unused.reduce((a, x) => a + x.size, 0) / 1024 / 1024 * 100) / 100} MB`);

fs.writeFileSync(
  "D:/final/sat-yug/tmp-unused-images.json",
  JSON.stringify(unused.map((x) => x.rel), null, 2)
);
