import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  localStorage.setItem("satyug-app_intro_seen", "true");
});
await page.goto("http://127.0.0.1:5177/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(3000);

const info = await page.evaluate(() => {
  const el = document.getElementById("human-question");
  const rect = el.getBoundingClientRect();
  const stage = el.querySelector("div");
  const p = el.querySelectorAll("p");
  return {
    scrollY: window.scrollY,
    docHeight: document.body.scrollHeight,
    sectionTop: rect.top + window.scrollY,
    sectionHeight: rect.height,
    stagePosition: getComputedStyle(stage).position,
    pCount: p.length,
    opacities: Array.from(p).slice(0, 6).map((x) => ({
      text: (x.textContent || "").slice(0, 28),
      opacity: getComputedStyle(x).opacity,
      parentOpacity: getComputedStyle(x.parentElement).opacity,
    })),
  };
});
console.log(JSON.stringify(info, null, 2));

await page.evaluate(() => {
  const el = document.getElementById("human-question");
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 1500, behavior: "instant" });
});
await page.waitForTimeout(1500);

const after = await page.evaluate(() => {
  const el = document.getElementById("human-question");
  const p = el.querySelectorAll("p");
  return {
    scrollY: window.scrollY,
    opacities: Array.from(p).slice(0, 6).map((x) => ({
      text: (x.textContent || "").slice(0, 28),
      opacity: getComputedStyle(x).opacity,
      parentOpacity: getComputedStyle(x.parentElement).opacity,
    })),
  };
});
console.log(JSON.stringify(after, null, 2));

await browser.close();
