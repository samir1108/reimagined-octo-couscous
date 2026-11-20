import { describe, expect, it } from "vitest";
import { buildHumanModel } from "@/lib/humanModel";
import {
  buildDayPlan,
  buildDecadeVision,
  buildLifePlanBundle,
  buildSeasonPlan,
  lifePlanToMarkdown,
} from "@/lib/lifePlan";

const NOW = new Date("2026-11-17T10:00:00Z");
const model = buildHumanModel({
  userId: "u1",
  now: NOW,
  dimensionBands: { body: 3, emotion: 4, thought: 6, awareness: 3 },
  capabilityLevels: { observation: 2, breath: 1 },
  sessionCount: 8,
});

describe("life plan", () => {
  it("builds a day around the weakest layer", () => {
    const day = buildDayPlan(model, NOW);
    expect(day.basis[0]).toContain("weakest layer");
    expect(day.morning.length).toBeGreaterThan(10);
    expect(day.carry.length).toBeGreaterThan(10);
    expect(day.date).toBe("2026-11-17");
  });

  it("builds a twelve-week season with gates", () => {
    const season = buildSeasonPlan(model, NOW);
    expect(season.weeks).toHaveLength(12);
    expect(season.days).toBe(84);
    expect(season.gates.length).toBeGreaterThanOrEqual(3);
    expect(season.weeks[0].focus.toLowerCase()).toContain("orient");
    expect(season.weeks[11].review).toContain("evidence");
  });

  it("builds a ten-year vision with non-negotiables", () => {
    const decade = buildDecadeVision(model, NOW);
    expect(decade.years).toHaveLength(10);
    expect(decade.years[0].year).toBe(1);
    expect(decade.years[9].year).toBe(10);
    expect(decade.nonNegotiables.join(" ")).toContain("Sleep before meditation");
  });

  it("is deterministic for the same model and date", () => {
    expect(buildLifePlanBundle(model, NOW)).toEqual(buildLifePlanBundle(model, NOW));
  });

  it("exports markdown with the disclaimer", () => {
    const bundle = buildLifePlanBundle(model, NOW);
    const md = lifePlanToMarkdown(bundle);
    expect(md).toContain("# My practice plan");
    expect(md).toContain("## Season");
    expect(md).toContain("## Decade");
    expect(md).toContain("not a medical prediction");
  });
});
