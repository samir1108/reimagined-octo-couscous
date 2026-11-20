/**
 * NEED ENGINE — detection
 * ───────────────────────
 * Pure, deterministic decision: which door is the next honest step, and at
 * what depth. The LLM never makes this decision — it only writes the words
 * for the decision made here.
 *
 * Formula (all terms 0..1):
 *   score = 0.40 * (1 - familiarity)
 *         + 0.30 * relevance
 *         + 0.20 * readiness
 *         + 0.10 * (1 - recency)
 *         - 0.25 * recentlyUsed
 */

import { CONCEPTS, CONCEPT_IDS, getConcept } from "./catalog";
import { computeFamiliarity, emptyConceptEvidenceMap } from "./familiarity";
import type {
  ConceptDef,
  ConceptEvidence,
  ConceptId,
  NeedDecision,
  NeedIntent,
  NeedSessionShape,
  NeedSignals,
  NeedStep,
} from "./types";

const clamp01 = (n: number): number => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const daysSince = (iso: string | null): number => {
  if (!iso) return 999;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 999;
  return Math.max(0, (Date.now() - t) / 86_400_000);
};

function normalizeSignals(signals: Partial<NeedSignals>): NeedSignals {
  const concepts = emptyConceptEvidenceMap();
  for (const id of CONCEPT_IDS) {
    const given = signals.concepts?.[id];
    if (given) concepts[id] = { ...concepts[id], ...given };
  }
  return {
    concepts,
    activeLoops: signals.activeLoops ?? [],
    stressedDomains: signals.stressedDomains ?? [],
    dimensionBands: signals.dimensionBands ?? {},
    overallBand: signals.overallBand ?? 0,
    energy: signals.energy ?? "medium",
    timeBudgetMin: signals.timeBudgetMin ?? 10,
    recentConceptIds: signals.recentConceptIds ?? [],
    capabilityLevels: signals.capabilityLevels ?? {},
  };
}

function prerequisitesMet(def: ConceptDef, concepts: Record<ConceptId, ConceptEvidence>): boolean {
  return def.prerequisites.every(
    (p) => (concepts[p.concept]?.familiarity ?? 0) >= p.minFamiliarity,
  );
}

function relevanceFor(def: ConceptDef, signals: NeedSignals): number {
  const loopHit = signals.activeLoops.length
    ? Math.min(1, signals.activeLoops.length / 3) * 0.6 +
      (def.loopCategories.some((c) => signals.activeLoops.some((l) => l.toLowerCase().includes(c)))
        ? 0.4
        : 0)
    : 0;

  const weakest = Object.entries(signals.dimensionBands)
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0];

  const dimensionHit = weakest && def.dimensions.includes(weakest as never) ? 0.75 : 0;

  const domainHit = signals.stressedDomains.length
    ? (def.id === "breath" || def.id === "body" ? 0.35 : 0.15)
    : 0;

  return clamp01(Math.max(loopHit, dimensionHit) * 0.7 + domainHit * 0.3);
}

function readinessFor(def: ConceptDef, signals: NeedSignals): number {
  const level = signals.capabilityLevels[def.id] ?? 0;
  const band = clamp01(signals.overallBand / 10);
  return clamp01(0.55 * clamp01(level / 5) + 0.45 * band);
}

function chooseIntent(
  evidence: ConceptEvidence,
  readiness: number,
  signals: NeedSignals,
): NeedIntent {
  if (signals.energy === "low" && evidence.familiarity < 0.2) return "orient";
  if (evidence.exposureCount === 0 && evidence.familiarity < 0.2) return "orient";
  if (evidence.practiceCount === 0 || evidence.familiarity < 0.45) return "first_contact";
  if (readiness < 0.6) return "train";
  return "integrate";
}

function stepsFor(def: ConceptDef, intent: NeedIntent): NeedStep[] {
  const orient = (): NeedStep[] => [
    { title: `What ${def.label} is`, body: def.teaching, kind: "teach", seconds: 60 },
    { title: "One image", body: def.metaphor, kind: "teach", seconds: 45 },
    { title: "60-second taste", body: def.taste, kind: "taste", seconds: 60 },
    { title: "One question", body: def.question, kind: "question", seconds: 45 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const firstContact = (): NeedStep[] => [
    { title: `Meet ${def.label}`, body: def.teaching, kind: "teach", seconds: 60 },
    { title: "Guided taste", body: `${def.taste}\n\n${def.metaphor}`, kind: "taste", seconds: 180 },
    { title: "Notice what happened", body: def.question, kind: "question", seconds: 60 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const train = (): NeedStep[] => [
    { title: "One reminder", body: def.teaching, kind: "teach", seconds: 45 },
    { title: "The practice", body: `${def.taste}\n\nStay longer than feels comfortable. Do not add anything.`, kind: "taste", seconds: 600 },
    { title: "Observe honestly", body: def.question, kind: "question", seconds: 90 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  const integrate = (): NeedStep[] => [
    { title: "Recall", body: `Where did ${def.label} show up since last time?`, kind: "question", seconds: 60 },
    { title: "Deepen", body: `${def.taste}\n\nThis time, let the object change. Follow it.`, kind: "taste", seconds: 480 },
    { title: "Name the shift", body: def.question, kind: "question", seconds: 90 },
    { title: "Carry it", body: def.carry, kind: "carry", seconds: 30 },
  ];

  if (intent === "orient") return orient();
  if (intent === "first_contact") return firstContact();
  if (intent === "integrate") return integrate();
  return train();
}

export function shapeForIntent(
  def: ConceptDef,
  intent: NeedIntent,
  timeBudgetMin: number,
): NeedSessionShape {
  const budget = Math.max(3, Math.min(30, Math.round(timeBudgetMin || 10)));
  const minutes =
    intent === "orient"
      ? Math.min(6, Math.max(4, def.tasteMinutes))
      : intent === "first_contact"
        ? Math.min(12, Math.max(7, def.tasteMinutes + 3))
        : intent === "integrate"
          ? Math.min(16, Math.max(10, budget))
          : Math.min(25, Math.max(12, budget));

  const teachRatio =
    intent === "orient" ? 0.6 : intent === "first_contact" ? 0.35 : intent === "integrate" ? 0.25 : 0.15;

  const depth = intent === "orient" ? "taste" : intent === "first_contact" ? "guided" : "deep";

  return { minutes, teachRatio, depth, steps: stepsFor(def, intent) };
}

function evidenceLines(
  def: ConceptDef,
  evidence: ConceptEvidence,
  signals: NeedSignals,
  redirect?: { concept: ConceptId; familiarity: number; required: number },
): string[] {
  const lines: string[] = [];
  lines.push(`${evidence.exposureCount} completed ${def.label} sitting(s)`);
  lines.push(`${Math.round(evidence.familiarity * 100)}% familiarity from knowledge graph`);
  if (redirect) {
    const prereq = getConcept(redirect.concept);
    lines.push(
      `prerequisite ${prereq.label} at ${Math.round(redirect.familiarity * 100)}% (needs ${Math.round(redirect.required * 100)}%)`,
    );
  }
  if (signals.activeLoops[0]) lines.push(`active loop: ${signals.activeLoops[0]}`);
  const weakest = Object.entries(signals.dimensionBands)
    .filter(([, v]) => typeof v === "number")
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0]?.[0];
  if (weakest) lines.push(`weakest dimension: ${weakest}`);
  if (signals.overallBand) lines.push(`journey band ${signals.overallBand}`);
  return lines;
}

function whyLine(
  def: ConceptDef,
  intent: NeedIntent,
  evidence: ConceptEvidence,
  shape: NeedSessionShape,
  redirect?: { concept: ConceptId },
): string {
  const pct = Math.round(evidence.familiarity * 100);
  if (redirect) {
    const prereq = getConcept(redirect.concept);
    return `Aapne ${prereq.label} ko abhi tak nahi chhua (${Math.round(evidence.familiarity * 100)}% familiarity), aur ${def.label} usi par khada hai. Isliye aaj ${shape.minutes} min ka ${prereq.label} orientation — ${def.label} uske baad.`;
  }
  if (intent === "orient") {
    return `${def.label} aapke liye naya hai (${pct}% familiarity). Aaj ${shape.minutes} minute ka orientation: ek idea, ek 60-second taste, ek carry. Practice agli baar.`;
  }
  if (intent === "first_contact") {
    return `Aap ${def.label} ke baare mein jaante hain, par abhi baith kar nahi kiya. Aaj ${shape.minutes} minute ka guided first contact — bas ek asli taste.`;
  }
  if (intent === "integrate") {
    return `${def.label} aapke paas already hai. Aaj ${shape.minutes} minute usko roz ki zindagi mein utaarne ke liye.`;
  }
  return `${def.label} familiar hai, isliye aaj ${shape.minutes} minute ka focused training — depth badhane ke liye.`;
}

export interface DetectOptions {
  /** Concepts the user explicitly asked for. They win only if prerequisites pass. */
  requested?: ConceptId[];
}

export function detectNeed(
  input: Partial<NeedSignals>,
  options: DetectOptions = {},
): NeedDecision {
  const signals = normalizeSignals(input);

  const candidates = CONCEPT_IDS.map((id) => {
    const def = CONCEPTS[id];
    const evidence = { ...signals.concepts[id] };
    evidence.familiarity = computeFamiliarity(evidence);

    const eligible = prerequisitesMet(def, signals.concepts);
    const readiness = readinessFor(def, signals);
    const relevance = relevanceFor(def, signals);
    const recency = clamp01(1 - Math.min(1, daysSince(evidence.lastAt) / 7));
    const recentlyUsed = signals.recentConceptIds.includes(id) ? 1 : 0;
    const requestedBoost = options.requested?.includes(id) ? 0.18 : 0;

    const score = clamp01(
      0.4 * (1 - evidence.familiarity) +
        0.3 * relevance +
        0.2 * readiness +
        0.1 * (1 - recency) -
        0.25 * recentlyUsed +
        requestedBoost,
    );

    return { def, evidence, eligible, readiness, relevance, score };
  });

  const eligible = candidates.filter((c) => c.eligible);
  const pool = eligible.length ? eligible : [candidates[0]];
  const explicit = options.requested?.find((id) =>
    prerequisitesMet(CONCEPTS[id], signals.concepts),
  );
  const best = explicit
    ? (candidates.find((c) => c.def.id === explicit) ??
      pool.reduce((a, b) => (b.score > a.score ? b : a)))
    : pool.reduce((a, b) => (b.score > a.score ? b : a));

  // If the user asked for a concept whose prerequisites are unmet, teach the
  // first missing prerequisite instead. This is the "neti-neti without
  // observation" guard.
  const requestedId = options.requested?.find(
    (id) => !prerequisitesMet(CONCEPTS[id], signals.concepts),
  );
  const blocked = requestedId
    ? CONCEPTS[requestedId].prerequisites.find(
        (p) => (signals.concepts[p.concept]?.familiarity ?? 0) < p.minFamiliarity,
      )
    : undefined;

  let chosen = best;
  let redirect:
    | { concept: ConceptId; familiarity: number; required: number }
    | undefined;

  if (blocked) {
    const prereqDef = CONCEPTS[blocked.concept];
    const prereqEvidence = {
      ...signals.concepts[blocked.concept],
      familiarity: computeFamiliarity(signals.concepts[blocked.concept]),
    };
    chosen = {
      def: prereqDef,
      evidence: prereqEvidence,
      eligible: true,
      readiness: readinessFor(prereqDef, signals),
      relevance: relevanceFor(prereqDef, signals),
      score: 1 - prereqEvidence.familiarity,
    };
    redirect = {
      concept: blocked.concept,
      familiarity: prereqEvidence.familiarity,
      required: blocked.minFamiliarity,
    };
  }

  const intent = chooseIntent(chosen.evidence, chosen.readiness, signals);
  const shape = shapeForIntent(chosen.def, intent, signals.timeBudgetMin);
  const evidence = evidenceLines(chosen.def, chosen.evidence, signals, redirect);
  const confidence = clamp01(
    0.45 +
      0.1 * Math.min(3, chosen.evidence.exposureCount + chosen.evidence.practiceCount) +
      0.15 * (1 - chosen.evidence.familiarity) +
      (redirect ? 0.1 : 0),
  );

  return {
    concept: chosen.def.id,
    label: chosen.def.label,
    intent,
    familiarity: chosen.evidence.familiarity,
    readiness: Math.round(chosen.readiness * 100) / 100,
    relevance: Math.round(chosen.relevance * 100) / 100,
    score: Math.round(chosen.score * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    evidence,
    why: whyLine(chosen.def, intent, chosen.evidence, shape, redirect),
    shape,
    practice: chosen.def.practice,
    ladder: chosen.def.ladder,
    entryLevel: chosen.def.entryLevel,
  };
}
