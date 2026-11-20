#!/usr/bin/env node
/** Verify every migrated pointer resolves with the right content type. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\//, "").replace(/\/$/, "");
const pointers = [];
const walk = (dir) => {
  for (const e of readdirSync(dir)) {
    if (["node_modules", "dist", ".git"].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (e.endsWith(".asset.json")) pointers.push(p);
  }
};
walk(join(ROOT, "src", "assets"));

let ok = 0;
const bad = [];
let i = 0;
const CONCURRENCY = 16;

async function worker() {
  while (i < pointers.length) {
    const p = pointers[i++];
    const j = JSON.parse(readFileSync(p, "utf8"));
    const rel = relative(join(ROOT, "src", "assets"), p);
    try {
      const res = await fetch(j.url, { method: "HEAD" });
      const type = res.headers.get("content-type") || "";
      const len = Number(res.headers.get("content-length") || 0);
      const expected = j.storage_path ? j.storage_path.split(".").pop() : "";
      const typeOk =
        (expected === "mp4" && type.includes("video")) ||
        (expected === "mp3" && type.includes("audio")) ||
        (expected === "jpg" && type.includes("image")) ||
        (expected === "png" && type.includes("image")) ||
        (expected === "webp" && type.includes("image")) ||
        (expected === "svg" && type.includes("image"));
      if (res.ok && typeOk && len > 0) ok++;
      else bad.push(`${rel} -> ${res.status} ${type} ${len}`);
    } catch (e) {
      bad.push(`${rel} -> ${String(e.message || e)}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`pointers: ${pointers.length}`);
console.log(`reachable with correct type: ${ok}`);
console.log(`problems: ${bad.length}`);
bad.slice(0, 20).forEach((b) => console.log("  -", b));
