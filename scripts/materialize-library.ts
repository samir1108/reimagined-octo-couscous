/**
 * Materializer — generates stats QA, JSONL seeds, and categories SQL from the library.
 * Run: bun scripts/materialize-library.ts
 */
import { generateLibrary } from "../src/lib/content-library/generator/generate";
import { CATEGORY_SPECS } from "../src/lib/content-library/generator/manifest";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "scripts", "library-output");
mkdirSync(outDir, { recursive: true });

const lib = generateLibrary();

// 1. Stats QA
const stats = {
  total: lib.items.length,
  byCategory: Object.fromEntries(Object.entries(lib.byCategory).map(([k, v]) => [k, v.length])),
  byType: {} as Record<string, number>,
};
for (const it of lib.items) stats.byType[it.type] = (stats.byType[it.type] || 0) + 1;
writeFileSync(join(outDir, "stats.json"), JSON.stringify(stats, null, 2));
console.log("TOTAL:", stats.total);

// 2. JSONL seeds (first 1000 items as sample)
const sample = lib.items.slice(0, 1000);
const jsonl = sample.map((i) => JSON.stringify(i)).join("\n");
writeFileSync(join(outDir, "seed-sample.jsonl"), jsonl);
console.log("JSONL sample:", sample.length);

// 3. Categories SQL
const sql = CATEGORY_SPECS.map((c) => {
  return `INSERT INTO library_categories (slug, name, description, icon, color) VALUES ('${c.slug}', '${c.name.replace(/'/g, "''")}', '${c.description.replace(/'/g, "''")}', '${c.icon}', '${c.color}') ON CONFLICT (slug) DO NOTHING;`;
}).join("\n");
writeFileSync(join(outDir, "categories.sql"), sql);
console.log("SQL categories:", CATEGORY_SPECS.length);

// 4. Validation report
const invalid = lib.items.filter((i) => !i.title || !i.description || !i.type || !i.category);
console.log("Invalid items:", invalid.length);
writeFileSync(join(outDir, "validation.json"), JSON.stringify({ invalid: invalid.length, total: lib.items.length }, null, 2));

console.log("Materialization complete. Output in", outDir);
