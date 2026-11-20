import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const DIST = resolve("dist");
const PORT = 4201;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".webp": "image/webp", ".mp4": "video/mp4" };

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
    res.end("nf");
  }
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => localStorage.setItem("satyug-app_intro_seen", "true"));
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "load", timeout: 60000 });
await page.waitForSelector("#human-question", { timeout: 30000 });
await page.waitForTimeout(2500);

const info = await page.evaluate(() => {
  const section = document.getElementById("human-question");
  const stage = section.firstElementChild;
  const shot = stage.querySelector("div");
  const img = shot?.querySelector("img");
  const cs = shot ? getComputedStyle(shot) : null;
  return {
    stageRect: stage.getBoundingClientRect().toJSON(),
    shotClass: shot?.className,
    shotRect: shot?.getBoundingClientRect().toJSON(),
    shotPosition: cs?.position,
    shotHeight: cs?.height,
    imgSrc: img?.currentSrc?.slice(0, 120),
    imgComplete: img?.complete,
    imgNatural: img ? { w: img.naturalWidth, h: img.naturalHeight } : null,
    imgDisplay: img ? getComputedStyle(img).display : null,
    imgRect: img?.getBoundingClientRect().toJSON(),
  };
});
console.log(JSON.stringify(info, null, 2));

await browser.close();
server.close();
process.exit(0);
