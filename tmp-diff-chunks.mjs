import { build } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.cwd();

let CAPTURE = null;

const capture = {
  name: "capture",
  generateBundle(_opts, bundle) {
    const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
    const byFile = new Map(chunks.map((c) => [c.fileName, c]));

    // The real entry is the one whose file is referenced by the html
    // (facadeModuleId / isEntry). Fall back to the largest isEntry chunk.
    const entries = chunks.filter((c) => c.isEntry);
    const entry = entries.sort((a, b) => b.code.length - a.code.length)[0];

    const seen = new Set();
    const stack = [entry];
    while (stack.length) {
      const c = stack.pop();
      if (!c || seen.has(c.fileName)) continue;
      seen.add(c.fileName);
      for (const dep of c.imports) {
        const t = byFile.get(dep);
        if (t) stack.push(t);
      }
    }

    const blockingModules = new Map();
    let total = 0;
    const chunkSizes = [];
    for (const f of seen) {
      const c = byFile.get(f);
      total += c.code.length;
      chunkSizes.push([f, c.code.length, c.moduleIds.length]);
      for (const m of c.moduleIds) blockingModules.set(m.replace(ROOT, "").replace(/\\/g, "/"), f);
    }

    // Duplicate detection: any module present in more than one chunk overall
    const owners = new Map();
    for (const c of chunks) {
      for (const m of c.moduleIds) {
        if (!owners.has(m)) owners.set(m, []);
        owners.get(m).push(c.fileName);
      }
    }
    const dupes = [...owners.entries()].filter(([, v]) => v.length > 1);

    CAPTURE = { total, files: seen.size, blockingModules, chunkSizes, entryFile: entry.fileName, dupes };
  },
};

async function run(skip) {
  if (skip) process.env.SKIP_MANUAL_CHUNKS = "1";
  else delete process.env.SKIP_MANUAL_CHUNKS;
  CAPTURE = null;
  await build({
    root: ROOT,
    configFile: path.join(ROOT, "vite.config.ts"),
    mode: "production",
    logLevel: "error",
    plugins: [capture],
    build: { write: false, minify: "esbuild", reportCompressedSize: false },
  });
  return CAPTURE;
}

const A = await run(false);
const B = await run(true);

console.log("\n=== BLOCKING GRAPH ===");
console.log(`  WITH manualChunks:    ${A.total} bytes, ${A.files} files, ${A.blockingModules.size} modules  (entry ${A.entryFile})`);
console.log(`  WITHOUT manualChunks: ${B.total} bytes, ${B.files} files, ${B.blockingModules.size} modules  (entry ${B.entryFile})`);

console.log("\n=== WITH manualChunks: blocking chunks ===");
A.chunkSizes.forEach(([f, s, n]) => console.log(`  ${String(s).padStart(8)} bytes  ${String(n).padStart(4)} modules  ${f}`));

console.log("\n=== WITHOUT manualChunks: blocking chunks ===");
B.chunkSizes.forEach(([f, s, n]) => console.log(`  ${String(s).padStart(8)} bytes  ${String(n).padStart(4)} modules  ${f}`));

const onlyA = [...A.blockingModules.keys()].filter((m) => !B.blockingModules.has(m));
console.log(`\n  modules ONLY in WITH blocking graph: ${onlyA.length}`);
const pkgs = new Map();
for (const m of onlyA) {
  const mm = m.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  const k = mm ? mm[1] : "(app)";
  if (!pkgs.has(k)) pkgs.set(k, []);
  pkgs.get(k).push(m);
}
[...pkgs.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([p, arr]) => {
  console.log(`  ${String(arr.length).padStart(4)}  ${p}`);
  arr.slice(0, 4).forEach((m) => console.log("          " + m));
});

console.log(`\n  duplicate modules across chunks (WITH): ${A.dupes.length}`);
A.dupes.slice(0, 8).forEach(([m, v]) => console.log(`    ${m.replace(ROOT, "")} -> ${v.length} chunks`));
