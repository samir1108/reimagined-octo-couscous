import { chromium } from "playwright";

const routes = ["/launch", "/experience", "/experience/intro", "/temple", "/showroom", "/app-intro"];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("hope-app-user-language", "hi");
    localStorage.setItem("satyug-language-chosen", "1");
  } catch {}
});
const page = await ctx.newPage();

for (const route of routes) {
  await page.goto(`http://127.0.0.1:8081${route}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(18000);
  const report = await page.evaluate(() => {
    const frames = [];
    for (const frame of Array.from(document.querySelectorAll("iframe"))) {
      try {
        const doc = frame.contentDocument;
        if (!doc || !doc.body) {
          frames.push({ src: frame.getAttribute("src"), accessible: false });
          continue;
        }
        const bad = [];
        const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walker.nextNode())) {
          const t = (n.nodeValue || "").trim();
          if (!t || t.length < 2 || !/[A-Za-z]/.test(t) || /[\u0900-\u097F]/.test(t)) continue;
          bad.push(t.slice(0, 60));
        }
        frames.push({
          src: frame.getAttribute("src"),
          accessible: true,
          englishLeft: bad.length,
          sample: bad.slice(0, 6),
        });
      } catch (e) {
        frames.push({ src: frame.getAttribute("src"), accessible: false, error: String(e).slice(0, 80) });
      }
    }
    return { route: location.pathname, frames };
  });
  console.log(JSON.stringify(report));
}

await browser.close();
