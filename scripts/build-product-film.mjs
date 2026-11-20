import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "content", "video", "film-manifest.json");
const OUT_DIR = path.join(ROOT, "content", "video");
const BUILD = path.join(OUT_DIR, "_build");
const SEG = path.join(BUILD, "segments");
const VO = path.join(BUILD, "vo");
const TXT = path.join(BUILD, "text");
const FLT = path.join(BUILD, "filters");
const FINAL = path.join(OUT_DIR, "SATYUG-5MIN-PRODUCT-FILM.mp4");

const FONT_SERIF = "C\\:/Windows/Fonts/georgiab.ttf";
const FONT_SANS = "C\\:/Windows/Fonts/arialbd.ttf";

const GOLD = "0xF3C87A";
const CREAM = "0xFFF4DE";

const log = (...a) => console.log(...a);

function sh(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28, ...opts });
}

function dur(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" }
  ).trim();
  return parseFloat(out);
}

function fwd(p) {
  return p.replace(/\\/g, "/");
}

function filterPath(p) {
  return fwd(p).replace(/:/g, "\\:");
}

function drawtext({ text, file, font, size, color, y, fadeStart = 1.0 }) {
  const tf = filterPath(file);
  return [
    `drawtext=fontfile='${font}'`,
    `textfile='${tf}'`,
    `fontcolor=${color}`,
    `fontsize=${size}`,
    `x=(w-text_w)/2`,
    `y=${y}`,
    `shadowcolor=black@0.6`,
    `shadowx=0`,
    `shadowy=4`,`borderw=2`,`bordercolor=black@0.85`,
    `alpha='min(1,max(0,(t-${fadeStart})/0.7))'`,
  ].join(":");
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8").replace(/^\uFEFF/, ""));
  const { width, height, fps } = manifest;

  for (const d of [BUILD, SEG, VO, TXT, FLT]) fs.mkdirSync(d, { recursive: true });

  const missing = [];
  for (const s of manifest.scenes) {
    const p = path.join(ROOT, s.image);
    if (!fs.existsSync(p)) missing.push(s.image);
  }
  if (missing.length) {
    console.error("Missing images:\n" + missing.join("\n"));
    process.exit(1);
  }

  // ---------- 1. TEXT FILES ----------
  for (const s of manifest.scenes) {
    if (s.eyebrow) {
      const spaced = s.eyebrow.split(" ").join("   ");
      fs.writeFileSync(path.join(TXT, `${s.id}-eyebrow.txt`), spaced, "utf8");
    }
    if (s.head) fs.writeFileSync(path.join(TXT, `${s.id}-head.txt`), s.head, "utf8");
    if (s.sub) fs.writeFileSync(path.join(TXT, `${s.id}-sub.txt`), s.sub, "utf8");
  }

  // ---------- 2. VOICEOVER (Windows SAPI, offline) ----------
  log("· voiceover");
  const ttsPs1 = path.join(BUILD, "tts.ps1");
  fs.writeFileSync(
    ttsPs1,
    [
      "Add-Type -AssemblyName System.Speech",
      `$json = Get-Content -LiteralPath '${MANIFEST}' -Raw | ConvertFrom-Json`,
      "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer",
      `$s.SelectVoice('${manifest.voice}')`,
      `$s.Rate = 0`,
      "$s.Volume = 100",
      "foreach ($sc in $json.scenes) {",
      "  if ($sc.vo) {",
      `    $out = Join-Path '${VO}' ('vo-' + $sc.id + '.wav')`,
      "    if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -Force }",
      "    $s.SetOutputToWaveFile($out)",
      "    $s.Speak($sc.vo)",
      "    $s.SetOutputToNull()",
      "  }",
      "}",
      "$s.Dispose()",
    ].join("\r\n"),
    "utf8"
  );
  sh("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ttsPs1]);

  // ---------- 3. PER-SCENE PLAN ----------
  const base = manifest.scenes.map((s) => {
    const voFile = path.join(VO, `vo-${s.id}.wav`);
    const voDur = fs.existsSync(voFile) ? dur(voFile) : 0;
    return { ...s, voFile: fs.existsSync(voFile) ? voFile : null, voDur, dur: s.dur };
  });

  let voTempo = 1;
  const TARGET = 300;
  const fit = (k) =>
    base.map((s) => {
      const vo = s.voDur / k;
      const planned = vo > 0 ? Math.max(s.dur, vo + 1.4) : s.dur;
      const floor = Math.min(planned, Math.max(vo + 1.1, s.dur * 0.85));
      return { ...s, sceneDur: Math.round(Math.min(planned, Math.max(floor, 4)) * 2) / 2 };
    });

  let plan = fit(1);
  let total = plan.reduce((n, s) => n + s.sceneDur, 0);
  voTempo = 1;
  if (total > TARGET + 2) {
    let chosen = 1;
    for (let k = 1.01; k <= 1.16; k += 0.01) {
      const cand = fit(k);
      const t = cand.reduce((n, s) => n + s.sceneDur, 0);
      plan = cand;
      total = t;
      chosen = k;
      if (t <= TARGET + 2) break;
    }
    voTempo = chosen;
    if (chosen > 1.001) log(`· pacing nudge: VO at ${chosen.toFixed(2)}× to hit target`);
  }

  log(`· total runtime: ${total.toFixed(1)}s across ${plan.length} shots`);

  // ---------- 4. SEGMENTS ----------
  log("· rendering segments");
  plan.forEach((s, i) => {
    const frames = Math.round(s.sceneDur * fps);
    const segOut = path.join(SEG, `${s.id}.mp4`);
    const audOut = path.join(VO, `aud-${s.id}.wav`);
    const img = path.join(ROOT, s.image);

    if (fs.existsSync(segOut) && fs.existsSync(audOut) && !process.env.FILM_FORCE) {
      process.stdout.write(`  ${s.id}/${plan.length} cached\n`);
      return;
    }

    let zoom;
    if (s.motion === "out") zoom = `z='max(1.16-0.0011*on,1.0)'`;
    else if (s.motion === "pan") zoom = `z='1.09'`;
    else if (s.motion === "breath") zoom = `z='1.03+0.05*sin(2*PI*on/${fps * 8})'`;
    else zoom = `z='min(1.0+0.0011*on,1.16)'`;

    const x =
      s.motion === "pan"
        ? `x='(iw-iw/zoom)*(on/${Math.max(frames - 1, 1)})'`
        : `x='iw/2-(iw/zoom/2)'`;

    const chain = [
      `scale=2400:1350:force_original_aspect_ratio=increase`,
      `crop=2400:1350`,
      `setsar=1`,
      `zoompan=${zoom}:${x}:y='ih/2-(ih/zoom/2)':d=1:s=${width}x${height}:fps=${fps}`,
      `eq=contrast=1.06:saturation=0.9:brightness=-0.015`,
      `vignette=PI/4.6`,
    ];

    const overlay = chain.join(",");

    const textChain = [];

    if (s.eyebrow) {
      textChain.push(
        drawtext({
          file: path.join(TXT, `${s.id}-eyebrow.txt`),
          font: FONT_SANS,
          size: 26,
          color: GOLD,
          y: "h*0.655",
          fadeStart: 1.0,
        })
      );
    }
    if (s.head) {
      textChain.push(
        drawtext({
          file: path.join(TXT, `${s.id}-head.txt`),
          font: FONT_SERIF,
          size: 66,
          color: CREAM,
          y: s.eyebrow ? "h*0.695" : "h*0.72",
          fadeStart: 1.3,
        })
      );
    }
    if (s.sub) {
      textChain.push(
        drawtext({
          file: path.join(TXT, `${s.id}-sub.txt`),
          font: FONT_SANS,
          size: 30,
          color: GOLD,
          y: "h*0.805",
          fadeStart: 1.7,
        })
      );
    }

    textChain.push(`fade=t=in:st=0:d=0.7`);
    textChain.push(`fade=t=out:st=${(s.sceneDur - 0.7).toFixed(2)}:d=0.7`);
    textChain.push(`format=yuv420p`);

    const filterFile = path.join(FLT, `${s.id}.txt`);
    const graph = [
      `[0:v]${overlay}[base]`,
      `[1:v]format=rgba[scrim]`,
      `[base][scrim]overlay=0:0:format=auto[sc]`,
      `[sc]${textChain.join(",")}[out]`,
    ].join(";\n");
    fs.writeFileSync(filterFile, graph, "utf8");

    sh("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-loop", "1",
      "-framerate", String(fps),
      "-i", img,
      "-i", path.join(OUT_DIR, s.eyebrow || s.head || s.sub ? "scrim-strong.png" : "scrim.png"),
      "-filter_complex_script", filterFile,
      "-map", "[out]",
      "-frames:v", String(frames),
      "-an",
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "19",
      "-pix_fmt", "yuv420p",
      "-r", String(fps),
      segOut,
    ]);

    // per-scene VO bed, padded to scene length
    if (s.voFile) {
      let tempo = voTempo;
      const room = s.sceneDur - 1.2;
      if (s.voDur / tempo > room) tempo = Math.min(1.18, s.voDur / room);
      const atempoChain =
        tempo > 1.01
          ? tempo > 2
            ? [`atempo=2.0`, `atempo=${(tempo / 2).toFixed(3)}`]
            : [`atempo=${tempo.toFixed(3)}`]
          : [];
      const af = [
        "aresample=48000",
        "highpass=f=90",
        "lowpass=f=13000",
        "acompressor=threshold=0.12:ratio=3:attack=8:release=180",
        "aecho=0.7:0.5:45:0.09",
        ...atempoChain,
        "adelay=700|700",
        "apad",
      ].join(",");
      sh("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y",
        "-i", s.voFile,
        "-af", af,
        "-t", s.sceneDur.toFixed(2),
        "-ac", "1", "-ar", "48000", "-c:a", "pcm_s16le",
        audOut,
      ]);
    } else {
      sh("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y",
        "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono",
        "-t", s.sceneDur.toFixed(2),
        "-c:a", "pcm_s16le", audOut,
      ]);
    }

    process.stdout.write(`  ${s.id}/${plan.length} ${s.sceneDur}s\n`);
  });

  // ---------- 5. CONCAT ----------
  log("· concatenating");
  const vList = path.join(BUILD, "video-list.txt");
  fs.writeFileSync(
    vList,
    plan.map((s) => `file '${fwd(path.join(SEG, `${s.id}.mp4`))}'`).join("\n"),
    "utf8"
  );
  const silent = path.join(BUILD, "silent.mp4");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", vList,
    "-c", "copy", "-movflags", "+faststart", silent,
  ]);

  const aList = path.join(BUILD, "vo-list.txt");
  fs.writeFileSync(
    aList,
    plan.map((s) => `file '${fwd(path.join(VO, `aud-${s.id}.wav`))}'`).join("\n"),
    "utf8"
  );
  const voFull = path.join(BUILD, "vo-full.wav");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", aList,
    "-c", "copy", voFull,
  ]);

  // ---------- 6. SCORE ----------
  log("· scoring");
  const music = path.join(BUILD, "score.wav");
  const drone = [
    "0.045*sin(2*PI*110*t)*(0.65+0.35*sin(2*PI*0.07*t))",
    "0.030*sin(2*PI*164.81*t)*(0.6+0.4*sin(2*PI*0.053*t+1))",
    "0.022*sin(2*PI*220*t)*(0.5+0.5*sin(2*PI*0.031*t+2))",
    "0.010*sin(2*PI*329.63*t)*(0.5+0.5*sin(2*PI*0.017*t))",
    "0.050*sin(2*PI*880*t)*exp(-3*mod(t,22))",
  ].join("+");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", `aevalsrc='${drone}':s=48000:d=${total.toFixed(2)}`,
    "-af", "lowpass=f=1400,aecho=0.8:0.6:180:0.3,volume=0.9",
    "-ac", "1", "-c:a", "pcm_s16le", music,
  ]);

  // ---------- 7. MIX ----------
  log("· mixing");
  sh("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", silent,
    "-i", voFull,
    "-i", music,
    "-filter_complex",
    "[1:a]volume=1.0,apad[vo];[2:a]volume=0.16[m];[vo][m]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "copy",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
    "-shortest", "-movflags", "+faststart",
    FINAL,
  ]);

  // ---------- 8. RECEIPT ----------
  const finalDur = dur(FINAL);
  const receipt = {
    film: path.basename(FINAL),
    duration_s: Number(finalDur.toFixed(2)),
    resolution: `${width}x${height}`,
    fps,
    voice: manifest.voice,
    scenes: plan.map((s) => ({
      id: s.id,
      beat: s.beat,
      image: s.image,
      motion: s.motion,
      duration_s: s.sceneDur,
      vo: s.vo ?? null,
    })),
    audio: {
      vo: "Windows SAPI (scratch) — swap for ElevenLabs voice_samir_v1",
      score: "procedural tanpura drone + 22s bell, -16 LUFS",
      music_gain: "-16 dB under VO",
    },
    generated: new Date().toISOString(),
  };
  fs.writeFileSync(
    path.join(OUT_DIR, "production-receipt.json"),
    JSON.stringify(receipt, null, 2),
    "utf8"
  );

  const sizeMb = (fs.statSync(FINAL).size / 1048576).toFixed(1);
  log(`\nDONE  ${FINAL}`);
  log(`      ${finalDur.toFixed(1)}s · ${width}x${height} · ${sizeMb} MB`);
}

main();
