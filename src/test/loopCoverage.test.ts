import { describe, expect, it } from "vitest";
import { LOOP_NAMES } from "@/supabase/_shared/loopMap";
import {
  INGREDIENT_LOOP_FAMILIES,
  INGREDIENT_JOURNEY_LADDER,
  journeyGateFor,
  loopFamilyOf,
} from "@/supabase/_shared/composer";

const loopIds = Object.keys(LOOP_NAMES);
const mappedFamilies = new Set(Object.values(INGREDIENT_LOOP_FAMILIES).flat());

describe("loop coverage", () => {
  it("targets a meaningful share of the loop catalog", () => {
    const covered = loopIds.filter((id) => mappedFamilies.has(loopFamilyOf(id)));
    const pct = covered.length / loopIds.length;
    expect(loopIds.length).toBeGreaterThan(500);
    // Was 4 of 650 (0.6%) before the family bridge.
    expect(pct).toBeGreaterThanOrEqual(0.6);
  });

  it("covers every large loop family", () => {
    const largeFamilies = ["ATT", "AVD", "CMP", "CTL", "NAR", "SRV", "VAL"];
    for (const family of largeFamilies) {
      expect(mappedFamilies.has(family)).toBe(true);
    }
  });

  it("maps every ingredient to at least one family", () => {
    for (const [id, families] of Object.entries(INGREDIENT_LOOP_FAMILIES)) {
      expect(families.length, id).toBeGreaterThan(0);
    }
  });

  it("uses only families that exist in the catalog", () => {
    const catalogFamilies = new Set(loopIds.map(loopFamilyOf));
    for (const family of mappedFamilies) {
      expect(catalogFamilies.has(family), family).toBe(true);
    }
  });

  it("extracts families from loop ids", () => {
    expect(loopFamilyOf("ATT001")).toBe("ATT");
    expect(loopFamilyOf("VAL019")).toBe("VAL");
    expect(loopFamilyOf("")).toBe("");
  });
});

describe("journey ladder", () => {
  it("spreads readiness across four tiers", () => {
    const tiers = new Set(Object.values(INGREDIENT_JOURNEY_LADDER));
    expect([...tiers].sort((a, b) => a - b)).toEqual([7, 14, 21, 30]);
  });

  it("holds deep practices back early and opens them later", () => {
    expect(journeyGateFor("p:inquiry-whoami-6m", 1).ready).toBe(false);
    expect(journeyGateFor("p:inquiry-whoami-6m", 14).ready).toBe(false);
    expect(journeyGateFor("p:inquiry-whoami-6m", 21).ready).toBe(true);
  });

  it("leaves ungated ingredients open from day one", () => {
    expect(journeyGateFor("p:breath-box-1m", 1)).toEqual({ minDay: 0, ready: true });
  });
});
