/**
 * Bience visuals - colour and particle maths shared by the live stage.
 * Pure functions so the look can be unit tested without a canvas.
 */

import type { HSLTuple, LayerId, LayerSpec } from "./model";

export function hsla(tuple: HSLTuple, alpha = 1): string {
  const [h, s, l] = tuple;
  return `hsla(${h}, ${s}%, ${l}%, ${clamp(alpha, 0, 1)})`;
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function lerpHsl(from: HSLTuple, to: HSLTuple, t: number): HSLTuple {
  let hueDelta = to[0] - from[0];
  if (hueDelta > 180) hueDelta -= 360;
  if (hueDelta < -180) hueDelta += 360;
  const hue = (from[0] + hueDelta * clamp(t, 0, 1) + 360) % 360;
  return [hue, lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

/** Deterministic PRNG so a world always grows the same particles. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
};

export function makeParticles(count: number, seed: number): Particle[] {
  const random = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    size: 0.4 + random() * 1.6,
    speed: 0.25 + random() * 0.9,
    drift: random() * 2 - 1,
    phase: random() * Math.PI * 2,
  }));
}

export function particleBudget(spec: LayerSpec, level: number, width: number): number {
  if (level <= 0.005) return 0;
  const density = width < 640 ? 0.55 : 1;
  const base: Record<LayerSpec["texture"], number> = {
    streak: 120,
    ember: 46,
    drift: 34,
    ripple: 5,
    fly: 10,
    spark: 30,
    grain: 0,
  };
  return Math.round(base[spec.texture] * level * density);
}

export function layerHue(id: LayerId, baseHue: number): number {
  const offsets: Partial<Record<LayerId, number>> = {
    rain: -14,
    storm: -6,
    wind: 6,
    fire: 170,
    stream: 10,
    ocean: 18,
    birds: 60,
    crickets: 90,
    crowd: 40,
    tanpura: 30,
    bowls: 24,
    choir: 96,
    sub: 150,
    shimmer: -30,
  };
  return (baseHue + (offsets[id] ?? 0) + 360) % 360;
}

export function rgbaFromHue(hue: number, saturation: number, lightness: number, alpha: number): string {
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${clamp(alpha, 0, 1)})`;
}
