// Adaptive Session Controller
// Evaluates a framework's AdaptationRules against current session state and
// returns the action (if any) the runtime should take.

import type { AdaptationRule, FrameworkStep } from "../types";

export interface AdaptationContext {
  responseTimeSeconds?: number;
  responseQuality?: number;
  userState?: "struggling" | "engaged" | "overwhelmed" | "distress" | "confusion";
  stepIndex?: number;
  totalSteps?: number;
  timeRemainingSeconds?: number;
}

export interface AdaptationDecision {
  ruleId: string;
  action: AdaptationRule["action"];
  params?: Record<string, unknown>;
  reason: string;
}

export function evaluateAdaptations(
  rules: AdaptationRule[],
  ctx: AdaptationContext,
): AdaptationDecision | null {
  const triggered: AdaptationDecision[] = [];
  for (const rule of rules) {
    let fires = false;
    // Simple trigger matching against userState and condition strings.
    if (rule.trigger && ctx.userState && rule.trigger.toLowerCase().includes(ctx.userState)) {
      fires = true;
    }
    // condition string heuristics (response_time > 30, response_quality > 0.7, etc.)
    if (rule.condition && !fires) {
      const c = rule.condition.toLowerCase();
      if (c.includes("response_time") && typeof ctx.responseTimeSeconds === "number") {
        const m = c.match(/response_time\s*>\s*(\d+)/);
        if (m && ctx.responseTimeSeconds > Number(m[1])) fires = true;
      }
      if (c.includes("response_quality") && typeof ctx.responseQuality === "number") {
        const m = c.match(/response_quality\s*>\s*([\d.]+)/);
        if (m && ctx.responseQuality > Number(m[1])) fires = true;
      }
      if (c.includes("overwhelm") && ctx.userState === "overwhelmed") fires = true;
      if (c.includes("distress") && ctx.userState === "distress") fires = true;
      if (c.includes("confusion") && ctx.userState === "confusion") fires = true;
    }
    if (fires) {
      triggered.push({ ruleId: rule.id, action: rule.action, params: rule.params, reason: `${rule.trigger}${rule.condition ? ` (${rule.condition})` : ""}` });
    }
  }
  if (triggered.length === 0) return null;
  // Highest priority wins (lower number = higher priority).
  triggered.sort((a, b) => {
    const pa = rules.find((r) => r.id === a.ruleId)?.priority ?? 99;
    const pb = rules.find((r) => r.id === b.ruleId)?.priority ?? 99;
    return pa - pb;
  });
  return triggered[0];
}

export function applyAdaptationToPlan(
  plan: import("@/lib/session-shell/types").SessionPlan,
  decision: AdaptationDecision,
): import("@/lib/session-shell/types").SessionPlan {
  const steps = [...plan.steps];
  switch (decision.action) {
    case "skip":
      if (steps.length > 1) steps.pop();
      break;
    case "shorten":
      for (const s of steps) s.est_minutes = Math.max(0.25, s.est_minutes * 0.7);
      break;
    case "simplify":
      for (const s of steps) s.prompt = s.prompt ? `Simplify: ${s.prompt}` : s.prompt;
      break;
    case "ground":
      // Insert a grounding step at the current position by tagging; runtime handles.
      break;
    case "pause":
    case "extend":
    case "deepen":
    case "switch":
    default:
      break;
  }
  return { ...plan, steps };
}
