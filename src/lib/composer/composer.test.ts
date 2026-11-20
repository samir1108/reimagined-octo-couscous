import { describe, expect, it } from "vitest";
import { composeSession, composeTitle } from "./composer";
import type { ComposerContext } from "./composer";

const baseCtx = (overrides: Partial<ComposerContext> = {}): ComposerContext => ({
  gate: "morning",
  energy: "medium",
  gapDays: 0,
  timeBudgetMin: 15,
  band: 3,
  activeLoops: [],
  practiceLevels: {},
  recentIngredientIds: [],
  ...overrides,
});

describe("composeSession invariants", () => {
  it("totalMinutes exactly equals the time budget", () => {
    const s = composeSession(baseCtx({ timeBudgetMin: 20 }));
    expect(s.totalMinutes).toBe(20);
  });

  it("uses the micro archetype under 3 minutes", () => {
    const s = composeSession(baseCtx({ timeBudgetMin: 2 }));
    expect(s.archetypeId).toBe("micro");
  });

  it("never reuses an ingredient within a session", () => {
    const s = composeSession(baseCtx());
    const ids = s.slots.map((x) => x.ingredient.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every slot has positive minutes and a non-empty reason", () => {
    const s = composeSession(baseCtx());
    for (const slot of s.slots) {
      expect(slot.minutes).toBeGreaterThan(0);
      expect(slot.reason.length).toBeGreaterThan(0);
    }
  });

  it("composeTitle produces a non-empty string", () => {
    const s = composeSession(baseCtx());
    expect(composeTitle(s, "morning").length).toBeGreaterThan(0);
  });
});
