import { describe, expect, it } from "vitest";
import {
  CRISIS_REGIONS,
  detectCrisisRegion,
  getCrisisResources,
} from "@/lib/safety/crisisResources";

describe("crisis resources", () => {
  it("detects India from locale", () => {
    expect(detectCrisisRegion("hi-IN")?.id).toBe("IN");
  });

  it("detects the US from locale", () => {
    expect(detectCrisisRegion("en-US")?.id).toBe("US");
  });

  it("falls back to the timezone when the locale has no region", () => {
    expect(detectCrisisRegion("en", "Europe/Berlin")?.id).toBe("EU");
    expect(detectCrisisRegion("en", "Asia/Kolkata")?.id).toBe("IN");
  });

  it("returns regional lines plus a global fallback", () => {
    const bundle = getCrisisResources("en-GB", "Europe/London");
    expect(bundle.region?.id).toBe("GB");
    expect(bundle.emergency).toBe("999");
    expect(bundle.resources.length).toBeGreaterThan(0);
    expect(bundle.global.length).toBeGreaterThan(0);
  });

  it("still returns usable resources when the region is unknown", () => {
    const bundle = getCrisisResources("xx-XX", "Unknown/Zone");
    expect(bundle.region).toBeNull();
    expect(bundle.emergency).toBe("112");
    expect(bundle.resources).toHaveLength(0);
    expect(bundle.global.length).toBeGreaterThan(0);
  });

  it("never ships an empty resource list for a known region", () => {
    for (const region of CRISIS_REGIONS) {
      expect(region.resources.length).toBeGreaterThan(0);
      expect(region.emergency.length).toBeGreaterThan(0);
    }
  });
});
