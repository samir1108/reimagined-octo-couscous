// Session Composer Engine
// Assembles ordered session steps from a framework and context.

import type {
  SessionFramework,
  FrameworkStep,
  FrameworkContext,
  ComposedSession,
  ComposedStep,
  SessionStepDefinition,
} from "../types";
import { getStepById } from "../steps";

export interface ComposeOptions {
  framework: SessionFramework;
  context: FrameworkContext;
  stepOverrides?: Record<string, Partial<ComposedStep>>;
}

function resolveStepDef(stepId: string): SessionStepDefinition | undefined {
  return getStepById(stepId);
}

function resolveDuration(step: FrameworkStep, def?: SessionStepDefinition, budget?: number): number {
  if (step.durationSeconds && step.durationSeconds > 0) return step.durationSeconds;
  if (def?.defaultDurationSeconds) return def.defaultDurationSeconds;
  return 60;
}

export function composeSession(options: ComposeOptions): ComposedSession {
  const { framework, context } = options;
  const composed: ComposedStep[] = [];
  let total = 0;
  const budgetSec = context.timeBudgetMin * 60;

  for (const fwStep of framework.steps) {
    const def = resolveStepDef(fwStep.stepId);
    const duration = resolveDuration(fwStep, def, budgetSec);
    // Skip optional steps that would exceed the time budget.
    if (fwStep.optional && total + duration > budgetSec) continue;
    // For required steps, clamp duration to remaining budget (floor 30s).
    const remaining = Math.max(0, budgetSec - total);
    const finalDuration = fwStep.optional ? duration : Math.max(30, Math.min(duration, remaining || duration));
    if (!fwStep.optional && remaining <= 0) continue;
    const composedStep: ComposedStep = {
      id: `${framework.id}-${fwStep.id}`,
      stepDefId: fwStep.stepId,
      title: def?.title ?? fwStep.stepId,
      purpose: fwStep.purpose || def?.purpose || "",
      interaction: fwStep.interaction,
       durationSeconds: finalDuration,
      optional: fwStep.optional,
      canSkip: def?.canSkip ?? true,
      prompt: def?.prompt,
      guidance: fwStep.instructions ?? def?.guidance,
      safetyProfile: def?.safetyProfile,
    };
    if (options.stepOverrides?.[fwStep.stepId]) {
      Object.assign(composedStep, options.stepOverrides[fwStep.stepId]);
    }
    composed.push(composedStep);
    total += duration;
  }

  return {
    id: `cs-${framework.id}-${Date.now()}`,
    frameworkId: framework.id,
    frameworkName: framework.name,
    purpose: framework.purpose,
    steps: composed,
    totalDurationSeconds: total,
    adaptationRules: framework.adaptationRules,
    metadata: {
      gate: context.gate,
      energy: context.energy,
      journeyDay: context.journeyDay,
      budgetMin: context.timeBudgetMin,
    },
  };
}

export function validateComposition(session: ComposedSession): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (session.steps.length === 0) errors.push("Session has no steps");
  if (session.totalDurationSeconds <= 0) errors.push("Invalid total duration");
  const required = session.steps.filter((s) => !s.optional);
  if (required.length === 0) errors.push("No required steps");
  return { valid: errors.length === 0, errors };
}

export default composeSession;
