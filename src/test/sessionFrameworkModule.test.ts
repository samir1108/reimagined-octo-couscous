import { describe, it, expect } from "vitest";
import {
  ALL_STEPS,
  getStepRegistry,
  getStepById,
  getStepsByCategory,
  FRAMEWORKS,
  getFrameworkRegistry,
  getFrameworkById,
} from "@/lib/session-framework";
import { composeSession, validateComposition } from "@/lib/session-framework/composer";
import { validateFramework, validateRegistry, validateStep } from "@/lib/session-framework/validation";
import { selectFramework, buildContext } from "@/lib/session-framework/personalization";

describe("session-framework module", () => {
  it("has 200+ steps", () => {
    expect(ALL_STEPS.length).toBeGreaterThanOrEqual(200);
  });

  it("step ids unique", () => {
    const ids = ALL_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("registry builds", () => {
    const reg = getStepRegistry();
    expect(reg.steps.size).toBe(ALL_STEPS.length);
  });

  it("getStepById works", () => {
    expect(getStepById("session_welcome")).toBeDefined();
  });

  it("has 40+ frameworks", () => {
    expect(FRAMEWORKS.length).toBeGreaterThanOrEqual(40);
  });

  it("framework ids unique", () => {
    const ids = FRAMEWORKS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("validation passes", () => {
    const res = validateRegistry(ALL_STEPS, FRAMEWORKS);
    expect(res.valid).toBe(true);
  });

  it("each framework validates", () => {
    for (const fw of FRAMEWORKS) {
      const r = validateFramework(fw);
      expect(r.valid).toBe(true);
    }
  });

  it("each step validates", () => {
    for (const s of ALL_STEPS) {
      const r = validateStep(s);
      expect(r.valid).toBe(true);
    }
  });

  it("compose session works", () => {
    const fw = FRAMEWORKS[0];
    const ctx = {
      userId: "u1",
      gate: "morning",
      energy: "medium" as const,
      timeBudgetMin: 10,
      journeyDay: 1,
      activeLoops: [],
      recentFrameworkIds: [],
      recentStepIds: [],
      preferences: {},
      daysSinceLastSession: 1,
    };
    const session = composeSession({ framework: fw, context: ctx });
    expect(session.steps.length).toBeGreaterThan(0);
    const v = validateComposition(session);
    expect(v.valid).toBe(true);
  });

  it("personalization selects framework", () => {
    const ctx = buildContext({ userId: "u1", timeBudgetMin: 10, energy: "medium" });
    const sel = selectFramework(ctx);
    expect(sel.selected).toBeDefined();
    expect(sel.score).toBeGreaterThanOrEqual(0);
  });
});
