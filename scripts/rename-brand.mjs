#!/usr/bin/env node
/**
 * Rename the brand "ConsciousOS" → "ConsciousOS" across source, config and public
 * assets. Documentation (*.md, *.md') is intentionally left alone.
 *
 * Usage:
 *   node scripts/rename-brand.mjs [--check]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const CHECK_ONLY = process.argv.includes("--check");
const FROM = "ConsciousOS";
const TO = "ConsciousOS";

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", ".lovable", ".kilo", "ios", "android", "docs", "architecture",
]);

/** Files/extensions that carry the brand word in code, config or web metadata. */
const EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".css", ".html", ".json", ".webmanifest", ".txt", ".xml", ".svg",
]);

/** Roots to sweep. */
const ROOTS = ["src", "public", "scripts"];

/** Extra top-level files to include. */
const TOP_FILES = ["index.html", "capacitor.config.ts"];

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (EXTENSIONS.has(extname(entry))) acc.push(p);
  }
  return acc;
}

const files = [...TOP_FILES.filter((f) => statSync(f).isFile())];
for (const root of ROOTS) {
  try {
    files.push(...walk(root));
  } catch {
    /* root absent */
  }
}

let changed = 0;
let occurrences = 0;
const touched = [];

for (const file of files) {
  const raw = readFileSync(file, "utf8");
  if (!raw.includes(FROM)) continue;
  const count = raw.split(FROM).length - 1;
  occurrences += count;
  if (!CHECK_ONLY) {
    writeFileSync(file, raw.split(FROM).join(TO), "utf8");
  }
  changed++;
  touched.push(`${relative(".", file)} (${count})`);
}

console.log(`files swept            : ${files.length}`);
console.log(`files changed          : ${changed}`);
console.log(`replacements made      : ${occurrences}`);
if (CHECK_ONLY) console.log("(dry run - no files written)");
console.log(`\n${TO} will replace ${FROM} in:`);
for (const t of touched.slice(0, 20)) console.log(`  ${t}`);
if (touched.length > 20) console.log(`  ...and ${touched.length - 20} more`);
