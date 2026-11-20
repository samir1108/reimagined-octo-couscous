import { describe, expect, it } from "vitest";
import {
  orbPaletteForBand,
  orbPaletteForGate,
  orbPaletteFromHue,
  DEFAULT_ORB_PALETTE,
} from "@/components/orb/palettes";

describe("orbPaletteForBand", () => {
  it("returns a four-stop palette", () => {
    const p = orbPaletteForBand(3);
    expect(p).toHaveLength(4);
    expect(p.every((c) => /^#[0-9a-f]{6}$/i.test(c))).toBe(true);
  });

  it("is deterministic", () => {
    expect(orbPaletteForBand(4.7)).toEqual(orbPaletteForBand(4.7));
  });

  it("changes as the band rises", () => {
    expect(orbPaletteForBand(1)).not.toEqual(orbPaletteForBand(9));
  });

  it("clamps out-of-range bands", () => {
    expect(orbPaletteForBand(-5)).toEqual(orbPaletteForBand(0));
    expect(orbPaletteForBand(99)).toEqual(orbPaletteForBand(10));
  });

  it("accents the weakest dimension", () => {
    const plain = orbPaletteForBand(5);
    const accented = orbPaletteForBand(5, "emotion");
    expect(accented[2]).not.toBe(plain[2]);
    expect(accented[0]).toBe(plain[0]);
  });

  it("keeps the gate palette as the fallback", () => {
    expect(orbPaletteForGate("morning")).toEqual(DEFAULT_ORB_PALETTE);
  });
});

describe("orbPaletteFromHue", () => {
  it("returns a four-stop hex palette", () => {
    const p = orbPaletteFromHue(38);
    expect(p).toHaveLength(4);
    expect(p.every((c) => /^#[0-9a-f]{6}$/i.test(c))).toBe(true);
  });

  it("changes colour as the hue moves", () => {
    expect(orbPaletteFromHue(38)).not.toEqual(orbPaletteFromHue(220));
  });

  it("wraps hue values and tolerates junk input", () => {
    expect(orbPaletteFromHue(-322)).toEqual(orbPaletteFromHue(38));
    expect(orbPaletteFromHue(398)).toEqual(orbPaletteFromHue(38));
    expect(orbPaletteFromHue(Number.NaN)).toEqual(orbPaletteFromHue(38));
  });
});
