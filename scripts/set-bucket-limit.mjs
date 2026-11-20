#!/usr/bin/env node
/** Check + raise the Supabase storage bucket file-size limit, and read quota. */
import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const BASE = (env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH = { Authorization: `Bearer ${KEY}`, apikey: KEY, "Content-Type": "application/json" };
const BUCKET = "media";

const list = await (await fetch(`${BASE}/storage/v1/bucket`, { headers: AUTH })).json();
const bucket = (Array.isArray(list) ? list : []).find((b) => b.name === BUCKET);
console.log("bucket before:", JSON.stringify(bucket));

for (const limit of [104857600, 209715200, 524288000]) {
  const res = await fetch(`${BASE}/storage/v1/bucket/${BUCKET}`, {
    method: "PUT",
    headers: AUTH,
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: limit }),
  });
  const body = await res.text();
  console.log(`set file_size_limit=${limit} -> ${res.status} ${body.slice(0, 160)}`);
  if (res.ok) break;
}

const after = (await (await fetch(`${BASE}/storage/v1/bucket`, { headers: AUTH })).json()).find((b) => b.name === BUCKET);
console.log("bucket after:", JSON.stringify(after));
