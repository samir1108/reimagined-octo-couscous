import { describe, expect, it, beforeEach } from "vitest";
import {
  OBS_FORMS,
  OBS_SEEDS,
  OBS_TOTAL,
  getObsSeedById,
  obsSeedIdFromText,
  resolveObsForm,
  type ObsSeed,
} from "@/data/observationSessions";
import { buildObservationFlow, layoutObservationBeats } from "@/lib/practice/observationFlow";
import {
  hashString,
  maxOpenLevel,
  pickObservationSession,
  rankObsSeeds,
  resolveObservationSeed,
} from "@/lib/practice/observationPicker";
import {
  clearObservationRuns,
  getObservationStats,
  logObservationRun,
  recentObservationSeedIds,
} from "@/lib/practice/observationProgress";

const baseInput = { sessionNumber: 42, level: 3, slot: "morning" as const };

describe("observation seed catalog", () => {
  it("holds exactly 100 authored sessions with unique ids", () => {
    expect(OBS_TOTAL).toBe(100);
    expect(new Set(OBS_SEEDS.map((s) => s.id)).size).toBe(100);
  });

  it("covers the ladder 14/14/14/14/14/14/16", () => {
    const counts = [1, 2, 3, 4, 5, 6, 7].map(
      (level) => OBS_SEEDS.filter((s) => s.level === level).length,
    );
    expect(counts).toEqual([14, 14, 14, 14, 14, 14, 16]);
  });

  it("gives every seed a real script", () => {
    for (const seed of OBS_SEEDS) {
      expect(seed.exploration.length).toBeGreaterThanOrEqual(3);
      expect(seed.exploration.every((b) => b.title.length > 0 && b.body.length > 20)).toBe(true);
      expect(seed.minutes.length).toBeGreaterThan(0);
      expect(seed.integration.length).toBeGreaterThan(10);
      expect(seed.journalPrompt.length).toBeGreaterThan(5);
      expect(seed.carryTask.length).toBeGreaterThan(10);
    }
  });
});

describe("hashString", () => {
  it("is stable and input-sensitive", () => {
    expect(hashString("obs")).toBe(hashString("obs"));
    expect(hashString("obs")).not.toBe(hashString("obz"));
  });
});

describe("pickObservationSession", () => {
  it("is deterministic for the same user and session number", () => {
    const a = pickObservationSession({ ...baseInput, userId: "u1" });
    const b = pickObservationSession({ ...baseInput, userId: "u1" });
    expect(a.id).toBe(b.id);
  });

  it("varies across session numbers", () => {
    const ids = new Set(
      Array.from({ length: 20 }, (_, i) =>
        pickObservationSession({ ...baseInput, sessionNumber: i + 1, userId: "u1" }).id,
      ),
    );
    expect(ids.size).toBeGreaterThan(3);
  });

  it("never jumps more than one level above the user", () => {
    for (let level = 1; level <= 7; level++) {
      for (let n = 1; n <= 40; n++) {
        const seed = pickObservationSession({ sessionNumber: n, level, userId: "u" });
        expect(seed.level).toBeLessThanOrEqual(maxOpenLevel(level));
      }
    }
  });

  it("does not repeat recent seeds while fresh candidates exist", () => {
    let recent: string[] = [];
    const picks: string[] = [];
    for (let i = 0; i < 5; i++) {
      const seed = pickObservationSession({
        sessionNumber: 200 + i,
        level: 4,
        slot: "night",
        recentSeedIds: recent,
      });
      expect(recent).not.toContain(seed.id);
      picks.push(seed.id);
      recent = [seed.id, ...recent];
    }
    expect(new Set(picks).size).toBe(5);
  });

  it("falls back instead of returning nothing when every seed is recent", () => {
    const recent = OBS_SEEDS.map((s) => s.id);
    const picked = pickObservationSession({ ...baseInput, recentSeedIds: recent });
    expect(picked).toBeDefined();
    expect(picked.id).toMatch(/^obs-l[1-7]-\d{2}$/);
  });

  it("prefers seeds that support the requested duration", () => {
    const fits = Array.from({ length: 24 }, (_, i) =>
      pickObservationSession({ ...baseInput, level: 6, minutes: 20, sessionNumber: i + 1 }),
    ).filter((s) => s.minutes.includes(20));
    expect(fits.length / 24).toBeGreaterThan(0.5);
  });

  it("prefers the requested slot", () => {
    const top = rankObsSeeds({ sessionNumber: 5, level: 4, slot: "night" })[0];
    expect(["night", "any"]).toContain(top.slot);
  });
});

describe("seed resolution", () => {
  it("pins an explicit seed id", () => {
    const pinned = OBS_SEEDS[57] as ObsSeed;
    const seed = resolveObservationSeed({
      seedId: pinned.id,
      sessionNumber: 1,
      level: 1,
    });
    expect(seed.id).toBe(pinned.id);
  });

  it("parses a seed id out of packed practice text", () => {
    expect(obsSeedIdFromText("Morning sit [obs-l4-03]")).toBe("obs-l4-03");
    expect(obsSeedIdFromText("no seed here")).toBeUndefined();
    expect(getObsSeedById("obs-l4-03")).toBeDefined();
  });
});

describe("session forms", () => {
  it("does not play every seed through one skeleton", () => {
    const flows = new Set(
      OBS_SEEDS.map((seed) => OBS_FORMS[resolveObsForm(seed)].flow.join(">")),
    );
    expect(flows.size).toBeGreaterThanOrEqual(6);
  });

  it("keeps each form structured but different", () => {
    for (const form of Object.values(OBS_FORMS)) {
      expect(form.flow.length).toBeGreaterThanOrEqual(3);
      expect(
        form.flow.some((stage) => ["explore", "gaze", "question"].includes(stage)),
      ).toBe(true);
    }
    const vigil = OBS_SEEDS.find((seed) => resolveObsForm(seed) === "vigil");
    const sweep = OBS_SEEDS.find((seed) => resolveObsForm(seed) === "sweep");
    expect(vigil).toBeDefined();
    expect(sweep).toBeDefined();
    expect(buildObservationFlow(vigil!).length).not.toBe(buildObservationFlow(sweep!).length);
  });

  it("drops stages a form does not have (a vigil has no integration line)", () => {
    const vigil = OBS_SEEDS.find((seed) => resolveObsForm(seed) === "vigil")!;
    const lines = buildObservationFlow(vigil).map((beat) => beat.body);
    expect(lines).not.toContain(vigil.integration);
    expect(lines.some((line) => line === vigil.carryTask)).toBe(false);
  });

  it("repeats the object in spiral and return forms", () => {
    const spiral = OBS_SEEDS.find((seed) => resolveObsForm(seed) === "spiral")!;
    const returns = buildObservationFlow(spiral).filter((beat) =>
      beat.title.startsWith("Return"),
    );
    expect(returns.length).toBeGreaterThan(0);
  });

  it("lays beats out in weighted seconds", () => {
    const beats = buildObservationFlow(OBS_SEEDS[0]);
    const timed = layoutObservationBeats(beats, 600);
    expect(timed.every((beat) => beat.seconds >= 12)).toBe(true);
    const total = timed.reduce((sum, beat) => sum + beat.seconds, 0);
    expect(total).toBeGreaterThan(300);
    expect(total).toBeLessThan(900);
  });
});

describe("observation progress", () => {
  beforeEach(() => {
    clearObservationRuns();
  });

  it("logs a run, then exposes it as recent", () => {
    logObservationRun({
      seedId: "obs-l1-01",
      level: 1,
      lens: "body",
      method: "scan",
      sessionNumber: 1,
      durationSec: 300,
      completed: true,
      feltShift: "lighter",
    });
    expect(recentObservationSeedIds()).toEqual(["obs-l1-01"]);
    const stats = getObservationStats();
    expect(stats.completed).toBe(1);
    expect(stats.uniqueSeeds).toBe(1);
    expect(stats.byLevel[1]).toBe(1);
    expect(stats.byLens.body).toBe(1);
  });

  it("counts distinct seeds, not repeats", () => {
    for (let i = 0; i < 2; i++) {
      logObservationRun({
        seedId: "obs-l2-01",
        level: 2,
        lens: "breath",
        method: "counting",
        sessionNumber: i + 1,
        durationSec: 600,
        completed: true,
      });
    }
    const stats = getObservationStats();
    expect(stats.completed).toBe(2);
    expect(stats.uniqueSeeds).toBe(1);
  });
});
