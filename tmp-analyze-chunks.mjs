import { build } from "vite";
import path from "node:path";

const ROOT = "D:/final/sat-yug";

const analysis = {
  name: "analysis",
  generateBundle(_opts, bundle) {
    const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
    const entry = chunks.find((c) => c.isEntry);
    if (!entry) return;

    const owner = new Map();
    for (const c of chunks) for (const id of c.moduleIds) owner.set(id, c.fileName);

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

    console.log("\n=== STATIC CHUNKS FROM ENTRY ===");
    for (const f of staticSet) {
      const c = chunks.find((x) => x.fileName === f);
      console.log(`  ${String(Math.round(c.code.length / 1024)).padStart(5)} KB  ${f}`);
    }

    console.log("\n=== DIRECT ENTRY -> CHUNK IMPORTS (module level) ===");
    for (const id of entry.moduleIds) {
      const mi = this.getModuleInfo(id);
      if (!mi) continue;
      for (const importedId of mi.importedIds || []) {
        const targetChunk = owner.get(importedId);
        if (targetChunk && staticSet.has(targetChunk) && targetChunk !== entry.fileName) {
          console.log(
            `  ${id.replace(ROOT, "").replace(/\\/g, "/")}\n     -> ${targetChunk}  (${importedId.replace(ROOT, "").replace(/\\/g, "/")})`
          );
        }
      }
    }
  },
};

await build({
  root: ROOT,
  configFile: path.join(ROOT, "vite.config.ts"),
  mode: "production",
  logLevel: "error",
  plugins: [analysis],
  build: { write: false, minify: false, reportCompressedSize: false },
});
