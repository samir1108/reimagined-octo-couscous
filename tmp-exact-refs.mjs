import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/final/sat-yug";
const PUB = path.join(ROOT, "public");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir)) {
    const full = path.join(dir, e);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const codeFiles = walk(path.join(ROOT, "src")).filter((f) => /\.(ts|tsx|css|html|json|webmanifest)$/.test(f));
codeFiles.push(path.join(ROOT, "index.html"));
codeFiles.push(path.join(PUB, "manifest.webmanifest"));
codeFiles.push(path.join(PUB, "robots.txt"));

const PROBES = [
  "/orb.mp4",
  "/blog-posts.json",
  "/sitemap.xml",
  "/1.png",
  "app-screens/03-scene-teaching.png",
  "03-scene-teaching.png",
  "/pwa-icon-192.png",
  "stitch_consciousos_cinematic_experience",
  "app-captures/",
];

console.log("=== EXACT SOURCE LINES FOR EACH PROBE ===\n");
for (const probe of PROBES) {
  console.log(`--- "${probe}" ---`);
  let found = 0;
  for (const f of codeFiles) {
    const c = fs.readFileSync(f, "utf8");
    const lines = c.split("\n");
    lines.forEach((line, i) => {
      if (line.includes(probe)) {
        found++;
        console.log(`  ${path.relative(ROOT, f)}:${i + 1}`);
        console.log(`     ${line.trim().slice(0, 130)}`);
      }
    });
  }
  if (!found) console.log("  (no matches)");
  console.log();
}

// Which appScreen(n) values are requested, and do they exist locally?
const rail = fs.readFileSync(path.join(ROOT, "src/components/landing/AppScreenRail.tsx"), "utf8");
const nums = [...rail.matchAll(/n:\s*(\d+)/g)].map((m) => Number(m[1]));
console.log("=== APP SCREEN RAIL n VALUES ===");
console.log("  requested:", nums.join(", "));
const missing = [];
for (const n of nums) {
  const p = path.join(PUB, "stitch_consciousos_cinematic_experience", `${n}.png`, "screen.png");
  if (!fs.existsSync(p)) missing.push(n);
}
console.log("  missing locally:", missing.length ? missing.join(", ") : "(none)");

// sitemap referenced by robots.txt?
console.log("\n=== robots.txt ===");
console.log(fs.readFileSync(path.join(PUB, "robots.txt"), "utf8"));
