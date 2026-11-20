#!/usr/bin/env node
/** Probe our Supabase project: buckets, size, and public URL reachability. */
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const url = (env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
console.log("project:", url, "| service key len:", key ? key.length : 0);

const auth = { Authorization: `Bearer ${key}`, apikey: key };

const bucketsRes = await fetch(`${url}/storage/v1/bucket`, { headers: auth });
console.log("list buckets status:", bucketsRes.status);
const buckets = await bucketsRes.json();
if (!Array.isArray(buckets)) {
  console.log("body:", JSON.stringify(buckets).slice(0, 300));
  process.exit(1);
}
for (const b of buckets) {
  console.log(`  - ${b.name} public=${b.public} created=${b.created_at} updated=${b.updated_at}`);
}

// Size probe: list recursively with pagination, sum sizes.
async function measure(bucket, prefix = "") {
  let total = 0;
  let count = 0;
  let stack = [prefix];
  while (stack.length) {
    const p = stack.pop();
    let offset = 0;
    for (;;) {
      const res = await fetch(
        `${url}/storage/v1/object/list/${bucket}?limit=1000&offset=${offset}${p ? `&prefix=${encodeURIComponent(p)}` : ""}`,
        { headers: auth },
      );
      if (!res.ok) {
        console.log("  list error", res.status);
        return { total, count };
      }
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        if (it.id) {
          total += it.size || 0;
          count += 1;
        } else if (it.name) {
          stack.push(p ? `${p}/${it.name}` : it.name);
        }
      }
      if (items.length < 1000) break;
      offset += items.length;
    }
  }
  return { total, count };
}

for (const b of buckets) {
  const { total, count } = await measure(b.name);
  console.log(`  ${b.name}: ${count} objects, ${(total / 1048576).toFixed(1)} MB`);
}
