// Validation Engine
// Validates practices (steps), frameworks, and compositions.

import type { SessionStepDefinition, SessionFramework, ComposedSession } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateStep(step: SessionStepDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!step.id) errors.push("Step missing id");
  if (!step.title) errors.push("Step missing title");
  if (!step.purpose) warnings.push("Step missing purpose");
  if (step.defaultDurationSeconds !== undefined && step.defaultDurationSeconds < 0) errors.push("Negative duration");
  if (!step.personalizationTags || step.personalizationTags.length === 0) warnings.push("No personalization tags");
  return { valid: errors.length === 0, errors, warnings };
}

export function validateFramework(fw: SessionFramework): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!fw.id) errors.push("Framework missing id");
  if (!fw.name) errors.push("Framework missing name");
  if (!fw.steps || fw.steps.length === 0) errors.push("Framework has no steps");
  if (!fw.preferredDurations || fw.preferredDurations.length === 0) warnings.push("No preferred durations");
  if (fw.completionCriteria.minStepsCompleted > (fw.steps?.length ?? 0)) errors.push("minStepsCompleted exceeds step count");
  // check step ids resolve
  for (const s of fw.steps ?? []) {
    if (!s.stepId) errors.push(`Framework step missing stepId in ${fw.id}`);
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function validateComposition(session: ComposedSession): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!session.steps || session.steps.length === 0) errors.push("Empty session");
  if (session.totalDurationSeconds <= 0) errors.push("Invalid duration");
  const required = (session.steps ?? []).filter((s) => !s.optional);
  if (required.length === 0) warnings.push("No required steps");
  return { valid: errors.length === 0, errors, warnings };
}

export function validateRegistry(steps: SessionStepDefinition[], frameworks: SessionFramework[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stepIds = new Set(steps.map((s) => s.id));
  if (stepIds.size !== steps.length) errors.push("Duplicate step ids");
  const fwIds = new Set(frameworks.map((f) => f.id));
  if (fwIds.size !== frameworks.length) errors.push("Duplicate framework ids");
  // framework step references
  for (const fw of frameworks) {
    for (const s of fw.steps) {
      if (!stepIds.has(s.stepId)) warnings.push(`Framework ${fw.id} references unknown step ${s.stepId}`);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

export default { validateStep, validateFramework, validateComposition, validateRegistry };
