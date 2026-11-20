import type { StepKind } from "./types";
import type { CompletedStepRecord } from "./types";

export type TransitionAction = "next" | "skip" | "repeat" | "branch" | "inject";

export interface TransitionRule {
  from: StepKind | "*";
  condition: (context: TransitionContext) => boolean;
  action: TransitionAction;
  target?: StepKind | StepKind[];
  injectCount?: number;
}

export interface TransitionContext {
  currentStep: { kind: StepKind; title: string; config?: Record<string, unknown> };
  sessionState: {
    completedSteps: CompletedStepRecord[];
    skippedSteps: CompletedStepRecord[];
    totalSteps: number;
    currentIndex: number;
  };
  stepPayload: Record<string, unknown>;
}

export const defaultTransitionRules: TransitionRule[] = [
  {
    from: "breathwork",
    condition: (ctx) => (ctx.stepPayload as Record<string, unknown>)?.skipped === true,
    action: "inject",
    target: "wisdom-read",
  },
  {
    from: "witness",
    condition: (ctx) => ((ctx.stepPayload as Record<string, unknown>)?.thoughts ?? 0) > 10,
    action: "branch",
    target: ["journal", "self_inquiry"],
  },
  {
    from: "self_inquiry",
    condition: (ctx) => ((ctx.stepPayload as Record<string, unknown>)?.response?.length ?? 0) > 50,
    action: "inject",
    target: "reflection",
  },
  {
    from: "body_scan",
    condition: (ctx) => ((ctx.stepPayload as Record<string, unknown>)?.completedRegions?.length ?? 0) === 0,
    action: "repeat",
  },
  {
    from: "*",
    condition: (ctx) => ctx.sessionState.currentIndex >= ctx.sessionState.totalSteps - 1,
    action: "next",
  },
];

export function evaluateTransition(
  rules: TransitionRule[],
  context: TransitionContext
): { action: TransitionAction; target?: StepKind | StepKind[] } {
  for (const rule of rules) {
    if (rule.from !== "*" && rule.from !== context.currentStep.kind) continue;
    if (rule.condition(context)) {
      return { action: rule.action, target: rule.target };
    }
  }
  return { action: "next" };
}

export function getNextStepIndex(
  currentIndex: number,
  totalSteps: number,
  action: TransitionAction
): number {
  switch (action) {
    case "next":
      return Math.min(currentIndex + 1, totalSteps);
    case "skip":
      return Math.min(currentIndex + 1, totalSteps);
    case "repeat":
      return currentIndex;
    case "branch":
    case "inject":
      return currentIndex + 1;
    default:
      return Math.min(currentIndex + 1, totalSteps);
  }
}
