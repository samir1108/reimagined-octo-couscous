/**
 * GENERATE — gap → prerequisite path → arc → steps.
 * ─────────────────────────────────────────────────
 * Deterministic and LLM-free. The model may later write nicer words for these
 * steps, but it may not change the concept, the order, or the dose.
 */

import { CONCEPTS } from "@/lib/needEngine";
import { ARCS } from "@/lib/arcs";
import { claimsByConcept } from "@/lib/knowledge";
import { GRAPH_CONCEPTS, conceptForGap, findGaps, prerequisitePath } from "./graph";
import type { Gap, GraphSignals, SessionGraph, SessionIntent, SessionSpec, SpecStep } from "./types";

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

interface ConceptContent {
  label: string;
  teaching: string;
  metaphor: string;
  taste: string;
  question: string;
  carry: string;
}

function contentFor(concept: string): ConceptContent {
  const known = CONCEPTS[concept as keyof typeof CONCEPTS];
  if (known) {
    return {
      label: known.label,
      teaching: known.teaching,
      metaphor: known.metaphor,
      taste: known.taste,
      question: known.question,
      carry: known.carry,
    };
  }

  const arcSit = ARCS.flatMap((arc) => arc.sits).find((sit) => sit.concept === concept);
  if (arcSit) {
    return {
      label: GRAPH_CONCEPTS.find((c) => c.id === concept)?.label ?? concept,
      teaching: arcSit.teaching,
      metaphor: "One idea, one practice, one carry — nothing else today.",
      taste: arcSit.practiceText,
      question: arcSit.question,
      carry: arcSit.carry,
    };
  }

  return {
    label: concept.replace(/_/g, " "),
    teaching: "Start where you actually are, not where you think you should be.",
    metaphor: "A door opens by being used, not by being described.",
    taste: "Sit for one minute and notice what is already happening.",
    question: "What did you notice?",
    carry: "Return once today.",
  };
}

function stepsFor(intent: SessionIntent, content: ConceptContent, minutes: number): SpecStep[] {
  const weights =
    intent === "orient"
      ? [1.5, 1, 2, 1, 0.5]
      : intent === "first_contact"
        ? [1, 4, 1, 1]
        : [1, 9, 2, 0.5];
  const perMinute = minutes / weights.reduce((sum, w) => sum + w, 0);
  const duration = (index: number): number => Math.max(1, Math.round(weights[index] * perMinute));
  const at = (index: number): number => duration(index);

  if (intent === "orient") {
    return [
      { title: `What ${content.label} is`, body: content.teaching, kind: "teach", minutes: at(0) },
      { title: "One image", body: content.metaphor, kind: "teach", minutes: at(1) },
      { title: "60-second taste", body: content.taste, kind: "taste", minutes: at(2) },
      { title: "One question", body: content.question, kind: "question", minutes: at(3) },
      { title: "Carry it", body: content.carry, kind: "carry", minutes: at(4) },
    ];
  }

  if (intent === "first_contact") {
    return [
      { title: "One reminder", body: content.teaching, kind: "teach", minutes: at(0) },
      { title: "Guided taste", body: content.taste, kind: "taste", minutes: at(1) },
      { title: "Notice what happened", body: content.question, kind: "question", minutes: at(2) },
      { title: "Carry it", body: content.carry, kind: "carry", minutes: at(3) },
    ];
  }

  return [
    { title: "One reminder", body: content.teaching, kind: "teach", minutes: at(0) },
    { title: "The practice", body: content.taste, kind: "taste", minutes: at(1) },
    { title: "Observe honestly", body: content.question, kind: "question", minutes: at(2) },
    { title: "Carry it", body: content.carry, kind: "carry", minutes: at(3) },
  ];
}

function intentFor(familiarity: number, level: number): SessionIntent {
  if (familiarity < 0.2) return "orient";
  if (familiarity < 0.45 || level <= 1) return "first_contact";
  return "train";
}

function chooseConcept(
  path: string[],
  familiarity: Record<string, number>,
  capabilityLevels: Record<string, number>,
  gap: Gap,
): { concept: string; redirected: boolean } {
  if (gap.kind === "concept") return { concept: gap.id, redirected: false };

  for (const concept of path) {
    const fam = familiarity[concept] ?? 0;
    const level = capabilityLevels[concept] ?? 0;
    if (fam < 0.35 || level < 2) {
      return { concept, redirected: concept !== path[path.length - 1] };
    }
  }

  return { concept: path[path.length - 1] ?? "observation", redirected: false };
}

export interface GenerateOptions {
  maxMinutes?: number;
  preferredArcId?: string;
}

export function generateSession(
  graph: SessionGraph,
  signals: GraphSignals,
  options: GenerateOptions = {},
): SessionSpec {
  const gaps = findGaps(graph, signals);
  const gap: Gap =
    gaps[0] ??
    {
      kind: "concept",
      id: "observation",
      label: "Observation",
      severity: 1,
      evidence: ["no evidence yet"],
    };

  const target = conceptForGap(graph, gap);
  const path = prerequisitePath(graph, target);

  const familiarity: Record<string, number> = {};
  const capabilityLevels: Record<string, number> = {};
  for (const concept of GRAPH_CONCEPTS) {
    familiarity[concept.id] =
      signals.familiarity?.[concept.id] ??
      clamp((signals.capabilityLevels?.[concept.id] ?? 0) / 5, 0, 1);
    capabilityLevels[concept.id] =
      signals.capabilityLevels?.[concept.id] ?? Math.round(familiarity[concept.id] * 5);
  }

  const chosen = chooseConcept(path, familiarity, capabilityLevels, gap);
  const concept = chosen.concept;
  const content = contentFor(concept);
  const fam = familiarity[concept] ?? 0;
  const level = Math.round(clamp(capabilityLevels[concept] ?? fam * 5, 0, 5));
  const intent = intentFor(fam, level);
  const baseMinutes = intent === "orient" ? 6 : intent === "first_contact" ? 10 : 16;
  const minutes = clamp(options.maxMinutes ?? baseMinutes, 3, options.maxMinutes ?? baseMinutes);

  const arc =
    (options.preferredArcId
      ? ARCS.find((a) => a.id === options.preferredArcId)
      : ARCS.find((a) => a.sits.some((sit) => sit.concept === concept))) ?? null;

  const claims = claimsByConcept(concept).slice(0, 2).map((claim) => claim.id);
  const practice =
    GRAPH_CONCEPTS.find((c) => c.id === concept)?.practice ??
    CONCEPTS[concept as keyof typeof CONCEPTS]?.practice ??
    "observe";

  const why = chosen.redirected
    ? `${content.label} is the door before the door you asked for. ${gap.evidence.join("; ")}.`
    : `${content.label} is the next honest step. ${gap.evidence.join("; ")}.`;

  return {
    concept,
    label: content.label,
    intent,
    minutes,
    level,
    practice,
    arcId: arc?.id ?? null,
    claimIds: claims,
    steps: stepsFor(intent, content, minutes),
    path,
    gap,
    why,
    evidence: [...gap.evidence, `path: ${path.join(" → ")}`, `intent: ${intent}`],
  };
}

export function nextSessionPreview(spec: SessionSpec): string {
  if (spec.intent === "orient") return "Next: one guided taste (8–10 min) of the same idea.";
  if (spec.intent === "first_contact") return "Next: a longer training, same concept.";
  return "Next: same concept, a new seed — depth grows, not content.";
}
