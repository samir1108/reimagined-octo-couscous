import fs from "node:fs";

const sw = fs.readFileSync("D:/final/sat-yug/dist/sw.js", "utf8");
const entries = [...sw.matchAll(/\{url:"([^"]+)"(?:,revision:"[^"]*")?\}/g)].map((x) => x[1]);
const uniq = [...new Set(entries)];
console.log("precache entries:", uniq.length);

const sizes = uniq.map((u) => {
  try { return [u, fs.statSync("D:/final/sat-yug/dist/" + u).size]; } catch { return [u, 0]; }
});
sizes.sort((a, b) => b[1] - a[1]);
let total = 0;
sizes.forEach((s) => (total += s[1]));
console.log("total:", Math.round(total / 1024 / 1024 * 10) / 10, "MB");
console.log("--- top 12 ---");
sizes.slice(0, 12).forEach((s) => console.log("  " + String(Math.round(s[1] / 1024)).padStart(6) + " KB  " + s[0]));

const byExt = new Map();
for (const [u, s] of sizes) {
  const e = u.split(".").pop();
  byExt.set(e, (byExt.get(e) || 0) + s);
}
console.log("--- by extension ---");
[...byExt.entries()].sort((a, b) => b[1] - a[1]).forEach(([e, s]) =>
  console.log(`  ${e.padEnd(8)} ${String(Math.round(s / 1024)).padStart(8)} KB`)
);
