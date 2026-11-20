import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
const SRC = path.join(ROOT, "src");
const exts = [".ts", ".tsx", ".js", ".jsx"];

function resolve(from, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("@/")) return null;
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else base = path.join(path.dirname(from), spec);
  for (const e of exts) if (fs.existsSync(base + e)) return base + e;
  for (const e of exts) {
    const i = path.join(base, "index" + e);
    if (fs.existsSync(i)) return i;
  }
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  return null;
}

const IMPORT_RE = /(?:^|[\n;])\s*(?:import|export)\s+(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
const seen = new Set();
const codeBytes = new Map();
const importers = new Map();

function walk(file, from) {
  if (seen.has(file)) return;
  seen.add(file);
  let c;
  try { c = fs.readFileSync(file, "utf8"); } catch { return; }
  if (/\.(ts|tsx|js|jsx)$/.test(file)) {
    codeBytes.set(file, fs.statSync(file).size);
    if (from) {
      if (!importers.has(file)) importers.set(file, new Set());
      importers.get(file).add(from);
    }
  }
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(c))) {
    const spec = m[1];
    const before = c.slice(Math.max(0, m.index - 80), m.index);
    if (/import\s*\(/.test(before) || /import\s*\(\s*['"]/.test(m[0])) continue;
    if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
    const r = resolve(file, spec);
    if (!r) continue;
    if (/\.(png|jpe?g|webp|gif|svg|mp4|webm|mp3|wav|json)$/i.test(r)) continue;
    walk(r, file);
  }
}
walk(path.join(SRC, "main.tsx"), null);

const arr = [...codeBytes.entries()].sort((a, b) => b[1] - a[1]);
let total = 0;
arr.forEach(([, s]) => (total += s));
console.log("=== EAGER CODE (ts/tsx only): " + arr.length + " modules, " + Math.round(total / 1024) + " KB ===\n");
arr.slice(0, 28).forEach(([f, s]) => {
  const imps = [...(importers.get(f) || [])].map((x) => path.relative(ROOT, x));
  console.log(String(Math.round(s / 1024)).padStart(6) + " KB  " + path.relative(ROOT, f));
  if (imps.length) console.log("          <- " + imps.slice(0, 2).join(", "));
});
