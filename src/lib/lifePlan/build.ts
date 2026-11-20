/**
 * BUILD — deterministic day / season / decade artifacts.
 */

import {
  HUMAN_LAYERS,
  HUMAN_MODEL_DISCLAIMER,
  type HumanLayerId,
  type HumanModel,
} from "@/lib/humanModel";
import type {
  DayPlan,
  DecadeVision,
  LifePlanBundle,
  SeasonPlan,
  SeasonWeek,
} from "./types";

const label = (id: HumanLayerId): string =>
  HUMAN_LAYERS.find((layer) => layer.id === id)?.label ?? id;

const practiceFor = (id: HumanLayerId): string =>
  HUMAN_LAYERS.find((layer) => layer.id === id)?.intervention ?? "observation";

function isoDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function buildDayPlan(model: HumanModel, now: Date = new Date()): DayPlan {
  const weakest = model.summary.weakest;
  const strongest = model.summary.strongest;
  const focus = label(weakest);
  const resource = label(strongest);

  return {
    id: `day:${isoDate(now)}`,
    date: isoDate(now),
    title: `A day for ${focus}`,
    morning: `6–10 minutes of ${practiceFor(weakest)}. No outcome, just evidence.`,
    midday: `One 60-second check: where is ${focus.toLowerCase()} right now?`,
    evening: `Write one line about ${focus.toLowerCase()}, then use ${resource.toLowerCase()} to close the day.`,
    carry: `One small act that serves ${focus.toLowerCase()} — done without announcing it.`,
    basis: [
      `weakest layer: ${focus}`,
      `strongest layer: ${resource}`,
      `readiness: ${Math.round(model.summary.readiness * 100)}%`,
    ],
  };
}

export function buildSeasonPlan(model: HumanModel, now: Date = new Date()): SeasonPlan {
  const weakest = model.summary.weakest;
  const focus = label(weakest);
  const practice = practiceFor(weakest);

  const weeks: SeasonWeek[] = [
    { week: 1, focus: `Orient to ${focus.toLowerCase()}`, sessions: 3, review: "orientation only" },
    { week: 2, focus: `First contact with ${focus.toLowerCase()}`, sessions: 3, review: "first taste" },
    { week: 3, focus: `Train ${practice.toLowerCase()}`, sessions: 4, review: "short sits" },
    { week: 4, focus: `Train ${practice.toLowerCase()}`, sessions: 4, review: "no new content" },
    { week: 5, focus: `Train ${practice.toLowerCase()}`, sessions: 4, review: "same seed, deeper" },
    { week: 6, focus: `Deepen ${focus.toLowerCase()}`, sessions: 4, review: "longer sit" },
    { week: 7, focus: `Deepen ${focus.toLowerCase()}`, sessions: 4, review: "observe resistance" },
    { week: 8, focus: `Deepen ${focus.toLowerCase()}`, sessions: 4, review: "no force" },
    { week: 9, focus: `Integrate ${focus.toLowerCase()} into one domain`, sessions: 3, review: "domain review" },
    { week: 10, focus: `Integrate into a second domain`, sessions: 3, review: "domain review" },
    { week: 11, focus: "Transfer", sessions: 2, review: "one real act" },
    { week: 12, focus: "Review the season", sessions: 2, review: "evidence audit" },
  ];

  return {
    id: `season:${isoDate(now)}`,
    title: `A season for ${focus}`,
    startDate: isoDate(now),
    days: 84,
    theme: `Season of ${focus}`,
    weeks,
    gates: [
      "3 distinct sittings per level",
      "feltShift is not heavier after the last two sittings",
      "one transfer into daily life",
    ],
    basis: [
      `weakest layer: ${focus}`,
      `practice: ${practice}`,
      `current state: ${Math.round(model.layers[weakest].state * 100)}`,
    ],
  };
}

const DECADE_THEMES: Array<{ theme: string; layer: HumanLayerId; evidence: string }> = [
  { theme: "Ground", layer: "body", evidence: "a stable body and sleep rhythm" },
  { theme: "Attention", layer: "thought", evidence: "the ability to notice and return" },
  { theme: "Emotion", layer: "emotion", evidence: "feel without running or freezing" },
  { theme: "Identity", layer: "identity", evidence: "less defence, more honesty" },
  { theme: "Witness", layer: "thought", evidence: "rest as the one who notices" },
  { theme: "Inquiry", layer: "identity", evidence: "the question turns on itself" },
  { theme: "Integration", layer: "behavior", evidence: "practice shows up in ordinary action" },
  { theme: "Service", layer: "relational", evidence: "action for something beyond the self" },
  { theme: "Teaching", layer: "meaning", evidence: "what was learned becomes usable by others" },
  { theme: "Silence", layer: "meaning", evidence: "less need to prove, more room to be" },
];

export function buildDecadeVision(model: HumanModel, now: Date = new Date()): DecadeVision {
  return {
    id: `decade:${isoDate(now)}`,
    title: "The next ten years",
    createdAt: now.toISOString(),
    years: DECADE_THEMES.map((item, index) => ({
      year: index + 1,
      theme: item.theme,
      practice: practiceFor(item.layer),
      evidence: item.evidence,
    })),
    nonNegotiables: [
      "One sitting a day, however short.",
      "No practice used as avoidance.",
      "Sleep before meditation when the body is depleted.",
      "Pain is information, not progress.",
      "Return after falling off without shame.",
    ],
    basis: [
      `starting weakest layer: ${label(model.summary.weakest)}`,
      `readiness: ${Math.round(model.summary.readiness * 100)}%`,
      "themes are a spiral, not a ladder",
    ],
  };
}

export function buildLifePlanBundle(model: HumanModel, now: Date = new Date()): LifePlanBundle {
  return {
    day: buildDayPlan(model, now),
    season: buildSeasonPlan(model, now),
    decade: buildDecadeVision(model, now),
    disclaimer: HUMAN_MODEL_DISCLAIMER,
  };
}
