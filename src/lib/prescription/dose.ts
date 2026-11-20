/**
 * DOSE — how much of this practice, today.
 * ───────────────────────────────────────
 * One decision, not a buffet. Dose is clamped by safety first, then by
 * familiarity and capability, never by enthusiasm.
 */

import type { Dose, PrescriptionNeed, SuitabilityDecision } from "./types";

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

export interface DoseInput {
  intent: PrescriptionNeed["intent"];
  suitability: SuitabilityDecision;
  familiarity: number;
  capabilityLevel?: number;
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
}

export function computeDose(input: DoseInput): Dose {
  const { intent, suitability, familiarity } = input;
  const budget = clamp(input.timeBudgetMin ?? 10, 3, 30);
  const capability = clamp(input.capabilityLevel ?? 0, 0, 5);

  if (suitability.verdict === "rest_only") {
    return {
      minutes: Math.min(10, Math.max(5, suitability.maxMinutes)),
      depth: "rest",
      intensity: "rest",
      teachRatio: 0.1,
      frequencyPerWeek: 7,
      reviewAfterDays: 3,
    };
  }

  if (suitability.verdict === "hold") {
    return {
      minutes: 3,
      depth: "rest",
      intensity: "rest",
      teachRatio: 0,
      frequencyPerWeek: 3,
      reviewAfterDays: 1,
    };
  }

  if (suitability.verdict === "refer") {
    return {
      minutes: 0,
      depth: "rest",
      intensity: "rest",
      teachRatio: 0,
      frequencyPerWeek: 0,
      reviewAfterDays: 1,
    };
  }

  const adapted = suitability.verdict === "adapt";
  const cap = Math.min(budget, suitability.maxMinutes);

  let minutes: number;
  let depth: Dose["depth"];
  let intensity: Dose["intensity"];
  let teachRatio: number;

  if (intent === "orient" || familiarity < 0.2) {
    minutes = 6;
    depth = "taste";
    intensity = "gentle";
    teachRatio = 0.6;
  } else if (intent === "first_contact") {
    minutes = 10;
    depth = "guided";
    intensity = "gentle";
    teachRatio = 0.35;
  } else if (intent === "integrate") {
    minutes = 14;
    depth = "deep";
    intensity = "steady";
    teachRatio = 0.25;
  } else {
    minutes = capability >= 3 ? 22 : 16;
    depth = "deep";
    intensity = capability >= 3 ? "deep" : "steady";
    teachRatio = 0.15;
  }

  if (input.energy === "low") {
    minutes = Math.min(minutes, 8);
    intensity = intensity === "deep" ? "steady" : intensity;
  }

  minutes = clamp(Math.min(minutes, cap), 3, 30);

  return {
    minutes,
    depth,
    intensity,
    teachRatio,
    frequencyPerWeek: adapted ? 4 : intent === "train" ? 5 : 3,
    reviewAfterDays: intent === "integrate" ? 14 : 7,
  };
}
