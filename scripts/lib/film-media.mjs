import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

export const GEN_DIR = path.join("content", "video", "generated");
export const DELIVERY_DIR = path.join("content", "video", "deliverables");
export const AUDIO_DIR = path.join("content", "video", "audio");

export const ORB_CLIP = path.join("public", "orb.mp4");
export const ORB_STILL = "content/video/home-orb.png";

export function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, ...opts });
}

export function durationOf(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" }
  ).trim();
  return parseFloat(out);
}

function mkdirp(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isFresh(outFile, sources = []) {
  if (!fs.existsSync(outFile)) return false;
  const outTime = fs.statSync(outFile).mtimeMs;
  return sources.every((s) => (fs.existsSync(s) ? fs.statSync(s).mtimeMs <= outTime : true));
}

/**
 * Big bang / singularity bloom. Procedural, gold-cream tint to match the film grade.
 */
export function ensureBigBang(root, { seconds = 8, fps = 30, force = false, log = () => {} } = {}) {
  const outFile = path.join(root, GEN_DIR, "bigbang.mp4");
  if (!force && isFresh(outFile)) return outFile;
  mkdirp(path.dirname(outFile));

  const W = 960;
  const H = 540;
  const r = "(hypot(X-W/2,Y-H/2)/(H/2))";
  const core = `exp(-pow(${r}/(0.05+0.05*T),2))*(1-min(1,T/7))`;
  const shell = `exp(-pow((${r}-0.07-0.1*T)/0.05,2))*(0.55+0.45*sin(60*${r}-5*T))`;
  const halo = `0.06*exp(-pow(${r}/1.4,2))`;
  const gate = `min(1,T/0.6)*max(0,1-max(0,T-${(seconds - 1).toFixed(1)})/1)`;
  const v = `min(1,max(0,(${core}*1.15+${shell}*0.9+${halo})*${gate}))`;

  log("· big bang clip");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${fps}:d=${seconds}`,
    "-vf", [
      "format=rgb24",
      `geq=r='min(255,max(0,${v}*255))':g='min(255,max(0,${v}*210+${core}*40))':b='min(255,max(0,${v}*140+${core}*90))'`,
      "format=yuv420p",
      "scale=1920:1080:flags=lanczos",
      "gblur=sigma=1.2",
      "noise=alls=4:allf=t",
    ].join(","),
    "-t", String(seconds),
    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    outFile,
  ]);
  return outFile;
}

/**
 * Black hole: lensed starfield + rotating accretion ring, used as the attention-economy metaphor.
 */
export function ensureBlackHole(root, { seconds = 7, fps = 30, force = false, log = () => {} } = {}) {
  const outFile = path.join(root, GEN_DIR, "blackhole.mp4");
  if (!force && isFresh(outFile)) return outFile;
  mkdirp(path.dirname(outFile));

  const W = 960;
  const H = 540;
  const r = "(hypot(X-W/2,Y-H/2)/(H/2))";
  const xr = `(W/2+(X-W/2)*(1-0.38*exp(-pow(${r}/0.55,2))))`;
  const yr = `(H/2+(Y-H/2)*(1-0.38*exp(-pow(${r}/0.55,2))))`;
  const stars = `gt(mod(abs(sin(${xr}*12.9898+${yr}*78.233)*43758.5453),1),0.9965)*0.9`;
  const ring = `exp(-pow((${r}-0.185)/0.018,2))*(0.6+0.4*sin(3*atan2(Y-H/2,X-W/2)+4*T))`;
  const disk = `exp(-pow((${r}-0.23)/0.07,2))*0.55*(0.5+0.5*sin(5*atan2(Y-H/2,(X-W/2)*2.4)-2.5*T))`;
  const halo = `0.10*exp(-pow(${r}/1.1,2))`;
  const horizon = `min(1,max(0,(${r}-0.155)/0.012))`;
  const v = `min(1,(${stars}+${ring}+${disk}+${halo})*${horizon}*min(1,T/0.9))`;

  log("· black hole clip");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", `color=c=black:s=${W}x${H}:r=${fps}:d=${seconds}`,
    "-vf", [
      "format=rgb24",
      `geq=r='min(255,max(0,${v}*250))':g='min(255,max(0,${v}*190))':b='min(255,max(0,${v}*130+${ring}*60))'`,
      "format=yuv420p",
      "scale=1920:1080:flags=lanczos",
      "gblur=sigma=1.0",
      "noise=alls=4:allf=t",
    ].join(","),
    "-t", String(seconds),
    "-c:v", "libx264", "-preset", "medium", "-crf", "20",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    outFile,
  ]);
  return outFile;
}

/**
 * Orb eigen-tone bed: resonant spherical-harmonic style partials plus an activation bloom.
 * A real recording wins if present at content/video/audio/orb-eigen.wav
 */
export function ensureOrbEigen(root, { seconds = 24, force = false, log = () => {} } = {}) {
  const override = path.join(root, AUDIO_DIR, "orb-eigen.wav");
  if (fs.existsSync(override)) return override;

  const outFile = path.join(root, GEN_DIR, "orb-eigen.wav");
  if (!force && isFresh(outFile)) return outFile;
  mkdirp(path.dirname(outFile));

  const base = 110;
  const partials = [
    [1, 0.060],
    [1.5, 0.034],
    [2, 0.028],
    [2.5, 0.016],
    [3, 0.013],
    [4, 0.009],
    [5, 0.007],
    [6, 0.005],
    [8, 0.003],
  ];
  const tone = partials
    .map(
      ([ratio, amp], i) =>
        `${amp}*sin(2*PI*${(base * ratio).toFixed(2)}*t+${(i * 0.7).toFixed(2)})*(0.6+0.4*sin(2*PI*${(0.031 + i * 0.009).toFixed(3)}*t+${i}))`
    )
    .join("+");
  const bloom = `0.075*sin(2*PI*880*t)*exp(-2.0*t)+0.05*sin(2*PI*1318.51*t)*exp(-2.6*t)+0.035*sin(2*PI*(180+140*t)*t)*exp(-1.1*t)`;
  const expr = `${tone}+${bloom}`;

  log("· orb eigen tone");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", `aevalsrc='${expr}':s=48000:d=${seconds}`,
    "-af", [
      "highpass=f=60",
      "lowpass=f=2600",
      "aecho=0.8:0.7:140:0.25",
      "afade=t=in:st=0:d=0.8",
      `afade=t=out:st=${Math.max(seconds - 1.2, 0).toFixed(1)}:d=1.2`,
    ].join(","),
    "-ac", "2", "-c:a", "pcm_s16le",
    outFile,
  ]);
  return outFile;
}

/**
 * Orb overlays for editors: chroma-green mp4, VP9 alpha webm, ProRes 4444 alpha mov.
 */
export function ensureOrbOverlays(root, { seconds = 12, fps = 30, force = false, log = () => {} } = {}) {
  const orbSrc = path.join(root, ORB_CLIP);
  if (!fs.existsSync(orbSrc)) {
    log("· orb clip missing, skipping overlays");
    return null;
  }

  const green = path.join(root, DELIVERY_DIR, "orb-on-green-1080p.mp4");
  const webm = path.join(root, DELIVERY_DIR, "orb-alpha-1080p.webm");
  const prores = path.join(root, DELIVERY_DIR, "orb-alpha-1080p.mov");
  mkdirp(path.dirname(green));
  if (!force && isFresh(green, [orbSrc]) && isFresh(webm, [orbSrc]) && isFresh(prores, [orbSrc])) {
    return { green, webm, prores };
  }

  const keyed = [
    "scale=900:-1",
    "format=rgba",
    "lumakey=threshold=0.10:softness=0.22",
    "eq=brightness='0.035*sin(2*PI*t/7)':eval=frame",
  ].join(",");

  log("· orb green-screen overlay");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-stream_loop", "-1", "-t", String(seconds), "-i", orbSrc,
    "-f", "lavfi", "-i", `color=c=0x00B140:s=1920x1080:r=${fps}:d=${seconds}`,
    "-filter_complex",
    [
      `[0:v]${keyed}[orb]`,
      "[1:v]format=rgba[bg]",
      "[bg][orb]overlay=(W-w)/2:(H-h)/2:format=auto:shortest=0,format=yuv420p[out]",
    ].join(";"),
    "-map", "[out]", "-an",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18",
    "-pix_fmt", "yuv420p", "-r", String(fps),
    "-movflags", "+faststart",
    green,
  ]);

  log("· orb alpha webm");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-stream_loop", "-1", "-t", String(seconds), "-i", orbSrc,
    "-vf", [
      "scale=900:-1",
      "format=yuva420p",
      "lumakey=threshold=0.10:softness=0.22",
      "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "format=yuva420p",
    ].join(","),
    "-an",
    "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
    "-b:v", "0", "-crf", "30", "-auto-alt-ref", "0",
    "-row-mt", "1", "-r", String(fps),
    webm,
  ]);

  log("· orb prores 4444 alpha");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-stream_loop", "-1", "-t", String(seconds), "-i", orbSrc,
    "-vf", [
      "scale=900:-1",
      "format=yuva444p10le",
      "lumakey=threshold=0.10:softness=0.22",
      "pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "format=yuva444p10le",
    ].join(","),
    "-an",
    "-c:v", "prores_ks", "-profile:v", "4444",
    "-pix_fmt", "yuva444p10le",
    prores,
  ]);

  return { green, webm, prores };
}

export function readEnvKey(root, key) {
  if (process.env[key]) return process.env[key];
  const envFile = path.join(root, ".env");
  if (!fs.existsSync(envFile)) return "";
  const line = fs
    .readFileSync(envFile, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${key}=`));
  if (!line) return "";
  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

/**
 * Deepgram Aura-2 voiceover. Falls back silently (returns false) when no key is configured.
 */
export async function deepgramVoiceover({
  root,
  manifest,
  voDir,
  apiKey,
  model = "aura-2-orpheus-en",
  log = () => {},
}) {
  if (!apiKey) return false;
  mkdirp(voDir);
  const scenes = manifest.scenes.filter((s) => s.vo);
  for (const s of scenes) {
    const outFile = path.join(voDir, `vo-${s.id}.wav`);
    if (fs.existsSync(outFile) && !process.env.FILM_FORCE_VO) continue;
    const url =
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(model)}` +
      `&encoding=linear16&sample_rate=48000&container=wav`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: s.vo }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Deepgram TTS failed for ${s.id}: ${res.status} ${body.slice(0, 300)}`);
    }
    fs.writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    log(`  deepgram vo ${s.id}`);
  }
  return true;
}
