import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-images.json", "utf8"));
const entries = Object.entries(manifest.images);

const elder = entries.find(([rel]) => rel.includes("the-elder"))[1];
const logo = entries.find(([rel]) => rel.includes("brand-logo"))[1];
const cosmic = entries.find(([rel]) => rel.includes("cosmic-nebula"))[1];

const TESTS = [
  ["elder", elder, ""],
  ["elder", elder, "?format=webp&quality=80"],
  ["elder", elder, "?width=256&format=webp&quality=80"],
  ["logo", logo, "?format=webp&quality=85"],
  ["logo", logo, "?width=128&format=webp&quality=85"],
  ["cosmic", cosmic, "?format=webp&quality=80"],
  ["cosmic", cosmic, "?width=1920&format=webp&quality=80"],
];

for (const [label, e, q] of TESTS) {
  const r = await fetch(`${e.render_url}${q}`, { method: "GET" });
  const len = Number(r.headers.get("content-length") || 0);
  const type = r.headers.get("content-type");
  r.body?.cancel?.();
  const plain = await fetch(e.url, { method: "HEAD" });
  const plainLen = Number(plain.headers.get("content-length") || 0);
  console.log(
    `  ${label.padEnd(8)} ${(q || "(no params)").padEnd(34)} ${r.status} ${String(len).padStart(9)} B  ${String(type).padEnd(11)} (orig ${plainLen} B, ${plainLen ? Math.round((1 - len / plainLen) * 100) : 0}% smaller)`
  );
}
