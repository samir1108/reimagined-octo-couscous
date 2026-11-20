import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-images.json", "utf8"));
const entries = Object.entries(manifest.images);

const CONCURRENCY = 12;
let origTotal = 0;
let webpTotal = 0;
const failures = [];
const results = [];

async function check([rel, e]) {
  const plain = await fetch(e.url, { method: "HEAD" });
  const origLen = Number(plain.headers.get("content-length") || 0);

  const r = await fetch(`${e.render_url}?format=webp&quality=85`, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  const type = r.headers.get("content-type");
  r.body?.cancel?.();

  return { rel, origLen, len, type, status: r.status, cc: r.headers.get("cache-control") };
}

let i = 0;
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (i < entries.length) {
    const item = entries[i++];
    try {
      results.push(await check(item));
    } catch (e) {
      failures.push([item[0], e.message]);
    }
  }
});
await Promise.all(workers);

for (const r of results) {
  origTotal += r.origLen;
  webpTotal += r.len;
  if (r.status !== 200 || r.type !== "image/webp") failures.push([r.rel, `status=${r.status} type=${r.type}`]);
  if (!r.cc || !r.cc.includes("immutable")) failures.push([r.rel, `cc=${r.cc}`]);
}

const mb = (n) => (n / 1024 / 1024).toFixed(2);
console.log("=== TRANSFORM SWEEP (format=webp&quality=85, no resize) ===");
console.log(`  images checked: ${results.length}`);
console.log(`  original total: ${mb(origTotal)} MB`);
console.log(`  webp total:     ${mb(webpTotal)} MB`);
console.log(`  saving:         ${mb(origTotal - webpTotal)} MB  (${Math.round((1 - webpTotal / origTotal) * 100)}%)`);

console.log(`\n  failures / anomalies: ${failures.length}`);
failures.slice(0, 20).forEach(([rel, why]) => console.log(`    ${rel}  ${why}`));

// biggest absolute wins
results.sort((a, b) => b.origLen - a.origLen - (a.origLen - a.len));
const top = results.slice(0, 10);
console.log("\n=== TOP 10 BY SAVED BYTES ===");
top.forEach((r) =>
  console.log(
    `  ${String(Math.round((r.origLen - r.len) / 1024)).padStart(6)} KB saved  ${r.rel}  (${Math.round(r.origLen / 1024)} KB -> ${Math.round(r.len / 1024)} KB)`
  )
);
