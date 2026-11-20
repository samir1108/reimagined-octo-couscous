/**
 * PRESCRIBE — need + safety + capability → one prescription.
 * ─────────────────────────────────────────────────────────
 * Deterministic. The model never picks the dose; it only writes the words.
 */

import { computeDose } from "./dose";
import { decideSuitability } from "./suitability";
import { resolveClaimsForSession } from "@/lib/knowledge";
import type {
  ArcContext,
  Prescription,
  PrescriptionNeed,
  SpiralId,
  SuitabilityDecision,
  SuitabilityInput,
} from "./types";

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

  // Energy-practice readiness: inquiry/witness work opens subtle material.
  // Below L3 we cap intensity and duration rather than refusing the door.
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
    suitability.verdict === "rest_only" ||
    suitability.verdict === "hold" ||
    suitability.verdict === "refer";

  const claims = resolveClaimsForSession({
    concept: input.need.concept,
    practice: input.need.concept,
    limit: 2,
  }).map((claim) => ({ id: claim.id, statement: claim.statement }));

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
    claims,
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
