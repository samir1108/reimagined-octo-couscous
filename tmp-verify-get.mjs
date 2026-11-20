import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-images.json", "utf8"));
const entries = Object.entries(manifest.images);

console.log("=== GET (what browsers actually do) on plain object URL ===");
const top = entries.sort((a, b) => b[1].size - a[1].size).slice(0, 4);
for (const [rel, e] of top) {
  const r = await fetch(e.url, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  r.body?.cancel?.();
  console.log(`  ${rel}`);
  console.log(`    ${r.status}  ${len} B  cc="${r.headers.get("cache-control")}"  age=${r.headers.get("age")}`);
}

console.log("\n=== transform (render) endpoint: width/format variants ===");
const sample = entries.find(([rel]) => rel.includes("the-elder"))[1];
for (const q of ["width=320&quality=70&format=webp", "width=640&quality=70&format=webp", "width=1200&quality=75&format=webp"]) {
  const r = await fetch(`${sample.render_url}?${q}`, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  const type = r.headers.get("content-type");
  r.body?.cancel?.();
  console.log(`  ${q.padEnd(38)} ${r.status} ${String(len).padStart(8)} B  ${type}  cc="${r.headers.get("cache-control")}"`);
}

console.log("\n=== SVG through the transform endpoint? ===");
const svg = entries.find(([rel]) => rel.endsWith(".svg"));
if (svg) {
  const r = await fetch(`${svg[1].render_url}?width=100`, { method: "GET" });
  console.log(`  ${svg[0]} -> ${r.status} type=${r.headers.get("content-type")}`);
  r.body?.cancel?.();
  const p = await fetch(svg[1].url, { method: "GET" });
  console.log(`  plain -> ${p.status} type=${p.headers.get("content-type")} len=${p.headers.get("content-length")}`);
  p.body?.cancel?.();
} else {
  console.log("  (no svg in manifest)");
}
