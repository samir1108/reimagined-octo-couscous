import { build } from "vite";
import path from "node:path";

const ROOT = process.cwd();

const spy = {
  name: "spy",
  enforce: "pre",
  resolveId(source, importer, opts) {
    if (!/\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(source)) return null;
    console.log(`  source="${source}"  importer="${importer ? importer.replace(ROOT, "") : "(none)"}`);
    return null;
  },
};

await build({
  root: ROOT,
  configFile: path.join(ROOT, "vite.config.ts"),
  mode: "production",
  logLevel: "error",
  plugins: [spy],
  build: { write: false, minify: false, reportCompressedSize: false },
});
