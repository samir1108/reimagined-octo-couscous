import { describe, expect, it } from "vitest";

import {
  BREATH_PATTERNS,
  LAYER_IDS,
  LAYERS,
  SILENCE,
  WORLDS,
  WORLDS_BY_ID,
  activeLayers,
  breathAt,
  emptyLevels,
  formatClock,
  levelsFromWorld,
  mixEnergy,
  normalizeMix,
  noteForFrequency,
  parseBience,
  serializeBience,
  withLevel,
  worldMix,
} from "@/lib/bience/model";
import { lerpHsl, mulberry32, particleBudget } from "@/lib/bience/visuals";

describe("bience worlds", () => {
  it("ships eight distinct worlds", () => {
    expect(WORLDS).toHaveLength(8);
    expect(new Set(WORLDS.map((w) => w.id)).size).toBe(8);
  });

  it("keeps every world playable", () => {
    for (const world of WORLDS) {
      expect(world.palette).toHaveLength(4);
      expect(world.motif.length).toBeGreaterThan(2);
      expect(world.scale.length).toBeGreaterThanOrEqual(4);
      expect(world.scale[0]).toBe(1);
      expect(world.scale[world.scale.length - 1]).toBeGreaterThan(1.5);
      expect(world.root).toBeGreaterThan(20);
      expect(world.reverb).toBeGreaterThan(0);
      const levels = levelsFromWorld(world);
      for (const id of LAYER_IDS) {
        expect(levels[id]).toBeGreaterThanOrEqual(0);
        expect(levels[id]).toBeLessThanOrEqual(1);
      }
      expect(activeLayers(levels).length).toBeGreaterThanOrEqual(4);
    }
  });

  it("indexes worlds by id", () => {
    expect(WORLDS_BY_ID["cosmic-void"].name).toBe("Cosmic Void");
  });
});

describe("bience mix", () => {
  it("builds a world mix from its levels", () => {
    const mix = worldMix("hearth");
    expect(mix.source).toBe("hearth");
    expect(mix.base).toBe("hearth");
    expect(mix.levels.fire).toBeGreaterThan(0.5);
    expect(mix.levels.rain).toBe(0);
  });

  it("marks manual edits as custom without losing the base world", () => {
    const mix = withLevel(worldMix("monsoon-terrace"), "shimmer", 0.4);
    expect(mix.source).toBe("custom");
    expect(mix.base).toBe("monsoon-terrace");
    expect(mix.levels.shimmer).toBe(0.4);
  });

  it("clamps out-of-range levels", () => {
    const mix = withLevel(worldMix("hearth"), "fire", 9);
    expect(mix.levels.fire).toBe(1);
    const negative = withLevel(mix, "fire", Number.NaN);
    expect(negative.levels.fire).toBe(0);
  });

  it("falls back to a sane mix for junk input", () => {
    const mix = normalizeMix({ base: "nope", levels: { rain: 4, wind: -3 } });
    expect(mix.base).toBe(WORLDS[0].id);
    expect(mix.levels.rain).toBe(1);
    expect(mix.levels.wind).toBe(0);
  });

  it("round-trips through storage", () => {
    const mix = withLevel(worldMix("vipassana-hall"), "bowls", 0.33);
    const parsed = parseBience(serializeBience(mix));
    expect(parsed).not.toBeNull();
    expect(parsed?.levels.bowls).toBeCloseTo(0.33, 2);
    expect(parsed?.base).toBe("vipassana-hall");
  });

  it("rejects stale or corrupt storage", () => {
    expect(parseBience(null)).toBeNull();
    expect(parseBience("not json")).toBeNull();
    expect(parseBience(JSON.stringify({ version: 0, mix: {} }))).toBeNull();
  });

  it("measures energy from the sum of layers", () => {
    expect(mixEnergy(emptyLevels())).toBe(0);
    expect(mixEnergy(levelsFromWorld(WORLDS_BY_ID["kashi-dawn"]))).toBeGreaterThan(0);
  });
});

describe("bience breath", () => {
  it("walks through inhale, hold, exhale and rest", () => {
    const pattern = BREATH_PATTERNS[0];
    expect(breathAt(pattern, 0).phase).toBe("inhale");
    expect(breathAt(pattern, pattern.inhale + 0.1).phase).toBe("hold");
    expect(breathAt(pattern, pattern.inhale + pattern.hold + 0.1).phase).toBe("exhale");
    expect(
      breathAt(pattern, pattern.inhale + pattern.hold + pattern.exhale + pattern.rest * 0.5).phase,
    ).toBe("rest");
  });

  it("wraps around the cycle", () => {
    const pattern = BREATH_PATTERNS[2];
    const total = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;
    expect(breathAt(pattern, total + 1).phase).toBe(breathAt(pattern, 1).phase);
  });
});

describe("bience display helpers", () => {
  it("names notes from frequency", () => {
    expect(noteForFrequency(110)).toContain("A2");
    expect(noteForFrequency(440)).toContain("A4");
    expect(noteForFrequency(0)).toBe("-");
  });

  it("formats the sleep countdown", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65)).toBe("1:05");
    expect(formatClock(-10)).toBe("0:00");
  });

  it("keeps silence above zero for exponential ramps", () => {
    expect(SILENCE).toBeGreaterThan(0);
  });
});

describe("bience visuals", () => {
  it("interpolates palettes along the shortest hue arc", () => {
    const mid = lerpHsl([350, 40, 10], [10, 60, 30], 0.5);
    expect(mid[0]).toBeCloseTo(0, 0);
    expect(mid[1]).toBeCloseTo(50, 5);
  });

  it("generates deterministic particles", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("keeps particle counts proportional to level", () => {
    const spec = Object.values(LAYERS)[0];
    expect(particleBudget(spec, 0, 1200)).toBe(0);
    expect(particleBudget(spec, 1, 1200)).toBeGreaterThan(particleBudget(spec, 0.25, 1200));
  });
});
