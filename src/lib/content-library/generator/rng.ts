/**
 * Deterministic seeded RNG — every generated item is a pure function of its
 * (category, index) key, so the library is stable across sessions, devices,
 * and the materialization script. xmur3 hash + mulberry32 PRNG.
 */

export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number): number;
  pick<T>(arr: readonly T[]): T;
  picks<T>(arr: readonly T[], n: number): T[];
  shuffle<T>(arr: readonly T[]): T[];
  chance(p: number): boolean;
}

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    float: (min, max) => next() * (max - min) + min,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    picks: <T>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const out: T[] = [];
      while (copy.length > 0 && out.length < n) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    shuffle: <T>(arr: readonly T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    chance: (p) => next() < p,
  };
}

export function rngFor(key: string): Rng {
  return createRng(hashSeed(key));
}

export function pad5(n: number): string {
  return String(n).padStart(5, "0");
}
