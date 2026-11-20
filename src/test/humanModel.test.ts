import { describe, expect, it } from "vitest";
import {
  applyOutcome,
  buildHumanModel,
  HUMAN_LAYER_IDS,
  HUMAN_MODEL_DISCLAIMER,
  projectHumanModel,
  projectLayer,
  type HumanModel,
} from "@/lib/humanModel";

const NOW = new Date("2026-11-17T10:00:00Z");

function model(overrides: Record<string, unknown> = {}): HumanModel {
  return buildHumanModel({
    userId: "u1",
    now: NOW,
    dimensionBands: { body: 4, emotion: 5, thought: 6, awareness: 3 },
    capabilityLevels: { observation: 2, self_inquiry: 1, breath: 2 },
    overallBand: 4,
    sessionCount: 12,
    lastSessionAt: "2026-11-16T10:00:00Z",
    ...overrides,
  });
}

describe("human model", () => {
  it("builds all twelve layers with bounded state", () => {
    const m = model();
    expect(Object.keys(m.layers)).toHaveLength(12);
    for (const id of HUMAN_LAYER_IDS) {
      expect(m.layers[id].state).toBeGreaterThanOrEqual(0);
      expect(m.layers[id].state).toBeLessThanOrEqual(1);
      expect(m.layers[id].predicted.y1.mid).toBeLessThanOrEqual(m.layers[id].predicted.y10.mid);
    }
    expect(m.summary.readiness).toBeGreaterThan(0);
  });

  it("turns low sleep into a body drop and a rest intervention", () => {
    const m = model({ sleepHours: 4 });
    expect(m.layers.body.state).toBeLessThan(0.5);
    expect(m.layers.body.interventions).toContain("rest_protocol");
  });

  it("lowers body and emotion under pain", () => {
    const calm = model();
    const hurt = model({ painLevel: 8 });
    expect(hurt.layers.body.state).toBeLessThan(calm.layers.body.state);
    expect(hurt.layers.emotion.state).toBeLessThan(calm.layers.emotion.state);
  });

  it("marks the layer a loop belongs to as declining", () => {
    const m = model({ activeLoops: ["validation_seeking"] });
    expect(m.layers.identity.trajectory).toBe("declining");
    expect(m.layers.identity.evidence.some((e) => e.signal.includes("validation"))).toBe(true);
  });

  it("uses capability levels to raise the home layer", () => {
    const low = model({ capabilityLevels: { self_inquiry: 0 } });
    const high = model({ capabilityLevels: { self_inquiry: 5 } });
    expect(high.layers.identity.state).toBeGreaterThan(low.layers.identity.state);
  });

  it("writes a completed sitting back into the model", () => {
    const m = model();
    const before = m.layers.thought.state;
    const next = applyOutcome(m, {
      concept: "observation",
      completed: true,
      feltShift: "lighter",
      qualityScore: 0.9,
      at: "2026-11-17T11:00:00Z",
    });
    expect(next.layers.thought.state).toBeGreaterThan(before);
    expect(next.layers.thought.trajectory).toBe("rising");
    expect(next.version).toBe(m.version + 1);
  });

  it("does not reward an abandoned or heavier sitting", () => {
    const m = model();
    const before = m.layers.thought.state;
    const next = applyOutcome(m, {
      concept: "observation",
      completed: false,
      feltShift: "heavier",
    });
    expect(next.layers.thought.state).toBeLessThan(before);
  });

  it("projects further under practice than default", () => {
    const m = model();
    const def = projectHumanModel(m, "default");
    const practice = projectHumanModel(m, "practice");
    expect(practice.layers.thought.y10.mid).toBeGreaterThanOrEqual(def.layers.thought.y10.mid);
    expect(practice.disclaimer).toBe(HUMAN_MODEL_DISCLAIMER);
  });

  it("keeps projection ranges ordered at every horizon", () => {
    const projection = projectLayer(
      { id: "thought", state: 0.4, confidence: 0.5, interventions: ["observation"] },
      "intensive",
    );
    for (const band of [projection.y1, projection.y3, projection.y10]) {
      expect(band.low).toBeLessThanOrEqual(band.mid);
      expect(band.mid).toBeLessThanOrEqual(band.high);
    }
    expect(projection.y10.mid).toBeGreaterThanOrEqual(projection.y1.mid);
  });
});
