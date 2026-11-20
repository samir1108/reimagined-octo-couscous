import { build } from "vite";
import path from "node:path";

const ROOT = "D:/final/sat-yug";

const analysis = {
  name: "analysis",
  generateBundle(_opts, bundle) {
    const chunks = Object.values(bundle).filter((c) => c.type === "chunk");
    const byName = (n) => chunks.filter((c) => c.fileName.includes(n));

    for (const name of ["vendor-charts", "vendor-markdown", "vendor-three", "vendor-xstate", "vendor-date"]) {
      const list = byName(name);
      if (!list.length) continue;
      console.log(`\n=== ${name} (${list.length} chunk(s)) ===`);
      for (const c of list) {
        console.log(`  ${c.fileName}  ${Math.round(c.code.length / 1024)} KB  ${c.moduleIds.length} modules`);
        // Group module ids by package
        const pkgs = new Map();
        for (const id of c.moduleIds) {
          let pkg = "(app/virtual)";
          const m = id.replace(ROOT, "").match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
          if (m) pkg = m[1];
          else if (id.startsWith("\0")) pkg = "(virtual) " + id.slice(0, 40);
          pkgs.set(pkg, (pkgs.get(pkg) || 0) + 1);
        }
        [...pkgs.entries()].sort((a, b) => b[1] - a[1]).forEach(([p, n]) =>
          console.log(`      ${String(n).padStart(4)}  ${p}`)
        );
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
