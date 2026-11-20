#!/usr/bin/env node
/**
 * Incremental typecheck ratchet.
 *
 * The app has a large pre-existing backlog of type errors in engine modules
 * that are still being reconciled. A blanket `tsc` failure hides new
 * regressions, and a plain pass hides the backlog. This script records the
 * backlog as a baseline and fails only when a change introduces NEW errors.
 *
 * Usage:
 *   node scripts/typecheck-ratchet.mjs            # verify
 *   node scripts/typecheck-ratchet.mjs --update   # refresh baseline
 *   node scripts/typecheck-ratchet.mjs --strict   # ignore baseline (full check)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = join(root, "config", "typecheck-baseline.json");
const tscPath = join(root, "node_modules", "typescript", "bin", "tsc");

const args = process.argv.slice(2);
const update = args.includes("--update");
const strict = args.includes("--strict");

const result = spawnSync(
  process.execPath,
  [tscPath, "-p", "tsconfig.app.json", "--noEmit", "--pretty", "false"],
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const errorLine = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/;

/** Key ignores line/column so unrelated edits do not invalidate the baseline. */
const counts = new Map();
const samples = new Map();

for (const line of output.split(/\r?\n/)) {
  const match = errorLine.exec(line.trim());
  if (!match) continue;
  const file = relative(root, match[1]).replace(/\\/g, "/");
  const key = `${file}|${match[4]}|${match[5]}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
  if (!samples.has(key)) samples.set(key, `${file}:${match[2]}`);
}

const total = [...counts.values()].reduce((a, b) => a + b, 0);

if (total === 0) {
  console.log("typecheck: clean (0 errors)");
  process.exit(0);
}

const toObject = () => Object.fromEntries([...counts.entries()].sort());

if (strict) {
  console.error(`typecheck:strict: ${total} errors (baseline ignored)`);
  for (const [key, sample] of samples) console.error(`  ${sample}  ${key.split("|")[1]}`);
  process.exit(1);
}

if (update || !existsSync(baselinePath)) {
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(
    baselinePath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), total, errors: toObject() }, null, 2)}\n`,
  );
  console.log(`typecheck: baseline ${update ? "updated" : "created"} with ${total} known errors`);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const known = baseline.errors ?? {};
const regressions = [];

for (const [key, count] of counts) {
  const allowed = known[key] ?? 0;
  if (count > allowed) {
    regressions.push({ sample: samples.get(key), key, added: count - allowed });
  }
}

const fixed = Object.keys(known).length - Object.keys(known).filter((k) => counts.has(k)).length;

if (regressions.length > 0) {
  console.error(`typecheck: ${regressions.length} new error(s) beyond the baseline of ${baseline.total}`);
  for (const r of regressions.slice(0, 40)) {
    console.error(`  +${r.added}  ${r.sample}  ${r.key.split("|")[1]}`);
  }
  console.error("Fix them, or run `npm run typecheck:baseline` if the debt is intentional.");
  process.exit(1);
}

console.log(
  `typecheck: no regressions (${total} known errors, baseline ${baseline.total}${fixed > 0 ? `, improved by ${fixed}` : ""})`,
);
