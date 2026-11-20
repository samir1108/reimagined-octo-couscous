import { describe, expect, it } from "vitest";
import type { VLevel } from "@/types/consciousness";
import { FOUNDATION_CHAPTERS, FOUNDATION_TOTAL_DAYS, getFoundationDay, listFoundationDays } from "./index";

function level(band: number, microLevel: "entering" | "deepening" | "mastery" = "entering"): Pick<VLevel, "value" | "band" | "microLevel" | "witnessQuality"> {
  return {
    value: band + 0.2,
    band: band as VLevel["band"],
    microLevel,
    witnessQuality: 0.8,
  };
}

const base = {
  day: 32,
  pathAffinity: { jnana: 6 },
  minutesAvailable: 40 as const,
  energy: "high" as const,
};

describe("foundation curriculum", () => {
  it("has 118 days and 12 chapters with no gaps", () => {
    const days = listFoundationDays();
    expect(days).toHaveLength(118);
    expect(FOUNDATION_TOTAL_DAYS).toBe(118);
    expect(FOUNDATION_CHAPTERS).toHaveLength(12);
    expect(new Set(days.map((d) => d.day)).size).toBe(118);
    expect(days[0].day).toBe(1);
    expect(days[117].day).toBe(118);
  });

  it("keeps day 32 on Repetitive Thoughts and day 50 on Witnessing Emotion", () => {
    const day32 = listFoundationDays().find((d) => d.day === 32);
    const day50 = listFoundationDays().find((d) => d.day === 50);
    expect(day32?.theme).toBe("Repetitive Thoughts");
    expect(day50?.theme).toBe("Witnessing Emotion");
  });
});

describe("depth differentiation", () => {
  it("gives four different experiences of day 32", () => {
    const plans = [0, 2, 3, 5].map((band) =>
      getFoundationDay({ ...base, vLevel: level(band) })
    );
    expect(plans.map((p) => p.depth)).toEqual([0, 1, 2, 3]);

    const guided = plans.map((p) => p.components.find((c) => c.kind === "guided")?.prompt);
    expect(new Set(guided).size).toBe(4);

    const minutes = plans.map((p) => p.components.find((c) => c.kind === "guided")?.minutes);
    expect(minutes).toEqual([4, 6, 10, 15]);
  });

  it("keeps the chapter outcome identical across depths", () => {
    const outcomes = [0, 2, 3, 5].map(
      (band) => getFoundationDay({ ...base, vLevel: level(band) }).outcome
    );
    expect(new Set(outcomes).size).toBe(1);
  });

  it("adds inquiry only at depth 2 and above", () => {
    const low = getFoundationDay({ ...base, vLevel: level(0) });
    const high = getFoundationDay({ ...base, vLevel: level(4) });
    expect(low.components.some((c) => c.kind === "inquiry")).toBe(false);
    expect(high.components.some((c) => c.kind === "inquiry")).toBe(true);
  });

  it("respects a 3-minute budget", () => {
    const plan = getFoundationDay({
      ...base,
      vLevel: level(5),
      minutesAvailable: 3,
      tuning: { minutes: 3 },
    });
    expect(plan.minutes).toBeLessThanOrEqual(3);
    expect(plan.components.map((c) => c.kind)).toContain("wisdom");
    expect(plan.components.map((c) => c.kind)).toContain("night");
  });
});

describe("safety and paths", () => {
  it("clamps advanced inquiry when bypassing is flagged", () => {
    const plan = getFoundationDay({
      day: 63,
      vLevel: level(5),
      minutesAvailable: 40,
      bypassRisk: true,
    });
    expect(plan.depth).toBeLessThanOrEqual(1);
    expect(plan.components.some((c) => c.kind === "inquiry")).toBe(false);
  });

  it("changes exploration by path without changing the outcome", () => {
    const observer = getFoundationDay({
      ...base,
      vLevel: level(4),
      adaptivePath: "observer",
    });
    const inquirer = getFoundationDay({
      ...base,
      vLevel: level(4),
      adaptivePath: "inquirer",
    });
    expect(observer.exploration?.kind).toBe("v-level");
    expect(inquirer.exploration?.kind).toBe("neti-neti");
    expect(observer.outcome).toBe(inquirer.outcome);
    expect(observer.components.map((c) => c.kind)).toEqual(
      inquirer.components.map((c) => c.kind)
    );
  });

  it("lets the user turn inquiry off", () => {
    const plan = getFoundationDay({
      ...base,
      vLevel: level(4),
      tuning: { inquiry: false },
    });
    expect(plan.components.some((c) => c.kind === "inquiry")).toBe(false);
  });

  it("deepens with pace=deep and softens with pace=gentle", () => {
    const steady = getFoundationDay({ ...base, vLevel: level(2) });
    const deep = getFoundationDay({ ...base, vLevel: level(2), tuning: { pace: "deep" } });
    const gentle = getFoundationDay({ ...base, vLevel: level(2), tuning: { pace: "gentle" } });
    expect(steady.depth).toBe(1);
    expect(deep.depth).toBe(2);
    expect(gentle.depth).toBe(0);
  });
});

describe("session plan", () => {
  it("builds a runnable plan shaped like session-shell expects", () => {
    const plan = getFoundationDay({ ...base, vLevel: level(3) });
    expect(plan.sessionPlan.id).toContain("foundation:32");
    expect(plan.sessionPlan.steps.length).toBeGreaterThan(1);
    expect(plan.sessionPlan.steps[0].kind).toBe("wisdom-read");
    expect(plan.sessionPlan.steps.every((s) => s.est_minutes >= 0)).toBe(true);
    expect(plan.sessionPlan._meta?.composedBy).toBe("foundation-path-v2");
  });

  it("composes every one of the 118 days at every depth", () => {
    for (const meta of listFoundationDays()) {
      for (const band of [0, 2, 3, 5]) {
        const plan = getFoundationDay({
          day: meta.day,
          vLevel: level(band),
          minutesAvailable: 20,
        });
        expect(plan.day).toBe(meta.day);
        expect(plan.components.length).toBeGreaterThan(1);
        expect(plan.sessionPlan.steps.length).toBeGreaterThan(0);
      }
    }
  });
});
