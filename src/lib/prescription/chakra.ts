/**
 * CHAKRA READINESS — a lens, never a diagnosis.
 * ─────────────────────────────────────────────
 * Readiness is derived from the body/identity/meaning layers. It gates deeper
 * energy practices; it does not label a person.
 */

import type { HumanModel } from "@/lib/humanModel";

export type ChakraReadinessLevel = "grounded" | "emerging" | "open";

export interface ChakraReadiness {
  level: ChakraReadinessLevel;
  score: number;
  label: string;
  note: string;
  allowIntenseEnergy: boolean;
}

export function chakraReadiness(model: HumanModel): ChakraReadiness {
  const body = model.layers.body.state;
  const identity = model.layers.identity.state;
  const meaning = model.layers.meaning.state;
  const score = Math.round(((body + identity + meaning) / 3) * 100) / 100;

  if (score >= 0.7) {
    return {
      level: "open",
      score,
      label: "Open",
      note: "Deeper energy practices are available, with grounding after each sit.",
      allowIntenseEnergy: true,
    };
  }

  if (score >= 0.45) {
    return {
      level: "emerging",
      score,
      label: "Emerging",
      note: "Gentle energy work only: no retention, no force, short sits.",
      allowIntenseEnergy: false,
    };
  }

  return {
    level: "grounded",
    score,
    label: "Grounded",
    note: "Body and identity first. Energy practices wait until the base is stable.",
    allowIntenseEnergy: false,
  };
}
