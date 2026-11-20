/**
 * capture-home-orb — render the Home-tab orb into film-ready assets.
 *
 * The Home orb is the CSS orb inside `PureConsciousnessMeditation`
 * (`src/components/home/PureConsciousnessMeditation.tsx`): amber sphere,
 * breathing halo, slow conic sheen. `public/home-orb.html` mirrors that markup
 * so the same light can be captured without an authenticated session.
 *
 * Usage:
 *   node scripts/capture-home-orb.mjs                 # still + loop + overlays
 *   ORB_STILL_ONLY=1 node scripts/capture-home-orb.mjs
 *   APP_URL=http://localhost:8081 node scripts/capture-home-orb.mjs
 *
 * Output:
 *   public/orb-home.png            2160×2160 still on black (Home-tab orb)
 *   public/orb-home-alpha.png      2160×2160 still with alpha (editors)
 *   content/video/home-orb.png     film-manifest asset (black background)
 *   public/orb.mp4                 20s loop (2 breaths + 1 sheen turn)
 *   content/video/delivery/orb-*   green-screen / alpha overlays (film lib)
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { ensureOrbOverlays } from "./lib/film-media.mjs";

const ROOT = process.cwd();
const APP_URL = process.env.APP_URL || "http://localhost:8081";
const BASE = APP_URL.replace(/\/$/, "");

const PUBLIC_PNG = path.join(ROOT, "public", "orb-home.png");
const PUBLIC_ALPHA = path.join(ROOT, "public", "orb-home-alpha.png");
const FILM_PNG = path.join(ROOT, "content", "video", "home-orb.png");
const CLIP = path.join(ROOT, "public", "orb.mp4");
const BUILD = path.join(ROOT, "content", "video", "_build");
const FRAMES = path.join(BUILD, "orb-frames");

const SIZE = 1080;
const DSF = Number(process.env.ORB_DSF || 2);
const FILM_W = 1920;
const FILM_H = 1080;
const FILM_DSF = Number(process.env.ORB_FILM_DSF || 1.5);
const FPS = 30;
const LOOP_SECONDS = Number(process.env.ORB_SECONDS || 10);
const HUE = Number(process.env.ORB_HUE || 38);
const STILL_ONLY = process.env.ORB_STILL_ONLY === "1";

const log = (...a) => console.log(...a);

async function open(browser, { dsf = 1, query = "", width = SIZE, height = SIZE } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: dsf,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/home-orb.html?hue=${HUE}${query}`, { waitUntil: "load" });
  await page.waitForFunction(() => !!window.HomeOrb, null, { timeout: 15000 });
  return { ctx, page };
}

async function main() {
  const ok = await fetch(`${BASE}/home-orb.html`).then((r) => r.ok).catch(() => false);
  if (!ok) throw new Error(`home-orb.html not reachable at ${BASE} — start the dev server first.`);
  await mkdir(BUILD, { recursive: true });

  const browser = await chromium.launch();

  // ---------- stills ----------
  // Mid-breath: halo at full brightness, sphere at rest.
  const still = await open(browser, { dsf: DSF, query: "&static=1&freeze=0.5" });
  await still.page.evaluate(() => window.HomeOrb.freezeAt(5));
  await still.page.waitForTimeout(400);
  await still.page.screenshot({ path: PUBLIC_PNG });
  await still.ctx.close();

  const alpha = await open(browser, { dsf: DSF, query: "&transparent=1&field=0&sheen=0" });
  await alpha.page.evaluate(() => window.HomeOrb.freezeAt(5));
  await alpha.page.waitForTimeout(400);
  await alpha.page.screenshot({ path: PUBLIC_ALPHA, omitBackground: true });
  await alpha.ctx.close();

  // Widescreen still for the film. The scene pipeline crops to 16:9, so the
  // asset is composed 16:9 rather than cropped out of the square still.
  const filmStill = await open(browser, {
    dsf: FILM_DSF,
    width: FILM_W,
    height: FILM_H,
    query: "&static=1",
  });
  await filmStill.page.evaluate(() => window.HomeOrb.freezeAt(5));
  await filmStill.page.waitForTimeout(400);
  await filmStill.page.screenshot({ path: FILM_PNG });
  await filmStill.ctx.close();

  log(`· home orb still -> ${path.relative(ROOT, PUBLIC_PNG)} (${SIZE * DSF}px)`);
  log(`· film still -> ${path.relative(ROOT, FILM_PNG)} (${FILM_W * FILM_DSF}×${FILM_H * FILM_DSF})`);

  if (STILL_ONLY) {
    await browser.close();
    return;
  }

  // ---------- loop ----------
  // Frames are frozen at exact animation times, so the clip loops seam-free:
  // both the 10s breath and the sheen divide the loop length.
  await rm(FRAMES, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });

  const total = LOOP_SECONDS * FPS;
  const frames = await open(browser);
  await frames.page.evaluate((d) => {
    document.querySelector(".sheen").style.animationDuration = `${d}s`;
  }, LOOP_SECONDS);
  log(`· rendering ${total} frames (${LOOP_SECONDS}s @ ${FPS}fps)`);
  for (let i = 0; i < total; i += 1) {
    await frames.page.evaluate((t) => window.HomeOrb.freezeAt(t), i / FPS);
    await frames.page.screenshot({ path: path.join(FRAMES, `${String(i).padStart(4, "0")}.png`) });
    if (i % 60 === 0) process.stdout.write(`  ${i}/${total}\n`);
  }
  await frames.ctx.close();
  await browser.close();

  execFileSync(
    "ffmpeg",
    [
      "-hide_banner", "-loglevel", "error", "-y",
      "-framerate", String(FPS),
      "-i", path.join(FRAMES, "%04d.png"),
      "-vf", "format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", "18",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart",
      CLIP,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  await rm(FRAMES, { recursive: true, force: true });
  log(`· home orb loop -> ${path.relative(ROOT, CLIP)}`);

  const overlays = ensureOrbOverlays(ROOT, { seconds: 12, fps: FPS, force: true, log });
  if (overlays) log("· orb overlays refreshed for editors");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
