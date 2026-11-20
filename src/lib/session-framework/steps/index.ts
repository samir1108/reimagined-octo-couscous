// Session Step Registry — Index
// Aggregates all step batches into a single registry.

import { OPENING_STEPS } from "./batch01-opening";
import { QUESTION_STEPS } from "./batch02-questions";
import { OBSERVATION_STEPS } from "./batch03-observation";
import { INSTRUCTION_STEPS } from "./batch04-instruction";
import { SOMATIC_STEPS } from "./batch05-somatic";
import { BREATH_STEPS } from "./batch06-breath";
import { MANTRA_STEPS } from "./batch07-mantra";
import { PATTERN_STEPS } from "./batch08-pattern";
import { CLOSING_STEPS } from "./batch09-closing";
import { JOURNALING_STEPS } from "./batch10-journaling";
import { DIALOGUE_STEPS } from "./batch11-dialogue";
import { SILENCE_STEPS } from "./batch12-silence";
import { INQUIRY_STEPS } from "./batch13-inquiry";
import { TEACHING_STEPS } from "./batch14-teaching";
import { REFLECTION_STEPS } from "./batch15-reflection";
import { VISUALIZATION_STEPS } from "./batch16-visualization";
import { EMOTIONAL_STEPS } from "./batch17-emotional";
import { WISDOM_STEPS } from "./batch18-wisdom";
import { DECISION_STEPS } from "./batch19-decision";
import { TRANSITION_STEPS } from "./batch20-transition";
import { EXTRAS_STEPS } from "./batch21-extras";
import type { SessionStepDefinition, StepRegistry } from "../types";

// Deduplicate by id, keeping the first (original batch) definition canonical.
const _all: SessionStepDefinition[] = [
  ...OPENING_STEPS,
  ...QUESTION_STEPS,
  ...OBSERVATION_STEPS,
  ...INSTRUCTION_STEPS,
  ...SOMATIC_STEPS,
  ...BREATH_STEPS,
  ...MANTRA_STEPS,
  ...PATTERN_STEPS,
  ...CLOSING_STEPS,
  ...JOURNALING_STEPS,
  ...DIALOGUE_STEPS,
  ...SILENCE_STEPS,
  ...INQUIRY_STEPS,
  ...TEACHING_STEPS,
  ...REFLECTION_STEPS,
  ...VISUALIZATION_STEPS,
  ...EMOTIONAL_STEPS,
  ...WISDOM_STEPS,
  ...DECISION_STEPS,
  ...TRANSITION_STEPS,
  ...EXTRAS_STEPS,
];
const _seen = new Set<string>();
export const ALL_STEPS: SessionStepDefinition[] = _all.filter((s) => {
  if (_seen.has(s.id)) return false;
  _seen.add(s.id);
  return true;
});

// Registry builder

export function buildStepRegistry(steps: SessionStepDefinition[]): StepRegistry {
  const byId = new Map<string, SessionStepDefinition>();
  const byCategory = new Map<string, SessionStepDefinition[]>();
  const byTag = new Map<string, SessionStepDefinition[]>();

  for (const step of steps) {
    byId.set(step.id, step);

    if (!byCategory.has(step.category)) byCategory.set(step.category, []);
    byCategory.get(step.category)!.push(step);

    for (const tag of step.personalizationTags) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag)!.push(step);
    }
  }

  return { steps: byId, byCategory, byTag };
}

let _registry: StepRegistry | null = null;

export function getStepRegistry(): StepRegistry {
  if (!_registry) {
    _registry = buildStepRegistry(ALL_STEPS);
  }
  return _registry;
}

export function getStepById(id: string): SessionStepDefinition | undefined {
  return getStepRegistry().steps.get(id);
}

export function getStepsByCategory(category: SessionStepCategory): SessionStepDefinition[] {
  return getStepRegistry().byCategory.get(category) || [];
}

export function getStepsByTag(tag: string): SessionStepDefinition[] {
  return getStepRegistry().byTag.get(tag) || [];
}

export type { SessionStepDefinition, SessionStepCategory, StepInteraction } from "../types";
