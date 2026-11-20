/**
 * capture-screens — app screenshot + walkthrough-video pipeline.
 *
 * Usage:
 *   node scripts/capture-screens.mjs --login      # ONE TIME: opens real Chrome (system profile at
 *                                                # .chrome-profile/), you sign in, session persists
 *   node scripts/capture-screens.mjs              # captures every reachable screen, desktop + mobile
 *   node scripts/capture-screens.mjs --video      # also records a full walkthrough video + frames
 *   APP_URL=http://localhost:4173 node scripts/capture-screens.mjs
 *
 * Output: docs/captures/<desktop|mobile>/<name>.png (+ -full.png), manifest.json,
 * and docs/captures/video/ for the walkthrough.
 */
import { chromium } from "playwright";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.APP_URL || "http://localhost:8080";
const OUT_DIR = "docs/captures";
const PROFILE_DIR = ".chrome-profile";
const VIDEO_DIR = path.join(OUT_DIR, "video");
const PUB_DIR = "public/app-captures";
const LANDING_DIR = "public/landing/app-screens";
const LANDING_MOBILE_DIR = "public/landing/mobile";

/**
 * Landing-page screenshot names.
 *
 * The cinematic landing page (`src/components/cinematic-landing/`) points at
 * these paths. A route without a capture falls back to a faithful DOM
 * recreation, so a missing entry is never a broken image.
 */
const LANDING_SHOTS = {
  "01-experience": "experience.png",
  "02-loops-atlas": "loops-atlas.png",
  "03-loops": "loops.png",
  "04-knowledge": "knowledge.png",
  "05-handbook": "handbook.png",
  "06-app-intro": "app-intro.png",
  "10-home": "home.png",
  "12-practice": "orb-session.png",
  "15-analytics": "consciousness-map.png",
  "22-journeys": "journey.png",
  "23-settings": "profile.png",
};

/**
 * Mobile captures for the landing page's phone-frame showcase.
 *
 * `public/landing/mobile/<name>.png` — portrait 390x844 @2x.
 */
const LANDING_MOBILE = {
  "01-experience": "experience",
  "02-loops-atlas": "loops-atlas",
  "03-loops": "loops",
  "04-knowledge": "knowledge",
  "05-handbook": "handbook",
  "06-app-intro": "app-intro",
  "07-experience-paths": "paths",
  "08-experience-programs": "programs",
  "09-experience-games": "games",
  "10-experience-practices": "practices",
  "11-experience-lineage": "lineage",
  "12-experience-glossary": "glossary",
  "13-knowledge-graph": "knowledge-graph",
  "14-app-intro-scenes": "intro",
  "10-home": "home",
};

const DESKTOP = { width: 1920, height: 1080 };
const MOBILE = {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

/** name, path, auth required?, extra settle ms (sessions animate in) */
const ROUTES = [
  { name: "01-experience", path: "/experience", auth: false },
  { name: "02-loops-atlas", path: "/experience/loops-atlas", auth: false },
  { name: "03-loops", path: "/loops", auth: false },
  { name: "04-knowledge", path: "/knowledge", auth: false },
  { name: "05-handbook", path: "/handbook", auth: false },
  { name: "06-app-intro", path: "/app-intro", auth: false },
  { name: "07-experience-paths", path: "/experience/paths", auth: false },
  { name: "08-experience-programs", path: "/experience/programs", auth: false },
  { name: "09-experience-games", path: "/experience/games", auth: false },
  { name: "10-experience-practices", path: "/experience/practices", auth: false },
  { name: "11-experience-lineage", path: "/experience/lineage", auth: false },
  { name: "12-experience-glossary", path: "/experience/glossary", auth: false },
  { name: "13-knowledge-graph", path: "/knowledge-graph", auth: false },
  { name: "14-app-intro-scenes", path: "/experience/intro", auth: false },
  { name: "10-home", path: "/app", auth: true, settle: 4500 },
  { name: "11-temple", path: "/temple", auth: true, settle: 4500 },
  { name: "12-practice", path: "/app/practice", auth: true },
  { name: "13-guide", path: "/app/guide", auth: true },
  { name: "14-journal", path: "/app/journal", auth: true },
  { name: "15-analytics", path: "/app/analytics", auth: true, settle: 5000 },
  { name: "16-programs", path: "/app/programs", auth: true },
  { name: "17-games", path: "/app/games", auth: true },
  { name: "18-library", path: "/app/library", auth: true },
  { name: "19-mirror", path: "/app/mirror", auth: true },
  { name: "20-masters", path: "/app/masters", auth: true },
  { name: "21-constellation", path: "/app/constellation", auth: true, settle: 5000 },
  { name: "22-journeys", path: "/app/journeys", auth: true },
  { name: "23-settings", path: "/app/settings", auth: true },
];

const SETTLE_MS = 3000;

async function launch(mode) {
  const viewport = mode === "mobile" ? MOBILE : DESKTOP;
  return chromium.launchPersistentContext(PROFILE_DIR, {
    channel: "chrome",
    headless: true,
    viewport,
    userAgent:
      mode === "mobile"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : undefined,
    args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
  });
}

async function settle(page, ms) {
  // never block on networkidle — the app keeps sockets open (realtime, version polling)
  await page.waitForLoadState("networkidle", { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(ms ?? SETTLE_MS);
  // dismiss first-run overlays (install PWA card, nudges) so the UI shows through
  for (const sel of ['button:has-text("Got it")', 'button:has-text("Dismiss")', 'button:has-text("Maybe later")']) {
    await page.click(sel, { timeout: 600 }).catch(() => {});
  }
  await page.waitForTimeout(400);
}

async function hasSession(page) {
  return page.evaluate(() =>
    Object.keys(localStorage).some((k) => k.includes("auth-token")),
  );
}

async function isLoggedIn(page) {
  await page.goto(`${BASE_URL}/app`, { waitUntil: "domcontentloaded", timeout: 90000 });
  // AppEntry shows a preloader while auth resolves, then redirects to /auth if
  // there is no session. Poll so we don't mistake the preloader for the app.
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (page.url().includes("/auth")) return false;
    if (await hasSession(page)) return true;
    await page.waitForTimeout(500);
  }
  return hasSession(page);
}

async function captureRoute(context, dir, route) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await settle(page, route.settle);

      // walk the page so lazy sections (images, virtualised lists) render
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 180));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);

      if (page.url().includes("/auth")) {
        await page.close();
        return { route: route.name, status: "skipped", reason: "not logged in" };
      }
      await page.screenshot({ path: path.join(dir, `${route.name}.png`), timeout: 60000, animations: "disabled" });
      await page.screenshot({
        path: path.join(dir, `${route.name}-full.png`),
        fullPage: true,
        timeout: 60000,
        animations: "disabled",
      });
      await page.close();
      return { route: route.name, status: "ok" };
    } catch (err) {
      lastErr = err;
      await page.close().catch(() => {});
      if (attempt === 2) {
        return { route: route.name, status: "failed", reason: String(err.message ?? err) };
      }
    }
  }
  return { route: route.name, status: "failed", reason: String(lastErr?.message ?? lastErr) };
}

async function captureAll() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.slice("--only=".length);
  const routes = only ? ROUTES.filter((r) => r.name.includes(only)) : ROUTES;
  if (only && routes.length === 0) {
    console.log(`No routes match "${only}".`);
    return [];
  }
  const results = [];
  for (const mode of ["desktop", "mobile"]) {
    const dir = path.join(OUT_DIR, mode);
    await mkdir(dir, { recursive: true });
    const context = await launch(mode);
    const probe = context.pages()[0] ?? (await context.newPage());
    const loggedIn = await isLoggedIn(probe);
    await probe.close().catch(() => {});
    console.log(`\n[${mode}] logged in: ${loggedIn ? "yes" : "no (protected routes will be skipped)"}`);
    for (const route of routes) {
      if (route.auth && !loggedIn) {
        results.push({ route: route.name, status: "skipped", reason: "not logged in", mode });
        console.log(`  skip  ${route.name} (needs login)`);
        continue;
      }
      const r = await captureRoute(context, dir, route);
      results.push({ ...r, mode });
      console.log(`  ${r.status === "ok" ? " ok  " : " fail"} ${route.name}${r.reason ? ` — ${r.reason}` : ""}`);
    }
    await context.close();
  }
  return results;
}

async function recordVideo() {
  await mkdir(VIDEO_DIR, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: "chrome",
    headless: true,
    viewport: DESKTOP,
    recordVideo: { dir: VIDEO_DIR, size: DESKTOP },
    args: ["--disable-blink-features=AutomationControlled", "--no-first-run"],
  });
  const page = await context.newPage();
  const loggedIn = await isLoggedIn(page);
  console.log(`\n[video] logged in: ${loggedIn ? "yes" : "no"}`);

  for (const route of ROUTES) {
    if (route.auth && !loggedIn) continue;
    if (route.path === "/app-intro") continue; // already scroll-driven; keep video short
    console.log(`  rec  ${route.name}`);
    try {
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
      await settle(page, 2200);
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.6;
        const height = document.body.scrollHeight;
        for (let y = 0; y < height; y += step) {
          window.scrollTo(0, y);
          await new Promise((res) => setTimeout(res, 320));
        }
      });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
    } catch (e) {
      console.log(`       failed: ${e.message}`);
    }
  }
  await context.close(); // flushes the video
  const { readdirSync } = await import("node:fs");
  const file = readdirSync(VIDEO_DIR).find((f) => f.endsWith(".webm"));
  console.log(`\n[video] saved docs/captures/video/${file}`);
  return file;
}

async function main() {
  if (!existsSync(PROFILE_DIR)) {
    console.log(`First run — a Chrome profile will be created at ${PROFILE_DIR}/`);
  }
  const withVideo = process.argv.includes("--video");

  if (process.argv.includes("--login")) {
    const context = await chromium.launchPersistentContext(PROFILE_DIR, {
      channel: "chrome",
      headless: false,
      viewport: DESKTOP,
      args: ["--no-first-run"],
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/auth`, { waitUntil: "domcontentloaded" });
    console.log("\n=== LOG IN NOW ===");
    console.log(`A Chrome window opened at ${BASE_URL}/auth. Sign in there,`);
    console.log("then come back here and press Enter to save the session.\n");
    await new Promise((resolve) => process.stdin.once("data", resolve));
    const ok = await isLoggedIn(page);
    console.log(ok ? "\nSession captured — future runs are logged in.\n" : "\nStill not logged in. Re-run --login.\n");
    await context.close();
    return;
  }

  if (process.argv.includes("--publish")) {
    const only = process.argv.find((a) => a.startsWith("--publish="))?.slice("--publish=".length);
    const copied = await publish(only);
    console.log(`Published ${copied.length} file(s) to ${PUB_DIR}/`);
    for (const f of copied) console.log(`  ${f}`);
    const landing = await publishLanding();
    console.log(`Published ${landing.length} landing shot(s) to ${LANDING_DIR}/`);
    for (const f of landing) console.log(`  ${f}`);
    const mobile = await publishLandingMobile();
    console.log(`Published ${mobile.length} landing mobile shot(s) to ${LANDING_MOBILE_DIR}/`);
    for (const f of mobile) console.log(`  ${f}`);
    return;
  }

  const results = await captureAll();
  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(results, null, 2));

  const ok = results.filter((r) => r.status === "ok").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  console.log(`\nDone: ${ok} captured, ${skipped} skipped, ${results.length - ok - skipped} failed.`);
  console.log(`Manifest: ${OUT_DIR}/manifest.json`);

  if (withVideo) {
    const video = await recordVideo();
    console.log(`Walkthrough video: docs/captures/video/${video}`);
    console.log("Extract frames with:");
    console.log(`  ffmpeg -i docs/captures/video/${video} -vf "fps=1/3,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" docs/captures/video/frame-%03d.png`);
  }
}

/**
 * Copy portrait captures into public/landing/mobile/ for the landing page's
 * phone-frame showcase.
 */
async function publishLandingMobile() {
  await mkdir(LANDING_MOBILE_DIR, { recursive: true });
  const copied = [];
  for (const [routeName, slug] of Object.entries(LANDING_MOBILE)) {
    const src = path.join(OUT_DIR, "mobile", `${routeName}.png`);
    if (!existsSync(src)) continue;
    const dest = path.join(LANDING_MOBILE_DIR, `${slug}.png`);
    await copyFile(src, dest);
    copied.push(dest);
  }
  return copied;
}

/**
 * Copy captured shots into public/landing/app-screens/ under the names the
 * cinematic landing page references.
 */
async function publishLanding() {
  await mkdir(LANDING_DIR, { recursive: true });
  const copied = [];
  for (const [routeName, fileName] of Object.entries(LANDING_SHOTS)) {
    const src = path.join(OUT_DIR, "desktop", `${routeName}.png`);
    if (!existsSync(src)) continue;
    const dest = path.join(LANDING_DIR, fileName);
    await copyFile(src, dest);
    copied.push(dest);
  }
  return copied;
}

/**
 * Copy captured shots into public/app-captures/ with tour-ready names:
 *   <route>-desktop.png / <route>-mobile.png  →  served at /app-captures/<...>
 * Usage: node scripts/capture-screens.mjs --publish[=temple]
 */
async function publish(only) {
  await mkdir(PUB_DIR, { recursive: true });
  const routes = only ? ROUTES.filter((r) => r.name.includes(only)) : ROUTES;
  const copied = [];
  for (const route of routes) {
    for (const mode of ["desktop", "mobile"]) {
      const src = path.join(OUT_DIR, mode, `${route.name}.png`);
      if (!existsSync(src)) continue;
      const dest = path.join(PUB_DIR, `${route.name}-${mode}.png`);
      await copyFile(src, dest);
      copied.push(dest);
    }
  }
  return copied;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
