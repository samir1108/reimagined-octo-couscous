import { describe, expect, it } from "vitest";
import {
  loopFamilyOf,
  masterProfile,
  selectMasterForRotation,
  selectMasterForSession,
} from "./masterSelector";

describe("loopFamilyOf", () => {
  it("extracts the family prefix", () => {
    expect(loopFamilyOf("ATT001")).toBe("ATT");
    expect(loopFamilyOf("VAL019")).toBe("VAL");
    expect(loopFamilyOf("")).toBe("");
  });
});

describe("selectMasterForSession", () => {
  it("is deterministic for identical input", () => {
    const input = { band: 4, activeLoops: ["ATT001"] };
    expect(selectMasterForSession(input)).toEqual(selectMasterForSession(input));
  });

  it("routes attachment loops to an inquiry master", () => {
    const pick = selectMasterForSession({ band: 5, activeLoops: ["ATT001"] });
    expect(["ramana", "buddha"]).toContain(pick.guruId);
  });

  it("routes validation loops to a compassion master", () => {
    const pick = selectMasterForSession({ band: 3, activeLoops: ["VAL004"] });
    expect(["rumi", "tara"]).toContain(pick.guruId);
  });

  it("uses theme keywords", () => {
    const pick = selectMasterForSession({
      band: 3,
      themeFocusAreas: ["anger at work"],
    });
    expect(["rumi", "krishna", "marcus", "tara"]).toContain(pick.guruId);
  });

  it("respects excludeGuruIds", () => {
    const baseline = selectMasterForSession({ band: 6, activeLoops: ["ATT002"] });
    const excluded = selectMasterForSession({
      band: 6,
      activeLoops: ["ATT002"],
      excludeGuruIds: [baseline.guruId],
    });
    expect(excluded.guruId).not.toBe(baseline.guruId);
  });

  it("never returns the stub for every input", () => {
    const picks = new Set(
      [
        { band: 1, activeLoops: ["VAL001"] },
        { band: 4, activeLoops: ["AVD002"] },
        { band: 7, activeLoops: ["IDN003"] },
        { band: 2, themeFocusAreas: ["career"] },
      ].map((i) => selectMasterForSession(i).guruId),
    );
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe("selectMasterForRotation", () => {
  const base = {
    userId: "u1",
    currentGuruId: "rumi",
    lifetimePhase: 4,
    dominantLoop: "ATT001",
    loopSeverity: 2,
    avgQualityLast7Days: 0.7,
    progressStalled: false,
    rotationsHistory: [],
  };

  it("holds the season before the minimum", () => {
    const d = selectMasterForRotation({ ...base, daysSinceLastRotation: 5 });
    expect(d.shouldRotate).toBe(false);
    expect(d.newGuruId).toBe("rumi");
  });

  it("rotates after a full season", () => {
    const d = selectMasterForRotation({ ...base, daysSinceLastRotation: 46 });
    expect(d.shouldRotate).toBe(true);
    expect(d.newGuruId).not.toBe("rumi");
    expect(d.message.length).toBeGreaterThan(0);
  });

  it("rotates early when progress stalls", () => {
    const d = selectMasterForRotation({
      ...base,
      daysSinceLastRotation: 25,
      progressStalled: true,
    });
    expect(d.shouldRotate).toBe(true);
  });

  it("avoids repeating a recent guru", () => {
    const d = selectMasterForRotation({
      ...base,
      daysSinceLastRotation: 46,
      rotationsHistory: [
        { guruId: "buddha", startedAt: "", reason: "" },
        { guruId: "krishna", startedAt: "", reason: "" },
      ],
    });
    expect(["rumi", "buddha", "krishna"]).not.toContain(d.newGuruId);
  });
});

describe("masterProfile", () => {
  it("resolves a display name", () => {
    expect(masterProfile("ramana")?.name).toBe("Ramana Maharshi");
    expect(masterProfile("nobody")).toBeNull();
  });
});
