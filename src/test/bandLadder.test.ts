import { describe, expect, it } from "vitest";
import { getBandInfo, getDimensionCap } from "@/lib/shared/vLevel";

describe("band ladder", () => {
  it("reaches 7.0 at 180 days", () => {
    expect(getDimensionCap(180, false)).toBe(7.0);
  });

  it("extends past the old ceiling at one and two years", () => {
    expect(getDimensionCap(365, false)).toBe(7.5);
    expect(getDimensionCap(730, false)).toBe(8.0);
  });

  it("keeps calibration low", () => {
    expect(getDimensionCap(400, true)).toBe(3.5);
  });

  it("has a named identity for every reachable band", () => {
    for (const band of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      const info = getBandInfo(band);
      expect(info?.name, String(band)).toBeTruthy();
    }
  });
});
