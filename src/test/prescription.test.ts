import { describe, expect, it } from "vitest";
import {
  buildThirtyDayPlan,
  computeDose,
  decideSuitability,
  MYTH_CARDS,
  OBSERVER_ARC,
  prescribe,
  suitabilitySummary,
  type PrescriptionNeed,
} from "@/lib/prescription";

function need(patch: Partial<PrescriptionNeed> = {}): PrescriptionNeed {
  return {
    concept: "observation",
    label: "Observation",
    intent: "orient",
    familiarity: 0,
    why: "Observation is new for you.",
    evidence: ["0 completed sittings"],
    ladder: "observation",
    entryLevel: 1,
    ...patch,
  };
}

describe("suitability gate", () => {
  it("clears a normal day", () => {
    const d = decideSuitability({ sleepHours: 7, sleepQuality: 4, painLevel: 0 });
    expect(d.verdict).toBe("clear");
    expect(d.allowMeditation).toBe(true);
    expect(d.allowLongSit).toBe(true);
  });

  it("sends a sleepy user to rest, not meditation", () => {
    const d = decideSuitability({ sleepHours: 4, sleepQuality: 2 });
    expect(d.verdict).toBe("rest_only");
    expect(d.allowMeditation).toBe(false);
    expect(d.maxMinutes).toBeLessThanOrEqual(10);
    expect(suitabilitySummary(d)).toContain("Rest");
  });

  it("adapts panic away from closed eyes and breath retention", () => {
    const d = decideSuitability({ panic: true });
    expect(d.verdict).toBe("adapt");
    expect(d.allowClosedEyes).toBe(false);
    expect(d.allowBreathRetention).toBe(false);
    expect(d.maxMinutes).toBeLessThanOrEqual(8);
  });

  it("adapts dissociation with sensory orientation", () => {
    const d = decideSuitability({ dissociation: true });
    expect(d.verdict).toBe("adapt");
    expect(d.recommendedProtocol).toContain("Sensory");
  });

  it("shortens acute pain", () => {
    const d = decideSuitability({ painLevel: 7 });
    expect(d.verdict).toBe("adapt");
    expect(d.maxMinutes).toBeLessThanOrEqual(6);
  });

  it("refers psychosis history and holds crisis", () => {
    expect(decideSuitability({ psychosisHistory: true }).verdict).toBe("refer");
    expect(decideSuitability({ crisis: true }).verdict).toBe("hold");
  });

  it("blocks breath retention in pregnancy", () => {
    const d = decideSuitability({ pregnancy: true });
    expect(d.allowBreathRetention).toBe(false);
  });

  it("holds when reality contact feels thin", () => {
    const d = decideSuitability({ energySignals: ["reality-contact-loss"] });
    expect(d.verdict).toBe("hold");
    expect(d.maxMinutes).toBeLessThanOrEqual(3);
    expect(d.allowMeditation).toBe(false);
  });

  it("adapts on check-in energy signs", () => {
    const d = decideSuitability({ energySignals: ["kriya-movements"] });
    expect(d.verdict).toBe("adapt");
    expect(d.allowBreathRetention).toBe(false);
    expect(d.maxMinutes).toBeLessThanOrEqual(10);
  });

  it("does not pathologise normal energy signs", () => {
    const d = decideSuitability({ energySignals: ["spinal-heat"] });
    expect(d.verdict).toBe("clear");
  });
});

describe("dose", () => {
  it("keeps orientation short and teaching-heavy", () => {
    const dose = computeDose({
      intent: "orient",
      suitability: decideSuitability(),
      familiarity: 0,
    });
    expect(dose.minutes).toBeLessThanOrEqual(6);
    expect(dose.teachRatio).toBeGreaterThanOrEqual(0.5);
    expect(dose.depth).toBe("taste");
  });

  it("clamps training to an adapted ceiling", () => {
    const dose = computeDose({
      intent: "train",
      suitability: decideSuitability({ painLevel: 7 }),
      familiarity: 1,
      capabilityLevel: 4,
    });
    expect(dose.minutes).toBeLessThanOrEqual(6);
  });
});

describe("prescription", () => {
  it("produces one step for orientation", () => {
    const p = prescribe({ need: need() });
    expect(p.oneStep).toBe(true);
    expect(p.arc.spiralLabel).toBe("Attention");
    expect(p.arc.sessionNumber).toBe(1);
    expect(p.nextPreview).toContain("Next");
    expect(p.dose.minutes).toBeLessThanOrEqual(6);
    expect(p.claims.length).toBeGreaterThan(0);
    expect(p.claims[0].id.startsWith("k.")).toBe(true);
  });

  it("carries the safety note into why", () => {
    const p = prescribe({ need: need(), suitability: { sleepHours: 4, sleepQuality: 2 } });
    expect(p.suitability.verdict).toBe("rest_only");
    expect(p.why).toContain("Safety");
    expect(p.oneStep).toBe(true);
  });

  it("caps energy practices below capability L3", () => {
    const p = prescribe({
      need: need({
        concept: "neti_neti",
        label: "Neti-Neti",
        intent: "train",
        familiarity: 1,
        ladder: "neti_neti",
      }),
      capabilityLevel: 1,
    });
    expect(p.dose.minutes).toBeLessThanOrEqual(12);
    expect(p.dose.intensity).not.toBe("deep");
    expect(p.evidence.join(" ")).toContain("energy readiness");
  });

  it("unlocks the plan horizon from real completed sessions", () => {
    const plan = buildThirtyDayPlan("observation", decideSuitability(), { completedSessions: 4 });
    expect(plan.days[5].locked).toBe(false);
    expect(plan.days[7].locked).toBe(true);
  });
});

describe("thirty day plan", () => {
  it("has 30 days, gates, and locked horizon", () => {
    const plan = buildThirtyDayPlan("observation", decideSuitability());
    expect(plan.days).toHaveLength(30);
    expect(plan.gates.length).toBeGreaterThanOrEqual(3);
    expect(plan.days.slice(0, 3).every((d) => !d.locked)).toBe(true);
    expect(plan.days[5].locked).toBe(true);
    expect(plan.days[6].kind).toBe("review");
    expect(plan.days[28].kind).toBe("transfer");
  });

  it("turns the first days into rest when sleep is low", () => {
    const plan = buildThirtyDayPlan("observation", decideSuitability({ sleepHours: 4, sleepQuality: 1 }));
    expect(plan.days.slice(0, 3).every((d) => d.kind === "rest")).toBe(true);
  });
});

describe("myths and observer arc", () => {
  it("corrects mind-holding and sleep confusion", () => {
    expect(MYTH_CARDS).toHaveLength(4);
    expect(MYTH_CARDS.map((m) => m.fact).join(" ")).toContain("alert rest");
    expect(MYTH_CARDS.map((m) => m.fact).join(" ")).toContain("Holding creates tension");
  });

  it("has the five observer sessions", () => {
    expect(OBSERVER_ARC).toHaveLength(5);
    expect(OBSERVER_ARC[4].teaching).toContain("Not this body");
    expect(OBSERVER_ARC[1].title).toContain("emotion");
  });
});
