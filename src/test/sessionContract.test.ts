import { describe, expect, it } from "vitest";
import {
  assignKeystone,
  buildBankerPlan,
  fitPlanToBudget,
  normalizeContractStep,
  scoreContentQuality,
  validateContractPlan,
  type ContractPlan,
} from "@/supabase/_shared/session-contract";

const goodStep = {
  kind: "witness" as const,
  title: "Sit still. Watch what arises.",
  script: [
    "Sit upright and let the spine be tall while the shoulders soften down.",
    "Wait for the next thought to appear on its own without calling it to you.",
    "Do not name it, do not judge it and do not push it away from you.",
    "When you notice you are thinking, return to the breath once and continue.",
  ],
  durationSeconds: 240,
  params: { object: "thoughts" },
  whyForYou: "Your witnessing practice is at L2 — this sits one level above.",
  signalRef: "practice:witnessing:L2",
};

function plan(steps: unknown[]): ContractPlan {
  return { intent: "test", intro: "test", steps: steps as ContractPlan["steps"] };
}

describe("session contract", () => {
  it("rejects the old one-line step shape", () => {
    const checked = validateContractPlan(
      plan([{ kind: "reflection", title: "Reflect", prompt: "What stayed?", est_minutes: 1 }]),
      { budgetMin: 8 },
    );
    expect(checked.ok).toBe(false);
    expect(checked.errors.some((e) => e.code === "script-short")).toBe(true);
    expect(checked.quality.score).toBeLessThan(0.85);
  });

  it("accepts a fully bound step and scores it high", () => {
    const checked = validateContractPlan(plan([goodStep]), { budgetMin: 8 });
    expect(checked.ok).toBe(true);
    expect(checked.quality.score).toBeGreaterThanOrEqual(0.85);
  });

  it("drops params that are not allowed for the kind", () => {
    const normalized = normalizeContractStep({
      ...goodStep,
      params: { object: "thoughts", evil: "drop table", durationSeconds: 240 },
    });
    expect(normalized.params?.evil).toBeUndefined();
    expect(normalized.params?.object).toBe("thoughts");
  });

  it("fits duration upward as well as downward", () => {
    const short = fitPlanToBudget(plan([goodStep]), 12);
    expect(short.steps[0].durationSeconds).toBeGreaterThan(240);
    const long = fitPlanToBudget(plan([goodStep]), 3);
    expect(long.steps[0].durationSeconds).toBeGreaterThanOrEqual(180);
  });

  it("marks exactly one keystone and prefers a real practice", () => {
    const withBreath = assignKeystone(
      plan([
        { kind: "breathwork", title: "Breathe", durationSeconds: 120, script: ["a", "b", "c"], whyForYou: "x y z", signalRef: "gate:morning", params: { pattern: "box" } },
        goodStep,
      ]),
    );
    expect(withBreath.steps.filter((s) => s.keystone)).toHaveLength(1);
    expect(withBreath.steps[1].keystone).toBe(true);
  });

  it("ships a banker plan that clears the quality gate", () => {
    const banker = buildBankerPlan({ budgetMin: 8, gate: "morning", level: 2 });
    const checked = validateContractPlan(banker, { budgetMin: 8 });
    expect(checked.ok).toBe(true);
    expect(scoreContentQuality(checked.plan, 8).score).toBeGreaterThanOrEqual(0.85);
    expect(checked.plan.steps.length).toBeGreaterThanOrEqual(3);
  });
});
