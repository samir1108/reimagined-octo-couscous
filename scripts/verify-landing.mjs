import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.APP_URL || "http://127.0.0.1:4173";
const OUT = "docs/landing-verify";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.addInitScript(() => {
  window.localStorage.setItem("satyug-app_intro_seen", "true");
});

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(`PAGEERROR: ${err.message}`));

await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(7000);

const checks = await page.evaluate(() => {
  const text = document.body.innerText.toLowerCase();
  const required = [
    "mapped and met",
    "begin your journey",
    "the brain",
    "the engine room",
    "every session has a purpose",
    "closed loop",
    "credits that fuel your awakening",
    "the app",
  ];
  return required.map((needle) => ({
    needle,
    present: text.includes(needle),
  }));
});

const phoneImgs = await page.evaluate(() =>
  [...document.querySelectorAll("img")]
    .filter((img) => img.src.includes("/landing/mobile/"))
    .map((img) => ({ src: img.src.split("/").pop(), loaded: img.complete && img.naturalWidth > 0 })),
);

await page.screenshot({ path: `${OUT}/hero.png`, fullPage: false });
await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: "instant" }));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/phones.png`, fullPage: false });
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "instant" }));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/story.png`, fullPage: false });
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - window.innerHeight, behavior: "instant" }));
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/pricing.png`, fullPage: false });

console.log("\n=== REQUIRED COPY ===");
for (const c of checks) console.log(`${c.present ? "ok  " : "MISS"} ${c.needle}`);

console.log("\n=== PHONE IMAGES ===");
console.log(`count=${phoneImgs.length}`);
for (const p of phoneImgs.slice(0, 8)) console.log(`  ${p.loaded ? "ok  " : "FAIL"} ${p.src}`);

console.log("\n=== CONSOLE ERRORS ===");
console.log(errors.length ? errors.slice(0, 20).join("\n") : "none");

await browser.close();

