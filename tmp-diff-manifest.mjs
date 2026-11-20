import fs from "node:fs";

const m = JSON.parse(fs.readFileSync("D:/final/sat-yug/src/lib/media/cdn-public.json", "utf8"));
const local = fs.readFileSync("D:/final/sat-yug/public/asset-manifest.json");
const res = await fetch(m.assets["asset-manifest.json"].url);
const remote = Buffer.from(await res.arrayBuffer());

console.log("lengths:", local.length, remote.length);

// find first difference
let i = 0;
while (i < Math.min(local.length, remote.length) && local[i] === remote[i]) i++;
console.log("first difference at byte:", i);
if (i < local.length) {
  console.log("  local :", JSON.stringify(local.slice(Math.max(0, i - 60), i + 60).toString()));
  console.log("  remote:", JSON.stringify(remote.slice(Math.max(0, i - 60), i + 60).toString()));
}

// parse both and compare structurally
const l = JSON.parse(local.toString());
const r = JSON.parse(remote.toString());
console.log("\nlocal  files:", l.files?.length, "uploaded_at:", l.uploaded_at);
console.log("remote files:", r.files?.length, "uploaded_at:", r.uploaded_at);
const ls = JSON.stringify(l.files);
const rs = JSON.stringify(r.files);
console.log("files arrays identical:", ls === rs);
if (ls !== rs) {
  for (let k = 0; k < l.files.length; k++) {
    if (JSON.stringify(l.files[k]) !== JSON.stringify(r.files[k])) {
      console.log("  first differing entry:", k);
      console.log("    local :", JSON.stringify(l.files[k]).slice(0, 250));
      console.log("    remote:", JSON.stringify(r.files[k]).slice(0, 250));
      break;
    }
  }
}
