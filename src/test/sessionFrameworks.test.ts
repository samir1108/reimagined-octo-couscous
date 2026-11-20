import { describe, it, expect } from "vitest";
import {
  FRAMEWORK_CATALOG,
  TECHNIQUE_CATALOG,
  selectFramework,
  buildSessionBlueprint,
} from "@/lib/session-frameworks";

describe("session framework library", () => {
  it("validates catalog", () => {
    expect(FRAMEWORK_CATALOG.length).toBeGreaterThan(50);
  });

  it("has unique ids", () => {
    const ids = FRAMEWORK_CATALOG.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("selects a framework for short time", () => {
    const selection = selectFramework({ timeBudgetMin: 3, energy: "low", checkIn: "short_on_time" });
    expect(selection.selected.durationMinutes.min).toBeLessThanOrEqual(3);
  });

  it("builds blueprint durations", () => {
    const framework = FRAMEWORK_CATALOG[0];
    const blueprint = buildSessionBlueprint(framework, 5);
    const sum = blueprint.stages.reduce((s, stage) => s + stage.durationMinutes, 0);
    expect(Math.abs(sum - blueprint.durationMinutes)).toBeLessThan(0.05);
  });

  it("technique catalog validates", () => {
    expect(TECHNIQUE_CATALOG.length).toBeGreaterThan(20);
  });
});
