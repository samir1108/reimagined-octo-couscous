const CURRENT =
  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cinzel:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap";

// Trimmed: drop Inter 800/900 (0 usages), drop Playfair italic (unused),
// drop DM Sans italic, trim Space Grotesk to 400/500/600.
const TRIMMED =
  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Space+Grotesk:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&family=Cinzel:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function analyze(label, url) {
  const css = await (await fetch(url, { headers: { "User-Agent": UA } })).text();
  const files = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  const unique = [...new Set(files)];
  console.log(`\n=== ${label} ===`);
  console.log(`  css: ${css.length} bytes`);
  console.log(`  @font-face blocks: ${(css.match(/@font-face/g) || []).length}`);
  console.log(`  unique woff2 files: ${unique.length}`);
  const byFam = new Map();
  for (const u of unique) {
    const m = u.match(/\/s\/([^/]+)\/v\d+\/([^/]+)\//);
    const k = m ? `${m[1]} ${m[2]}` : u.split("/").pop();
    byFam.set(k, (byFam.get(k) || 0) + 1);
  }
  for (const [k, n] of [...byFam.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`     ${String(n).padStart(3)}  ${k}`);
  }
  // total bytes of the font files (latin subset only is what most users hit)
  let total = 0;
  for (const u of unique) {
    const r = await fetch(u, { method: "HEAD" });
    total += Number(r.headers.get("content-length") || 0);
  }
  console.log(`  total font bytes (all subsets): ${(total / 1024).toFixed(1)} KB`);
  return { files: unique.length, total };
}

const a = await analyze("CURRENT", CURRENT);
const b = await analyze("TRIMMED", TRIMMED);
console.log(
  `\n=> files ${a.files} -> ${b.files}, bytes ${(a.total / 1024).toFixed(1)} KB -> ${(b.total / 1024).toFixed(1)} KB`
);
