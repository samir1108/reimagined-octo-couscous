// Adapter: Session Framework module (ComposedSession) → Generative Session Shell (SessionPlan).
// This is the single seam that activates the data-driven step/framework library
// inside the live UniversalSessionShell runtime.

import type { ComposedSession, ComposedStep } from "@/lib/session-framework";
import type { SessionPlan, SessionStep } from "@/lib/session-shell/types";
import { getStepById } from "@/lib/session-framework";
import { composeSession } from "./composer";

export function composedStepToSessionStep(cs: ComposedStep): SessionStep {
  const def = getStepById(cs.stepDefId);
  return {
    kind: "data-step",
    title: cs.title,
    prompt: cs.prompt ?? def?.guidance ?? cs.purpose,
    guidance: def?.guidance
      ? { summary: def.guidance, beats: [{ detail: def.guidance }] }
      : undefined,
    params: {
      stepDefId: cs.stepDefId,
      interaction: cs.interaction,
      safetyProfile: cs.safetyProfile,
      canSkip: cs.canSkip,
    },
    optional: cs.optional,
    est_minutes: Math.max(0.25, Math.round((cs.durationSeconds / 60) * 100) / 100),
  };
}

export function composedSessionToPlan(cs: ComposedSession): SessionPlan {
  return {
    id: cs.id,
    intent: cs.purpose,
    intro: `A ${cs.frameworkName} session composed for you.`,
    steps: cs.steps.map(composedStepToSessionStep),
    _meta: {
      composedBy: "session-framework",
      archetype: cs.frameworkId,
    },
  };
}

export function frameworkToPlan(
  framework: import("@/lib/session-framework").SessionFramework,
  context: import("@/lib/session-framework").FrameworkContext,
  overrides?: Record<string, Partial<import("@/lib/session-framework").ComposedStep>>,
): SessionPlan {
  const composed = composeSession({ framework, context, stepOverrides: overrides });
  return composedSessionToPlan(composed);
}
