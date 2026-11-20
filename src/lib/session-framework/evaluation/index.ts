// Evaluation Engine
// Lightweight quality/coherence/repetition checks for composed sessions.

import type { ComposedSession } from "../types";

export interface EvaluationResult {
  score: number; // 0..1
  issues: string[];
  passed: boolean;
}

export function evaluateSession(session: ComposedSession): EvaluationResult {
  const issues: string[] = [];
  let score = 1;

  if (session.steps.length === 0) { issues.push("empty session"); score -= 0.5; }
  if (session.totalDurationSeconds <= 0) { issues.push("invalid duration"); score -= 0.3; }

  const required = session.steps.filter((s) => !s.optional);
  if (required.length === 0) { issues.push("no required steps"); score -= 0.2; }

  // Repetition check: same stepId twice in a row
  for (let i = 1; i < session.steps.length; i++) {
    if (session.steps[i].stepDefId === session.steps[i - 1].stepDefId) {
      issues.push(`repeated adjacent step: ${session.steps[i].stepDefId}`);
      score -= 0.1;
    }
  }

  // Closing check: last step should be a closing/completion step
  const last = session.steps[session.steps.length - 1];
  if (last && !/complet|close|return|reorient/i.test(last.title + " " + last.stepDefId)) {
    issues.push("missing closing step");
    score -= 0.1;
  }

  score = Math.max(0, Math.min(1, score));
  return { score, issues, passed: issues.length === 0 };
}

export function evaluateStepCoverage(session: ComposedSession): { covered: string[]; missing: string[] } {
  const covered = session.steps.map((s) => s.stepDefId);
  return { covered, missing: [] };
}
