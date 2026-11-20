import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-images.json", "utf8"));
const entries = Object.entries(manifest.images);

console.log("=== manifest sanity ===");
console.log("entries:", entries.length);

let bad = 0;
for (const [rel, e] of entries) {
  if (!e.url || !e.render_url) { bad++; console.log("  MISSING URL", rel); }
  if (!e.url.includes("/object/public/media/")) { bad++; console.log("  BAD URL", rel, e.url); }
  if (!e.render_url.includes("/render/image/public/media/")) { bad++; console.log("  BAD RENDER URL", rel); }
}
console.log("malformed:", bad);

// spot check the biggest few over the network
const top = entries.sort((a, b) => b[1].size - a[1].size).slice(0, 5);
console.log("\n=== live checks (largest 5) ===");
for (const [rel, e] of top) {
  const plain = await fetch(e.url, { method: "HEAD" });
  const tr = await fetch(`${e.render_url}?width=640&quality=75&format=webp`, { method: "GET" });
  const trLen = Number(tr.headers.get("content-length") || 0);
  const plainLen = Number(plain.headers.get("content-length") || 0);
  tr.body?.cancel?.();
  console.log(
    `  ${rel}\n    plain:  ${plain.status} ${plainLen} B  cc="${plain.headers.get("cache-control")}"\n` +
      `    640webp: ${tr.status} ${trLen} B  cc="${tr.headers.get("cache-control")}"  saving=${plainLen ? Math.round((1 - trLen / plainLen) * 100) : 0}%`
  );
}

// verify a small one too
const small = entries[entries.length - 1];
const r = await fetch(small[1].url, { method: "HEAD" });
console.log(`\n  small: ${small[0]} -> ${r.status} cc="${r.headers.get("cache-control")}"`);
