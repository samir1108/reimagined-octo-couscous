/**
 * NEED ENGINE — routing
 * ─────────────────────
 * The decision names a door. This module turns that door into a real route
 * and a real session shape, reusing the ladders that already exist instead of
 * inventing a parallel content library.
 */

import type { NeedDecision, NeedSessionShape } from "./types";

export function conceptSessionRoute(decision: NeedDecision): string {
  const minutes = Math.round(decision.shape.minutes);
  switch (decision.ladder) {
    case "observation":
      return `/experience/observation/session?level=${decision.entryLevel}&min=${minutes}`;
    case "self_inquiry":
      return "/experience/self-inquiry/session";
    case "neti_neti":
      return "/experience/neti-neti/session";
    default:
      return `/app/guide?mode=open`;
  }
}

export function needBlockLabel(decision: NeedDecision): string {
  if (decision.intent === "orient") return `Meet ${decision.label}`;
  if (decision.intent === "first_contact") return `First ${decision.label} sitting`;
  if (decision.intent === "integrate") return `Integrate ${decision.label}`;
  return `${decision.label} practice`;
}

export function needBlockIntro(decision: NeedDecision): string {
  const first = decision.shape.steps[0];
  return first ? first.body : decision.why;
}

export function needSessionShape(decision: NeedDecision): NeedSessionShape {
  return decision.shape;
}
