/**
 * THIRTY-DAY PLAN — the visible horizon.
 * ─────────────────────────────────────
 * One session per day, one carry, gates between phases. The user always knows
 * what today is, what is next, and why the next door is still closed.
 */

import type {
  PlanDay,
  PlanDayKind,
  PrescriptionNeed,
  SuitabilityDecision,
  ThirtyDayPlan,
} from "./types";

const LABELS: Record<string, string> = {
  observation: "Observation",
  self_inquiry: "Self-Inquiry",
  neti_neti: "Neti-Neti",
  witness: "Witnessing",
  breath: "Breath",
  body: "Body",
};

function dayKind(day: number): PlanDayKind {
  if (day % 7 === 0) return "review";
  if (day === 29) return "transfer";
  return "session";
}

function labelFor(day: number, concept: string): string {
  const name = LABELS[concept] ?? concept;
  if (day === 1) return `What ${name} is`;
  if (day === 2) return "First taste";
  if (day === 3) return `${name} · L1`;
  if (day === 7 || day === 14 || day === 21 || day === 28) return "Review & carry check";
  if (day === 29) return "Transfer into your day";
  if (day === 30) return "Integration & next spiral";
  return `${name} · practice`;
}

function intentFor(day: number): PrescriptionNeed["intent"] {
  if (day <= 2) return "orient";
  if (day <= 6) return "first_contact";
  if (day <= 27) return "train";
  return "integrate";
}

function minutesFor(day: number, suitability: SuitabilityDecision): number {
  if (suitability.verdict === "rest_only") return 8;
  if (suitability.verdict === "hold") return 3;
  if (suitability.verdict === "refer") return 0;
  if (day <= 2) return 6;
  if (day <= 6) return 10;
  if (day <= 27) return 16;
  return 14;
}

export function buildThirtyDayPlan(
  concept: string,
  suitability: SuitabilityDecision,
  opts: { completedSessions?: number } = {},
): ThirtyDayPlan {
  const completed = Math.max(0, Math.round(opts.completedSessions ?? 0));
  const unlockedThrough = Math.max(3, completed + 2);

  const days: PlanDay[] = [];
  for (let day = 1; day <= 30; day += 1) {
    const kind: PlanDayKind =
      suitability.verdict === "rest_only" && day <= 3
        ? "rest"
        : suitability.verdict === "hold" || suitability.verdict === "refer"
          ? "rest"
          : dayKind(day);

    days.push({
      day,
      kind,
      label:
        kind === "rest"
          ? suitability.verdict === "refer"
            ? "Speak to someone you trust"
            : "Rest protocol"
          : labelFor(day, concept),
      concept,
      intent: kind === "rest" ? "hold" : intentFor(day),
      minutes: kind === "rest" ? Math.min(10, Math.max(3, minutesFor(day, suitability))) : minutesFor(day, suitability),
      locked: day > unlockedThrough,
      gateReason:
        day > unlockedThrough
          ? `Complete ${unlockedThrough} sessions and the level gate first`
          : undefined,
    });
  }

  return {
    id: `plan30:${concept}`,
    title: `${LABELS[concept] ?? concept} · 30 days`,
    concept,
    days,
    gates: [
      "3 distinct seeds completed",
      "feltShift is not heavier after the last two sittings",
      "1 transfer mission completed",
    ],
  };
}
