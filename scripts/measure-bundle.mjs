#!/usr/bin/env node
/**
 * Bundle measurement harness.
 *
 * Reports the REAL critical path rather than guessing from file sizes:
 *
 *   1. The static (blocking) import graph reachable from the HTML entry.
 *      These bytes must download before the app can run.
 *   2. gzip + brotli transfer sizes for that graph.
 *   3. The largest chunks overall, so a regression is obvious.
 *
 * Usage:
 *   node scripts/measure-bundle.mjs                # measure current config
 *   SKIP_MANUAL_CHUNKS=1 node scripts/measure-bundle.mjs   # Rollup defaults
 *   node scripts/measure-bundle.mjs --json         # machine-readable output
 */
import { build } from "vite";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);

const gzip = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const brotli = (buf) =>
  zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
const kb = (n) => (n / 1024).toFixed(1);

const analysis = {
  name: "bundle-measure",
  generateBundle(_opts, bundle) {
    const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
    const entry = chunks.find((c) => c.isEntry);
    if (!entry) return;

    // Static (blocking) graph from the entry.
    const staticSet = new Set();
    const stack = [entry];
    while (stack.length) {
      const c = stack.pop();
      if (staticSet.has(c.fileName)) continue;
      staticSet.add(c.fileName);
      for (const dep of c.imports) {
        const t = chunks.find((x) => x.fileName === dep);
        if (t) stack.push(t);
      }
    }

    const staticChunks = [...staticSet].map((f) => chunks.find((c) => c.fileName === f));
    let raw = 0, gz = 0, br = 0;
    for (const c of staticChunks) {
      const buf = Buffer.from(c.code, "utf8");
      raw += buf.length;
      gz += gzip(buf);
      br += brotli(buf);
    }

    // Every chunk, for the "largest" table.
    const all = chunks
      .map((c) => {
        const buf = Buffer.from(c.code, "utf8");
        return { file: c.fileName, raw: buf.length, gz: gzip(buf), br: brotli(buf), isEntry: c.isEntry };
      })
      .sort((a, b) => b.gz - a.gz);

    const result = {
      blocking: {
        files: staticChunks.length,
        raw,
        gzip: gz,
        brotli: br,
        list: staticChunks.map((c) => ({ file: c.fileName, raw: c.code.length })),
      },
      total: {
        files: chunks.length,
        raw: all.reduce((a, c) => a + c.raw, 0),
        gzip: all.reduce((a, c) => a + c.gz, 0),
      },
      largest: all.slice(0, 15),
    };

    if (flag("json")) {
      console.log("__BUNDLE_RESULT__" + JSON.stringify(result));
      return;
    }

    console.log("\n=== CRITICAL PATH (blocking, static from entry) ===");
    for (const c of staticChunks) {
      const buf = Buffer.from(c.code, "utf8");
      console.log(
        `  ${kb(buf.length).padStart(8)} KB raw  ${kb(gzip(buf)).padStart(7)} KB gz  ${c.fileName}`
      );
    }
    console.log(
      `\n  TOTAL BLOCKING: ${kb(raw)} KB raw | ${kb(gz)} KB gzip | ${kb(br)} KB brotli  (${staticChunks.length} files)`
    );
    console.log(
      `  TOTAL BUNDLE:   ${kb(result.total.raw)} KB raw | ${kb(result.total.gzip)} KB gzip  (${result.total.files} files)`
    );
    console.log("\n=== LARGEST CHUNKS (gzip) ===");
    for (const c of all.slice(0, 12)) {
      console.log(
        `  ${kb(c.gz).padStart(8)} KB gz  ${kb(c.raw).padStart(8)} KB raw  ${c.file}${c.isEntry ? "  <- entry" : ""}`
      );
    }
  },
};

await build({
  root: ROOT,
  configFile: path.join(ROOT, "vite.config.ts"),
  mode: "production",
  logLevel: "error",
  plugins: [analysis],
  build: {
    write: false,
    minify: "esbuild",
    reportCompressedSize: false,
  },
});
