import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-public.json", "utf8"));
const entries = Object.entries(manifest.assets);

console.log("=== VERIFY EVERY PUBLIC CDN ASSET ===");
let bad = 0;
let checked = 0;
const CONCURRENCY = 10;
let i = 0;

async function check([rel, e]) {
  const r = await fetch(e.url, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  const cc = r.headers.get("cache-control") || "";
  r.body?.cancel?.();
  return { rel, status: r.status, len, cc };
}

const results = [];
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (i < entries.length) {
    const item = entries[i++];
    try {
      results.push(await check(item));
    } catch (err) {
      results.push({ rel: item[0], status: "ERR " + err.message, len: 0, cc: "" });
    }
  }
});
await Promise.all(workers);

for (const r of results) {
  checked++;
  if (r.status !== 200) { bad++; console.log(`  ✗ ${r.status}  ${r.rel}`); }
  else if (!r.cc.includes("immutable")) { bad++; console.log(`  ! no immutable cache  ${r.rel}  cc="${r.cc}"`); }
}
console.log(`\n  checked: ${checked}, problems: ${bad}`);

// spot check a transformed image
const img = entries.find(([rel]) => rel.endsWith(".png"));
if (img) {
  const r = await fetch(`${img[1].render_url}?format=webp&quality=85`, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  const type = r.headers.get("content-type");
  r.body?.cancel?.();
  console.log(`  transform check: ${img[0]} -> ${type} ${len} B`);
}
