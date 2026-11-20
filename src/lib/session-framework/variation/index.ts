// Variation Engine
// Generates controlled variations of a practice/framework.

import type { SessionStepDefinition, SessionFramework } from "../types";

export interface VariationAxis {
  id: string;
  options: string[];
}

export interface VariationRequest {
  baseId: string;
  axes: Record<string, string>;
}

export const DEFAULT_VARIATION_AXES: VariationAxis[] = [
  { id: "duration", options: ["1", "3", "5", "10", "20"] },
  { id: "guide", options: ["silent", "gentle", "socratic", "instructional"] },
  { id: "interaction", options: ["listen", "speak", "write", "observe"] },
  { id: "eyes", options: ["open", "closed", "choice"] },
  { id: "reflection", options: ["none", "one-question", "journal"] },
];

export function applyVariationToStep(
  step: SessionStepDefinition,
  axes: Record<string, string>
): SessionStepDefinition {
  const clone: SessionStepDefinition = JSON.parse(JSON.stringify(step));
  if (axes.duration) {
    const mins = Number(axes.duration);
    if (!isNaN(mins)) clone.defaultDurationSeconds = mins * 60;
  }
  if (axes.guide) {
    clone.personalizationTags = [...(clone.personalizationTags || []), `guide:${axes.guide}`];
  }
  if (axes.interaction) {
    clone.personalizationTags = [...(clone.personalizationTags || []), `interaction:${axes.interaction}`];
  }
  clone.id = `${step.id}__${Object.entries(axes).map(([k, v]) => `${k}-${v}`).join("_")}`;
  return clone;
}

export function generateVariations(
  step: SessionStepDefinition,
  axes: VariationAxis[] = DEFAULT_VARIATION_AXES
): SessionStepDefinition[] {
  const results: SessionStepDefinition[] = [];
  // generate cartesian product but cap to sensible combos
  const combos: Record<string, string>[] = [{}];
  for (const axis of axes) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const opt of axis.options) {
        next.push({ ...combo, [axis.id]: opt });
      }
    }
    combos.push(...next);
    // cap explosion
    if (combos.length > 200) break;
  }
  // only take first 50 meaningful
  for (const combo of combos.slice(0, 50)) {
    results.push(applyVariationToStep(step, combo));
  }
  return results;
}

export function makeVariationId(baseId: string, axes: Record<string, string>): string {
  return `${baseId}__${Object.entries(axes).map(([k, v]) => `${k}-${v}`).join("_")}`;
}

export default { applyVariationToStep, generateVariations, makeVariationId, DEFAULT_VARIATION_AXES };
