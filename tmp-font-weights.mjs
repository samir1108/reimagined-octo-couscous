import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx|ts|css|html)$/.test(e)) out.push(full);
  }
  return out;
}
const files = walk(path.join(ROOT, "src")).concat([path.join(ROOT, "index.html")]);
const texts = files.map((f) => ({ f, c: fs.readFileSync(f, "utf8") }));

// "italic" as a standalone Tailwind utility token
let italicHits = [];
for (const { f, c } of texts) {
  const re = /(^|["'`\s])italic(["'`\s]|$)/g;
  let m;
  while ((m = re.exec(c))) {
    const line = c.slice(0, m.index).split("\n").length;
    italicHits.push(`${path.relative(ROOT, f)}:${line}`);
  }
}
console.log("=== standalone 'italic' token usages:", italicHits.length);
italicHits.slice(0, 12).forEach((h) => console.log("   " + h));

// font-weight numeric values in inline styles
console.log("\n=== inline fontWeight values ===");
const fw = new Map();
for (const { f, c } of texts) {
  for (const m of c.matchAll(/fontWeight:\s*["']?(\d{3})["']?/g)) {
    fw.set(m[1], (fw.get(m[1]) || 0) + 1);
  }
  for (const m of c.matchAll(/font-weight:\s*(\d{3})/g)) {
    fw.set(m[1], (fw.get(m[1]) || 0) + 1);
  }
}
[...fw.entries()].sort((a, b) => b[1] - a[1]).forEach(([w, n]) => console.log(`   ${w}: ${n}`));

// font-weight utility classes
console.log("\n=== font-weight utility classes ===");
const W = { "font-extralight": 200, "font-light": 300, "font-normal": 400, "font-medium": 500, "font-semibold": 600, "font-bold": 700, "font-extrabold": 800, "font-black": 900 };
for (const [cls, w] of Object.entries(W)) {
  let n = 0;
  for (const { c } of texts) {
    const re = new RegExp(`(^|["'\`\\s])${cls}(["'\`\\s]|$)`, "g");
    n += (c.match(re) || []).length;
  }
  console.log(`   ${cls.padEnd(16)} (${w}): ${n}`);
}
