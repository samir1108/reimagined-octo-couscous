// ============================================================
// PRESCRIPTION (server) — safety → dose → arc
// ------------------------------------------------------------
// Port of src/lib/prescription/* so the sitting's dose and safety
// verdict are decided server-side. The model writes words for the
// prescription; it never chooses the dose.
// ============================================================

import type { NeedDecision } from "./needEngine.ts";

export type SuitabilityVerdict = "clear" | "adapt" | "rest_only" | "hold" | "refer";

export interface SuitabilityInput {
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  painLevel?: number;
  painLocation?: string;
  emotionalIntensity?: number;
  panic?: boolean;
  dissociation?: boolean;
  pregnancy?: boolean;
  recentSurgery?: boolean;
  psychosisHistory?: boolean;
  substance?: boolean;
  ageBand?: "teen" | "adult" | "senior";
  crisis?: boolean;
}

export interface SuitabilityDecision {
  verdict: SuitabilityVerdict;
  reasons: string[];
  allowMeditation: boolean;
  allowBreathRetention: boolean;
  allowClosedEyes: boolean;
  allowLongSit: boolean;
  maxMinutes: number;
  recommendedProtocol: string;
}

export interface Dose {
  minutes: number;
  depth: "rest" | "taste" | "guided" | "deep";
  intensity: "rest" | "gentle" | "steady" | "deep";
  teachRatio: number;
  frequencyPerWeek: number;
  reviewAfterDays: number;
}

export type SpiralId = "ground" | "attention" | "emotion" | "thought" | "witness" | "inquiry";

export interface ArcContext {
  arcTitle: string;
  arcDay: number;
  arcLengthDays: number;
  spiralId: SpiralId;
  spiralLabel: string;
  sessionNumber: number;
  totalSessions: number;
  phaseLabel: string;
}

export interface PrescriptionNeed {
  concept: string;
  label: string;
  intent: "orient" | "first_contact" | "train" | "integrate" | "hold";
  familiarity: number;
  why: string;
  evidence: string[];
  ladder: "observation" | "self_inquiry" | "neti_neti" | null;
  entryLevel: number;
}

export interface Prescription {
  concept: string;
  label: string;
  intent: PrescriptionNeed["intent"];
  dose: Dose;
  suitability: SuitabilityDecision;
  arc: ArcContext;
  templateHint: PrescriptionNeed["ladder"];
  entryLevel: number;
  oneStep: boolean;
  completedSessions: number;
  why: string;
  evidence: string[];
  nextPreview: string;
  planId: string;
  generatedAt: string;
}

const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));

// ─── Suitability ──────────────────────────────────────────────────────────

export function defaultSuitability(): SuitabilityInput {
  return {
    sleepHours: 7,
    sleepQuality: 3,
    painLevel: 0,
    emotionalIntensity: 3,
    panic: false,
    dissociation: false,
    pregnancy: false,
    recentSurgery: false,
    psychosisHistory: false,
    substance: false,
    ageBand: "adult",
    crisis: false,
  };
}

export function decideSuitability(input: SuitabilityInput = {}): SuitabilityDecision {
  const s: SuitabilityInput = { ...defaultSuitability(), ...input };
  const reasons: string[] = [];

  if (s.crisis) {
    reasons.push("crisis signal present");
    return {
      verdict: "hold",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 3,
      recommendedProtocol: "Grounding only, then talk to a human you trust.",
    };
  }

  if (s.psychosisHistory) {
    reasons.push("history of psychosis or mania");
    return {
      verdict: "refer",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 0,
      recommendedProtocol: "Speak to a clinician before intensive practice.",
    };
  }

  if (s.panic || (s.emotionalIntensity ?? 0) >= 8) {
    reasons.push(s.panic ? "panic signal" : "emotional intensity 8+");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 8,
      recommendedProtocol: "Eyes open, feet on the floor, natural breath. No retention, no silence.",
    };
  }

  if (s.dissociation) {
    reasons.push("dissociation signal");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: false,
      allowLongSit: false,
      maxMinutes: 8,
      recommendedProtocol: "Sensory orientation first: name 5 things you see, 3 you hear, 1 you touch.",
    };
  }

  const hours = Number(s.sleepHours ?? 7);
  const quality = Number(s.sleepQuality ?? 3);
  if (hours < 5 || quality <= 2) {
    reasons.push(`low sleep (${hours}h, quality ${quality}/5)`);
    return {
      verdict: "rest_only",
      reasons,
      allowMeditation: false,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Rest protocol (body rest / yoga nidra). Sleep first; meditation later.",
    };
  }

  const pain = clamp(Number(s.painLevel ?? 0), 0, 10);
  if (pain >= 6) {
    reasons.push(`pain ${pain}/10`);
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 6,
      recommendedProtocol: "Short body/breath only. Change posture freely. Pain is information, not progress.",
    };
  }

  if (s.pregnancy || s.recentSurgery || s.substance) {
    if (s.pregnancy) reasons.push("pregnancy");
    if (s.recentSurgery) reasons.push("recent surgery");
    if (s.substance) reasons.push("substance influence");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Gentle natural breath. No retention, no strong body work.",
    };
  }

  if (s.ageBand === "teen") {
    reasons.push("teen dose cap");
    return {
      verdict: "adapt",
      reasons,
      allowMeditation: true,
      allowBreathRetention: false,
      allowClosedEyes: true,
      allowLongSit: false,
      maxMinutes: 10,
      recommendedProtocol: "Short, guided, plain language. No intensive silence.",
    };
  }

  reasons.push("no red flags");
  return {
    verdict: "clear",
    reasons,
    allowMeditation: true,
    allowBreathRetention: true,
    allowClosedEyes: true,
    allowLongSit: true,
    maxMinutes: 30,
    recommendedProtocol: "Standard practice allowed.",
  };
}

export function isSafetyBlocked(verdict: SuitabilityVerdict): boolean {
  return verdict === "rest_only" || verdict === "hold" || verdict === "refer";
}

// ─── Dose ─────────────────────────────────────────────────────────────────

export interface DoseInput {
  intent: PrescriptionNeed["intent"];
  suitability: SuitabilityDecision;
  familiarity: number;
  capabilityLevel?: number;
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
}

export function computeDose(input: DoseInput): Dose {
  const { intent, suitability, familiarity } = input;
  const budget = clamp(input.timeBudgetMin ?? 10, 3, 30);
  const capability = clamp(input.capabilityLevel ?? 0, 0, 5);

  if (suitability.verdict === "rest_only") {
    return {
      minutes: Math.min(10, Math.max(5, suitability.maxMinutes)),
      depth: "rest",
      intensity: "rest",
      teachRatio: 0.1,
      frequencyPerWeek: 7,
      reviewAfterDays: 3,
    };
  }

  if (suitability.verdict === "hold") {
    return {
      minutes: 3,
      depth: "rest",
      intensity: "rest",
      teachRatio: 0,
      frequencyPerWeek: 3,
      reviewAfterDays: 1,
    };
  }

  if (suitability.verdict === "refer") {
    return {
      minutes: 0,
      depth: "rest",
      intensity: "rest",
      teachRatio: 0,
      frequencyPerWeek: 0,
      reviewAfterDays: 1,
    };
  }

  const adapted = suitability.verdict === "adapt";
  const cap = Math.min(budget, suitability.maxMinutes);

  let minutes: number;
  let depth: Dose["depth"];
  let intensity: Dose["intensity"];
  let teachRatio: number;

  if (intent === "orient" || familiarity < 0.2) {
    minutes = 6;
    depth = "taste";
    intensity = "gentle";
    teachRatio = 0.6;
  } else if (intent === "first_contact") {
    minutes = 10;
    depth = "guided";
    intensity = "gentle";
    teachRatio = 0.35;
  } else if (intent === "integrate") {
    minutes = 14;
    depth = "deep";
    intensity = "steady";
    teachRatio = 0.25;
  } else {
    minutes = capability >= 3 ? 22 : 16;
    depth = "deep";
    intensity = capability >= 3 ? "deep" : "steady";
    teachRatio = 0.15;
  }

  if (input.energy === "low") {
    minutes = Math.min(minutes, 8);
    intensity = intensity === "deep" ? "steady" : intensity;
  }

  minutes = clamp(Math.min(minutes, cap), 3, 30);

  return {
    minutes,
    depth,
    intensity,
    teachRatio,
    frequencyPerWeek: adapted ? 4 : intent === "train" ? 5 : 3,
    reviewAfterDays: intent === "integrate" ? 14 : 7,
  };
}

// ─── Arc ──────────────────────────────────────────────────────────────────

const SPIRALS: Record<string, { id: SpiralId; label: string }> = {
  observation: { id: "attention", label: "Attention" },
  self_inquiry: { id: "inquiry", label: "Inquiry" },
  neti_neti: { id: "inquiry", label: "Discrimination" },
  witness: { id: "witness", label: "Witness" },
  breath: { id: "ground", label: "Ground" },
  body: { id: "ground", label: "Ground" },
};

export function buildArcContext(
  concept: string,
  opts: { sessionNumber?: number; arcDay?: number; totalSessions?: number } = {},
): ArcContext {
  const spiral = SPIRALS[concept] ?? { id: "attention" as SpiralId, label: "Attention" };
  const sessionNumber = Math.max(1, Math.round(opts.sessionNumber ?? 1));
  return {
    arcTitle: `${spiral.label} · ${concept.replace(/_/g, " ")}`,
    arcDay: Math.max(1, Math.min(7, Math.round(opts.arcDay ?? ((sessionNumber - 1) % 7) + 1))),
    arcLengthDays: 7,
    spiralId: spiral.id,
    spiralLabel: spiral.label,
    sessionNumber,
    totalSessions: Math.max(7, Math.round(opts.totalSessions ?? 30)),
    phaseLabel: "Foundation",
  };
}

function nextPreviewFor(
  need: PrescriptionNeed,
  suitability: SuitabilityDecision,
): string {
  if (suitability.verdict === "rest_only") return "Next: after sleep, a 6-minute orientation. Rest is not a setback.";
  if (suitability.verdict === "hold") return "Next: the same 3-minute grounding, when you are ready.";
  if (suitability.verdict === "refer") return "Next: speak to a professional. The app can wait.";
  if (need.intent === "orient") return "Next: one guided taste (8–10 min) of the same idea.";
  if (need.intent === "first_contact") return "Next: a slightly longer training, same concept.";
  if (need.intent === "train") return "Next: same concept, a new seed — depth grows, not content.";
  return "Next: review + one transfer mission into your day.";
}

// ─── Prescribe ────────────────────────────────────────────────────────────

export interface PrescribeInput {
  need: PrescriptionNeed;
  suitability?: SuitabilityInput;
  capabilityLevel?: number;
  energy?: "low" | "medium" | "high";
  timeBudgetMin?: number;
  sessionNumber?: number;
  completedSessions?: number;
  planId?: string;
}

export function prescribe(input: PrescribeInput): Prescription {
  const suitability = decideSuitability(input.suitability);
  const dose = computeDose({
    intent: input.need.intent,
    suitability,
    familiarity: input.need.familiarity,
    capabilityLevel: input.capabilityLevel,
    energy: input.energy,
    timeBudgetMin: input.timeBudgetMin,
  });

  const energyPractice = ["neti_neti", "witness", "self_inquiry"].includes(input.need.concept);
  const energyReady = (input.capabilityLevel ?? 0) >= 3;
  const extraEvidence: string[] = [];
  if (energyPractice && !energyReady) {
    dose.intensity = dose.intensity === "deep" ? "steady" : dose.intensity;
    dose.minutes = Math.min(dose.minutes, 12);
    extraEvidence.push("energy readiness: below L3 — intensity and duration capped");
  }

  const completedSessions = Math.max(
    0,
    Math.round(input.completedSessions ?? (input.sessionNumber ? input.sessionNumber - 1 : 0)),
  );

  const arc = buildArcContext(input.need.concept, {
    sessionNumber: input.sessionNumber ?? completedSessions + 1,
    totalSessions: 30,
  });

  const safetyNote =
    suitability.verdict === "clear" ? "" : ` Safety: ${suitability.recommendedProtocol}`;

  const oneStep =
    input.need.intent === "orient" ||
    input.need.intent === "first_contact" ||
    isSafetyBlocked(suitability.verdict);

  return {
    concept: input.need.concept,
    label: input.need.label,
    intent: input.need.intent,
    dose,
    suitability,
    arc,
    templateHint: input.need.ladder,
    entryLevel: input.need.entryLevel,
    oneStep,
    completedSessions,
    why: `${input.need.why}${safetyNote}`.trim(),
    evidence: [
      ...input.need.evidence,
      ...extraEvidence,
      ...(suitability.reasons.length ? [`safety: ${suitability.reasons.join(", ")}`] : []),
    ],
    nextPreview: nextPreviewFor(input.need, suitability),
    planId: input.planId ?? `plan30:${input.need.concept}`,
    generatedAt: new Date().toISOString(),
  };
}

/** Adapts a `NeedDecision` into the slim shape `prescribe` expects. */
export function needToPrescriptionNeed(need: NeedDecision): PrescriptionNeed {
  return {
    concept: need.concept,
    label: need.label,
    intent: need.intent,
    familiarity: need.familiarity,
    why: need.why,
    evidence: need.evidence,
    ladder: need.ladder,
    entryLevel: need.entryLevel,
  };
}

/** The prompt block the composer receives for a prescription. */
export function prescriptionPromptBlock(rx: Prescription): string[] {
  const lines = [
    `PRESCRIPTION LOCK: ${rx.dose.minutes} min, intensity=${rx.dose.intensity}, teaching=${rx.dose.teachRatio}, arc=${rx.arc.spiralLabel} ${rx.arc.sessionNumber}/${rx.arc.totalSessions}.`,
  ];
  if (rx.suitability.verdict === "rest_only") {
    lines.push("SAFETY: REST ONLY — no meditation. Compose body-rest / yoga-nidra style. No witness, no inquiry, no long silence.");
  }
  if (rx.suitability.verdict === "hold") {
    lines.push("SAFETY: HOLD — grounding only, 3 minutes max, no insight-chasing, no progress steps.");
  }
  if (rx.suitability.verdict === "refer") {
    lines.push("SAFETY: REFER — do not compose an intensive sitting; a 2-minute grounding plus a suggestion to speak to a professional.");
  }
  if (rx.suitability.allowBreathRetention === false) {
    lines.push("SAFETY: no breath retention; natural breath only.");
  }
  if (rx.suitability.allowClosedEyes === false) {
    lines.push("SAFETY: keep eyes open; use sensory orientation.");
  }
  return lines;
}
