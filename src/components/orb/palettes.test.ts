import { describe, expect, it } from "vitest";
import { APP_GOLD_ORB_PALETTE, DEFAULT_ORB_PALETTE, orbPaletteForGate } from "./palettes";

describe("main consciousness orb palette", () => {
  it("uses the app's gold palette for every daily gate", () => {
    expect(DEFAULT_ORB_PALETTE).toEqual(APP_GOLD_ORB_PALETTE);
    for (const gate of ["morning", "midday", "evening", "night"] as const) {
      expect(orbPaletteForGate(gate)).toEqual(APP_GOLD_ORB_PALETTE);
    }
  });
});
