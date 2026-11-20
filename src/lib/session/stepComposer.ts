// Configurable session composer: selects a blueprint for the context and trims
// its steps to fit the available time budget, binding each to runtime kind/widget.

import { SESSION_BLUEPRINTS, getBlueprintsForContext, type SessionBlueprint } from "@/data/sessionBlueprints";
import { getStepRuntimeBinding } from "@/lib/session/stepRuntimeMap";
import { SESSION_STEP_BY_KEY } from "@/data/sessionStepCatalog";

export interface ComposeSessionStepsInput {
  gate: "morning" | "midday" | "evening" | "night";
  energy: "low" | "medium" | "high";
  timeBudgetMin: number;
  /** Optional preferred blueprint id. */
  blueprintId?: string;
  /** Optional step keys to force-include (prepended if not present). */
  forceSteps?: string[];
}

export interface ComposedStep {
  key: string;
  title: string;
  kind: string;
  widget?: string;
  minutes: number;
}

export interface ComposedSession {
  blueprintId: string;
  blueprintTitle: string;
  steps: ComposedStep[];
  totalMinutes: number;
}

export function composeSessionSteps(input: ComposeSessionStepsInput): ComposedSession {
  const { gate, energy, timeBudgetMin, blueprintId, forceSteps } = input;

  let blueprint: SessionBlueprint | undefined;
  if (blueprintId) blueprint = SESSION_BLUEPRINTS.find((b) => b.id === blueprintId);
  if (!blueprint) {
    const candidates = getBlueprintsForContext(gate, energy, timeBudgetMin);
    // pick the one with the largest minMinutes that fits (most depth for the time)
    blueprint = candidates.sort((a, b) => b.minMinutes - a.minMinutes)[0];
  }
  if (!blueprint) {
    // fallback: first blueprint
    blueprint = SESSION_BLUEPRINTS[0];
  }

  // Build step list, trimming from the end to fit budget, keeping first & last (session_complete).
  const rawSteps = [...blueprint.steps];
  const forced = (forceSteps ?? []).filter((k) => !rawSteps.includes(k));
  const stepsWithForced = [...forced, ...rawSteps];

  const bound: ComposedStep[] = stepsWithForced.map((key) => {
    const b = getStepRuntimeBinding(key);
    const def = SESSION_STEP_BY_KEY[key];
    return {
      key,
      title: def?.title ?? key,
      kind: b.kind,
      widget: b.widget,
      minutes: b.minutes,
    };
  });

  // Trim to budget: keep first and last, drop middle steps that exceed budget.
  const result: ComposedStep[] = [];
  let used = 0;
  const last = bound[bound.length - 1];
  const middle = bound.slice(0, -1);

  for (const s of middle) {
    if (used + s.minutes + (last?.minutes ?? 0) <= timeBudgetMin || result.length === 0) {
      result.push(s);
      used += s.minutes;
    } else {
      break;
    }
  }
  if (last && !result.includes(last)) {
    result.push(last);
    used += last.minutes;
  }

  return {
    blueprintId: blueprint.id,
    blueprintTitle: blueprint.title,
    steps: result,
    totalMinutes: used,
  };
}
