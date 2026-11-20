import { useEffect, useRef } from "react";

import { LAYERS, LAYER_IDS, type BienceWorld, type HSLTuple, type LayerId } from "@/lib/bience/model";
import type { BienceEngine } from "@/lib/bience/engine";
import { clamp, hsla, lerp, lerpHsl, makeParticles, particleBudget, rgbaFromHue, type Particle } from "@/lib/bience/visuals";

type Props = {
  world: BienceWorld;
  engine: BienceEngine;
  playing: boolean;
  breath: number;
  levels: Record<LayerId, number>;
};

type Texture = "streak" | "ember" | "ripple" | "fly" | "spark";

const POOLS: Record<Texture, number> = {
  streak: 150,
  ember: 56,
  ripple: 6,
  fly: 12,
  spark: 44,
};

function makeGrain(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 22;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function buildPools(): Record<Texture, Particle[]> {
  return {
    streak: makeParticles(POOLS.streak, 0x8a11),
    ember: makeParticles(POOLS.ember, 0x2f9c),
    ripple: makeParticles(POOLS.ripple, 0x4c07),
    fly: makeParticles(POOLS.fly, 0x9d41),
    spark: makeParticles(POOLS.spark, 0x51e5),
  };
}

export default function BienceStage({ world, engine, playing, breath, levels }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef(world);
  const playingRef = useRef(playing);
  const breathRef = useRef(breath);
  const levelsRef = useRef(levels);

  worldRef.current = world;
  playingRef.current = playing;
  breathRef.current = breath;
  levelsRef.current = levels;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
    const motion = reduceMotion ? 0.2 : 1;

    const pools = buildPools();
    const stars = makeParticles(150, 0x77aa);
    const motes = makeParticles(52, 0x1d5e);
    const grain = makeGrain();
    const grainPattern = grain ? ctx.createPattern(grain, "repeat") : null;

    let palette: HSLTuple[] = [...worldRef.current.palette];
    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    let grainOffset = 0;
    const smooth = { level: 0, bass: 0, mid: 0, treble: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const lightX = () => width * (worldRef.current.motif === "cosmos" ? 0.5 : 0.5);
    const lightY = () => height * (0.58 + smooth.bass * 0.012);

    const drawSky = () => {
      const sky = ctx.createLinearGradient(0, 0, width * 0.15, height);
      sky.addColorStop(0, hsla(palette[0], 1));
      sky.addColorStop(0.46, hsla(palette[1], 1));
      sky.addColorStop(0.78, hsla(palette[2], 0.72));
      sky.addColorStop(1, hsla(palette[0], 1));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const cx = lightX();
      const cy = lightY();
      const radius = Math.max(width, height) * (0.34 + smooth.level * 0.1);
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      aura.addColorStop(0, hsla(palette[3], 0.22 + smooth.bass * 0.22 + breathRef.current * 0.05));
      aura.addColorStop(0.32, hsla(palette[2], 0.14 + smooth.mid * 0.1));
      aura.addColorStop(1, hsla(palette[1], 0));
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);
    };

    const drawStars = () => {
      const starLevel = worldRef.current.motif === "cosmos" ? 1 : 0.65;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < stars.length; i += 1) {
        const p = stars[i];
        const twinkle = 0.45 + 0.55 * Math.sin(elapsed * (0.5 + p.speed * 0.7) + p.phase);
        const x = (p.x * width + Math.sin(elapsed * 0.02 + p.phase) * 3 * motion) % width;
        const y = p.y * height * 0.62;
        const alpha = twinkle * starLevel * (0.12 + p.size * 0.16);
        ctx.fillStyle = rgbaFromHue((palette[3][0] + p.drift * 40 + 360) % 360, 26, 92, alpha);
        ctx.beginPath();
        ctx.arc(x, y, 0.4 + p.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const drawMist = () => {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const bandCount = width < 640 ? 3 : 5;
      for (let band = 0; band < bandCount; band += 1) {
        const p = motes[band % motes.length];
        const y = height * (0.3 + band * 0.11);
        const drift = ((elapsed * (0.012 + p.speed * 0.01) + p.x) % 1.4) - 0.2;
        const x = drift * width;
        const rx = width * (0.24 + p.size * 0.12);
        const ry = height * (0.035 + p.size * 0.02);
        const mist = ctx.createRadialGradient(x, y, 0, x, y, rx);
        mist.addColorStop(0, hsla(palette[3], 0.05 + smooth.mid * 0.05));
        mist.addColorStop(1, hsla(palette[2], 0));
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, ry / rx);
        ctx.fillStyle = mist;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    };

    const drawRays = () => {
      const cx = lightX();
      const cy = lightY();
      const reach = Math.max(width, height) * 0.95;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const count = 7;
      for (let i = 0; i < count; i += 1) {
        const base = Math.PI + (i / count) * Math.PI;
        const wobble = Math.sin(elapsed * 0.05 + i * 1.3) * 0.09;
        const angle = base + wobble;
        const spread = 0.026 + (i % 3) * 0.012;
        const beam = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * reach, cy + Math.sin(angle) * reach);
        beam.addColorStop(0, hsla(palette[3], 0.09 + smooth.treble * 0.1));
        beam.addColorStop(0.55, hsla(palette[3], 0.03 + smooth.treble * 0.04));
        beam.addColorStop(1, hsla(palette[2], 0));
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle - spread) * reach, cy + Math.sin(angle - spread) * reach);
        ctx.lineTo(cx + Math.cos(angle + spread) * reach, cy + Math.sin(angle + spread) * reach);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const drawLightBody = () => {
      const cx = lightX();
      const cy = lightY();
      const pulse = 0.86 + breathRef.current * 0.18 + smooth.bass * 0.16;
      const core = Math.min(width, height) * (0.055 + smooth.bass * 0.03) * pulse;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, core * 6);
      halo.addColorStop(0, hsla(palette[3], 0.34));
      halo.addColorStop(0.22, hsla(palette[3], 0.16));
      halo.addColorStop(1, hsla(palette[2], 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, core * 6, 0, Math.PI * 2);
      ctx.fill();

      const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, core);
      disc.addColorStop(0, hsla([palette[3][0], 32, 96], 0.9));
      disc.addColorStop(0.55, hsla(palette[3], 0.45));
      disc.addColorStop(1, hsla(palette[2], 0));
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(cx, cy, core, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMotif = () => {
      const motif = worldRef.current.motif;
      const cx = lightX();
      const cy = lightY();

      if (motif === "monsoon") {
        const cycle = (elapsed + 4) % 21;
        const storm = levelsRef.current.storm ?? 0;
        if (cycle < 0.5 && storm > 0.1) {
          const flash = Math.sin((cycle / 0.5) * Math.PI) * storm;
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.fillStyle = hsla([palette[3][0], 18, 92], flash * 0.1);
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }

      if (motif === "mandala") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.translate(cx, cy);
        for (let ring = 0; ring < 5; ring += 1) {
          const radius = Math.min(width, height) * (0.16 + ring * 0.07) * (1 + smooth.bass * 0.08);
          const alpha = 0.05 + smooth.mid * 0.05;
          ctx.strokeStyle = hsla(palette[3], alpha);
          ctx.lineWidth = ring === 0 ? 1.4 : 0.8;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let petal = 0; petal < 12; petal += 1) {
          const angle = (petal / 12) * Math.PI * 2 + elapsed * 0.02;
          const radius = Math.min(width, height) * 0.3;
          ctx.fillStyle = hsla(palette[3], 0.03 + smooth.treble * 0.05);
          ctx.beginPath();
          ctx.ellipse(Math.cos(angle) * radius, Math.sin(angle) * radius, 9, 26, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (motif === "cosmos") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < 3; i += 1) {
          const px = width * (0.32 + i * 0.19) + Math.sin(elapsed * 0.013 + i) * 22;
          const py = height * (0.34 + i * 0.07);
          const radius = Math.max(width, height) * (0.2 + i * 0.06);
          const nebula = ctx.createRadialGradient(px, py, 0, px, py, radius);
          const hue = (palette[2][0] + i * 42) % 360;
          nebula.addColorStop(0, hsla([hue, 58, 42], 0.07 + smooth.mid * 0.05));
          nebula.addColorStop(0.55, hsla([hue, 50, 26], 0.04));
          nebula.addColorStop(1, hsla(palette[1], 0));
          ctx.fillStyle = nebula;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (motif === "water") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const horizon = height * 0.66;
        for (let line = 0; line < 24; line += 1) {
          const y = horizon + line * (height * 0.014);
          const alpha = (0.028 + smooth.mid * 0.03) * (1 - line / 26);
          const offset = Math.sin(elapsed * 0.4 + line * 0.7) * (12 + line * 2.4);
          ctx.strokeStyle = hsla(palette[3], alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(width * 0.3, y + offset * 0.2, width * 0.68, y - offset * 0.2, width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (motif === "hearth") {
        const glow = ctx.createRadialGradient(cx, height * 0.72, 0, cx, height * 0.72, width * 0.36);
        const flicker = 0.1 + Math.abs(Math.sin(elapsed * 7.3)) * 0.04 + smooth.bass * 0.08;
        glow.addColorStop(0, hsla([24, 90, 56], flicker));
        glow.addColorStop(1, hsla([16, 80, 30], 0));
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = glow;
        ctx.fillRect(0, height * 0.4, width, height * 0.6);
        ctx.restore();
      }

      if (motif === "bells" || motif === "sunrise" || motif === "fireflies") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const rings = 3;
        for (let i = 0; i < rings; i += 1) {
          const phase = ((elapsed * 0.045 + i / rings) % 1);
          const radius = phase * Math.min(width, height) * 0.55;
          const alpha = (1 - phase) * (0.05 + smooth.treble * 0.05);
          ctx.strokeStyle = hsla(palette[3], alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    const drawLayerParticles = () => {
      const live = levelsRef.current;
      const cx = lightX();
      const horizon = height * 0.66;

      const rainLevel = live.rain ?? 0;
      if (rainLevel > 0.005) {
        const count = Math.min(Math.round(POOLS.streak * rainLevel * (width < 640 ? 0.6 : 1)), pools.streak.length);
        ctx.save();
        ctx.lineCap = "round";
        for (let pass = 0; pass < 2; pass += 1) {
          ctx.strokeStyle =
            pass === 0
              ? rgbaFromHue((palette[3][0] + 140) % 360, 40, 78, 0.1 + rainLevel * 0.14)
              : rgbaFromHue((palette[3][0] + 150) % 360, 46, 86, 0.14 + rainLevel * 0.3);
          ctx.lineWidth = pass === 0 ? 0.7 : 1;
          ctx.beginPath();
          const subset = pass === 0 ? count : Math.floor(count * 0.6);
          for (let i = 0; i < subset; i += 1) {
            const p = pools.streak[i];
            const speed = pass === 0 ? 0.26 : 0.44;
            const x = ((p.x + p.drift * 0.06) * width + 40) % width;
            const y = ((p.y + elapsed * p.speed * speed * motion) % 1.1) * height - 40;
            const len = (pass === 0 ? 10 : 20) + p.size * 22;
            ctx.moveTo(x, y);
            ctx.lineTo(x - len * 0.16, y + len);
          }
          ctx.stroke();
        }
        ctx.restore();
        for (let i = 0; i < Math.floor(4 + rainLevel * 6); i += 1) {
          const p = pools.ripple[i % pools.ripple.length];
          const cycle = (elapsed * 0.22 * motion + p.phase) % 1;
          const x = p.x * width;
          const y = horizon + (p.y * 0.26 + 0.02) * height;
          const radius = 6 + cycle * 46;
          ctx.strokeStyle = rgbaFromHue((palette[3][0] + 150) % 360, 45, 80, (1 - cycle) * 0.22 * rainLevel);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(x, y, radius, radius * 0.22, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      const fireLevel = live.fire ?? 0;
      if (fireLevel > 0.005) {
        const count = Math.min(Math.round(POOLS.ember * fireLevel * (width < 640 ? 0.7 : 1)), pools.ember.length);
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < count; i += 1) {
          const p = pools.ember[i];
          const rise = (p.y - elapsed * p.speed * 0.045 * motion) % 1;
          const y = (rise + 1) % 1;
          const x = (p.x + Math.sin(elapsed * 0.7 * motion + p.phase) * 0.024 * p.drift) * width;
          const alpha = (0.3 + fireLevel * 0.5) * (0.5 + 0.5 * Math.sin(elapsed * 3.2 + p.phase));
          const radius = 0.8 + p.size * (1.2 + fireLevel);
          const glow = ctx.createRadialGradient(x, y * height, 0, x, y * height, radius * 6);
          glow.addColorStop(0, rgbaFromHue(32, 98, 70, alpha));
          glow.addColorStop(1, rgbaFromHue(18, 92, 52, 0));
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y * height, radius * 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      const oceanLevel = Math.max(live.ocean ?? 0, live.stream ?? 0);
      if (oceanLevel > 0.005) {
        ctx.save();
        const count = oceanLevel > 0.35 ? 5 : 3;
        for (let i = 0; i < count; i += 1) {
          const p = pools.ripple[i];
          const cycle = (elapsed * 0.07 * motion + p.phase) % 1;
          const radius = 50 + cycle * width * 0.5;
          const x = width * (0.18 + p.x * 0.64);
          ctx.strokeStyle = rgbaFromHue((palette[3][0] + 160) % 360, 46, 82, (1 - cycle) * 0.14 * oceanLevel);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.ellipse(x, horizon + 20, radius, radius * 0.12, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      const birdLevel = live.birds ?? 0;
      if (birdLevel > 0.005) {
        const count = Math.min(Math.round(POOLS.fly * birdLevel), pools.fly.length);
        ctx.save();
        ctx.strokeStyle = rgbaFromHue((palette[3][0] + 34) % 360, 30, 72, 0.12 + birdLevel * 0.22);
        ctx.lineWidth = 1.3;
        for (let i = 0; i < count; i += 1) {
          const p = pools.fly[i];
          const x = ((p.x + elapsed * p.speed * 0.01 * motion) % 1.3) * width - width * 0.1;
          const y = height * (0.16 + p.y * 0.34) + Math.sin(elapsed * 0.6 + p.phase) * 9;
          const wing = 3.4 + p.size * 2.4 + Math.sin(elapsed * 4 + p.phase) * 1.6;
          ctx.beginPath();
          ctx.moveTo(x - wing, y + wing * 0.45);
          ctx.quadraticCurveTo(x, y - wing * 0.35, x + wing, y + wing * 0.45);
          ctx.stroke();
        }
        ctx.restore();
      }

      const sparkLevel = Math.max(live.crickets ?? 0, live.shimmer ?? 0, live.bowls ?? 0, live.tanpura ?? 0);
      if (sparkLevel > 0.005) {
        const count = Math.min(Math.round(POOLS.spark * sparkLevel * (width < 640 ? 0.7 : 1)), pools.spark.length);
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < count; i += 1) {
          const p = pools.spark[i];
          const x = (p.x + Math.sin(elapsed * 0.08 + p.phase) * 0.03) * width;
          const y = height * (0.12 + p.y * 0.62);
          const twinkle = 0.35 + 0.65 * Math.sin(elapsed * (0.7 + p.speed) + p.phase);
          const alpha = twinkle * sparkLevel * 0.55;
          if (alpha <= 0.01) continue;
          ctx.fillStyle = rgbaFromHue((palette[3][0] + p.drift * 26 + 360) % 360, 55, 86, alpha);
          ctx.beginPath();
          ctx.arc(x, y, 0.5 + p.size * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (worldRef.current.motif === "cosmos" && smooth.bass > 0.2) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.strokeStyle = hsla(palette[3], 0.05 + smooth.bass * 0.06);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, height * 0.52, width * 0.34, height * 0.1, -0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawFloor = () => {
      const horizon = height * 0.66;
      const mist = ctx.createLinearGradient(0, horizon - height * 0.08, 0, height);
      mist.addColorStop(0, hsla(palette[2], 0));
      mist.addColorStop(0.32, hsla(palette[2], 0.06 + smooth.mid * 0.05));
      mist.addColorStop(1, hsla(palette[0], 0.7));
      ctx.fillStyle = mist;
      ctx.fillRect(0, horizon - height * 0.08, width, height);

      const line = ctx.createLinearGradient(0, horizon, width, horizon);
      line.addColorStop(0, hsla(palette[3], 0));
      line.addColorStop(0.5, hsla(palette[3], 0.14 + smooth.treble * 0.08));
      line.addColorStop(1, hsla(palette[3], 0));
      ctx.fillStyle = line;
      ctx.fillRect(0, horizon - 0.6, width, 1.2);

      const vignette = ctx.createRadialGradient(
        width * 0.5,
        height * 0.55,
        Math.min(width, height) * 0.2,
        width * 0.5,
        height * 0.55,
        Math.max(width, height) * 0.8,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.66)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    };

    const drawGrain = () => {
      if (!grainPattern) return;
      grainOffset = (grainOffset + 0.3 * motion) % 160;
      ctx.save();
      ctx.globalAlpha = 0.045 + smooth.treble * 0.02;
      ctx.translate(-grainOffset, -grainOffset);
      ctx.fillStyle = grainPattern;
      ctx.fillRect(0, 0, width + 160, height + 160);
      ctx.restore();
    };

    const draw = (now: number) => {
      frame = window.requestAnimationFrame(draw);
      const dt = last === 0 ? 0.016 : clamp((now - last) / 1000, 0, 0.1);
      last = now;
      elapsed += dt * motion;

      const spectrum = playingRef.current ? engine.getSpectrum() : { level: 0, bass: 0, mid: 0, treble: 0 };
      smooth.level = lerp(smooth.level, spectrum.level, 0.1);
      smooth.bass = lerp(smooth.bass, spectrum.bass, 0.14);
      smooth.mid = lerp(smooth.mid, spectrum.mid, 0.12);
      smooth.treble = lerp(smooth.treble, spectrum.treble, 0.16);

      const target = worldRef.current.palette;
      palette = palette.map((color, index) => lerpHsl(color, target[index] ?? color, dt * 1.5));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      drawSky();
      drawStars();
      drawMist();
      drawRays();
      drawLightBody();
      drawMotif();
      drawLayerParticles();
      drawFloor();
      drawGrain();
    };

    frame = window.requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
      } else {
        last = 0;
        frame = window.requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      data-bience-stage="true"
    />
  );
}
