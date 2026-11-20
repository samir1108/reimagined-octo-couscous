import fs from "node:fs";
import zlib from "node:zlib";
import { execSync } from "node:child_process";

const A = "D:/final/sat-yug/dist/assets";
const before = fs.readdirSync(A).filter((f) => f.endsWith(".js"));

// Make a REAL code change (not a comment, which minification strips).
const target = "D:/final/sat-yug/src/components/ui/toast.tsx";
const orig = fs.readFileSync(target, "utf8");
const marker = "export const PERF_VERIFY_MARKER = 1;";
fs.writeFileSync(target, orig + "\n" + marker + "\n");

console.log("rebuilding with a real app-code change...");
try {
  execSync("npx vite build --mode production", {
    cwd: "D:/final/sat-yug",
    stdio: "ignore",
    shell: "cmd.exe",
    timeout: 900000,
  });
} finally {
  fs.writeFileSync(target, orig);
}

const B = "D:/final/sat-yug/dist/assets";
const after = fs.readdirSync(B).filter((f) => f.endsWith(".js"));

const beforeSet = new Set(before);
const afterSet = new Set(after);

const vendorsBefore = before.filter((f) => f.startsWith("vendor-"));
const vendorsAfter = after.filter((f) => f.startsWith("vendor-"));
const stableVendors = vendorsBefore.filter((f) => vendorsAfter.includes(f));
const changedVendors = vendorsBefore.filter((f) => !vendorsAfter.includes(f));

const appBefore = before.filter((f) => !f.startsWith("vendor-"));
const appAfter = after.filter((f) => !f.startsWith("vendor-"));
const stableApp = appBefore.filter((f) => appAfter.includes(f));
const changedApp = appBefore.filter((f) => !appAfter.includes(f));

const sizeOf = (f) => {
  try { return fs.statSync("D:/final/sat-yug/dist/assets/" + f).size; } catch { return 0; }
};
const gz = (f) => {
  try {
    return zlib.gzipSync(fs.readFileSync("D:/final/sat-yug/dist/assets/" + f)).length;
  } catch { return 0; }
};

console.log("\n=== AFTER A REAL APP-CODE CHANGE ===");
console.log(`  vendor chunks stable: ${stableVendors.length}/${vendorsBefore.length}`);
changedVendors.forEach((f) => console.log(`    changed: ${f}`));
console.log(`  app chunks stable:    ${stableApp.length}/${appBefore.length}`);
console.log(`  app chunks changed:   ${changedApp.length}`);
changedApp.slice(0, 8).forEach((f) => console.log(`    ${f}`));

// What a returning user actually downloads.
// "changedApp" holds the OLD filenames, which the rebuild deleted, so the
// bytes must be summed from their NEW counterparts.
const newAppFiles = after.filter((f) => !f.startsWith("vendor-") && !beforeSet.has(f));
const keptAppFiles = after.filter((f) => !f.startsWith("vendor-") && beforeSet.has(f));
const stableVendorFiles = after.filter((f) => f.startsWith("vendor-") && beforeSet.has(f));

const changedBytes = newAppFiles.reduce((s, f) => s + gz(f), 0);
const keptBytes = keptAppFiles.reduce((s, f) => s + gz(f), 0);
const vendorBytes = stableVendorFiles.reduce((s, f) => s + gz(f), 0);
const totalAfter = after.reduce((s, f) => s + gz(f), 0);

console.log(`\n=== REPEAT VISITOR (vendor cached, app code changed) ===`);
console.log(`  must download (new app chunks):     ${Math.round(changedBytes / 1024)} KB gzip  (${newAppFiles.length} files)`);
console.log(`  served from cache (unchanged app):  ${Math.round(keptBytes / 1024)} KB gzip  (${keptAppFiles.length} files)`);
console.log(`  served from cache (vendor):         ${Math.round(vendorBytes / 1024)} KB gzip  (${stableVendorFiles.length} files)`);
console.log(`  full bundle if nothing were cached: ${Math.round(totalAfter / 1024)} KB gzip  (${after.length} files)`);
console.log(
  `  => a repeat visit downloads ${Math.round(changedBytes / 1024)} KB instead of ${Math.round(totalAfter / 1024)} KB ` +
    `(${Math.round((1 - changedBytes / totalAfter) * 100)}% less)`
);
