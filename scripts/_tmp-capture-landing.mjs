import { createServer } from "node:http";
import { readFile, stat, mkdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const DIST = resolve("dist");
const PORT = 4199;
const OUT = "C:\\Users\\SAMIR\\AppData\\Local\\Temp\\kilo\\landing-shots";

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    let filePath = join(DIST, decodeURIComponent(url.pathname));
    try {
      const info = await stat(filePath);
      if (info.isDirectory()) filePath = join(filePath, "index.html");
    } catch {
      filePath = join(DIST, "index.html");
    }
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
console.log("server on", PORT);

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message.slice(0, 200)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 200));
});

await page.addInitScript(() => {
  localStorage.setItem("satyug-app_intro_seen", "true");
});
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#human-question", { timeout: 30000 });
await page.waitForTimeout(2500);

const ids = process.argv.slice(2);
for (const id of ids) {
  const box = await page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { top: rect.top + window.scrollY, height: rect.height, vh: window.innerHeight };
  }, id);

  if (!box) {
    console.log(`MISSING ${id}`);
    continue;
  }

  const range = box.height - box.vh;
  for (const p of [0.08, 0.32, 0.58, 0.86]) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.top + range * p);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}\\${id}-${String(Math.round(p * 100)).padStart(2, "0")}.png` });
  }
  console.log("captured", id);
}

console.log("ERRORS:", errors.length);
errors.slice(0, 10).forEach((e) => console.log(" -", e));

await browser.close();
server.close();
process.exit(0);
