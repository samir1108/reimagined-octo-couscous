import { describe, expect, it } from "vitest";
import {
  applySessionToModel,
  buildHumanModel,
  normalizeQualityScore,
} from "@/lib/humanModel";

const NOW = new Date("2026-11-17T10:00:00Z");

function model() {
  return buildHumanModel({
    userId: "u1",
    now: NOW,
    dimensionBands: { thought: 5, identity: 4 },
    capabilityLevels: { observation: 2, self_inquiry: 1 },
    sessionCount: 10,
  });
}

describe("human model ledger", () => {
  it("normalises 0..1 and 0..100 quality", () => {
    expect(normalizeQualityScore(0.9)).toBe(0.9);
    expect(normalizeQualityScore(90)).toBe(0.9);
    expect(normalizeQualityScore(undefined)).toBeUndefined();
    expect(normalizeQualityScore(Number.NaN)).toBeUndefined();
  });

  it("moves the observation layer after a completed sitting", () => {
    const before = model();
    const next = applySessionToModel(before, {
      userId: "u1",
      concept: "observation",
      completed: true,
      qualityScore: 90,
      feltShift: "lighter",
    });
    expect(next.layers.thought.state).toBeGreaterThan(before.layers.thought.state);
    expect(next.layers.thought.trajectory).toBe("rising");
    expect(next.version).toBe(before.version + 1);
  });

  it("moves identity after self-inquiry and not thought", () => {
    const before = model();
    const next = applySessionToModel(before, {
      userId: "u1",
      concept: "self_inquiry",
      completed: true,
      qualityScore: 0.85,
    });
    expect(next.layers.identity.state).toBeGreaterThan(before.layers.identity.state);
    expect(next.layers.thought.state).toBe(before.layers.thought.state);
  });

  it("does not reward an abandoned or heavier sitting", () => {
    const before = model();
    const next = applySessionToModel(before, {
      userId: "u1",
      concept: "observation",
      completed: false,
      qualityScore: 20,
      feltShift: "heavier",
    });
    expect(next.layers.thought.state).toBeLessThan(before.layers.thought.state);
    expect(next.layers.thought.trajectory).toBe("declining");
  });
});
