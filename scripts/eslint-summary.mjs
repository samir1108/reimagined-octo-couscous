import { readFileSync } from "node:fs";

const file = process.argv[2];
const results = JSON.parse(readFileSync(file, "utf8"));
const byRule = new Map();
const byFile = new Map();

for (const result of results) {
  const rel = result.filePath.replace(/\\/g, "/").replace(/.*sat-yug\//, "");
  for (const m of result.messages) {
    if (m.severity !== 2) continue;
    const rule = m.ruleId ?? "PARSE_ERROR";
    byRule.set(rule, (byRule.get(rule) ?? 0) + 1);
    byFile.set(`${rule}|${rel}`, (byFile.get(`${rule}|${rel}`) ?? 0) + 1);
  }
}

const sortDesc = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);
console.log("== errors by rule ==");
for (const [rule, count] of sortDesc(byRule).slice(0, 15)) console.log(String(count).padStart(6), rule);
console.log("\n== top 30 rule/file ==");
for (const [key, count] of sortDesc(byFile).slice(0, 30)) {
  const [rule, rel] = key.split("|");
  console.log(String(count).padStart(5), rule.padEnd(38), rel);
}
