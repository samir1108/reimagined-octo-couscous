import fs from "node:fs";

const sw = fs.readFileSync("D:/final/sat-yug/dist/sw.js", "utf8");
console.log("sw.js size:", Math.round(sw.length / 1024), "KB");
console.log("precache entries:", (sw.match(/\{url:/g) || []).length);
for (const n of ["app-assets", "supabase-media", "google-fonts"]) {
  console.log(`  cache "${n}":`, sw.includes(n) ? "yes" : "NO");
}
for (const n of ["skipWaiting", "clientsClaim", "cleanupOutdatedCaches", "NavigationRoute", "StaleWhileRevalidate", "CacheFirst"]) {
  console.log(`  ${n}:`, sw.includes(n) ? "yes" : "no");
}
// the runtime cache rules should be present as route registrations
const routes = [...sw.matchAll(/registerRoute\(/g)];
console.log("  registerRoute calls:", routes.length);
