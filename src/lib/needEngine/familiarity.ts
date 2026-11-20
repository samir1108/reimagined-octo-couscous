/**
 * NEED ENGINE — familiarity
 * ─────────────────────────
 * Familiarity is deliberately conservative: seeing a word in a chat is not
 * knowing a practice. Exposure, completed practice, and explicit self-report
 * are weighted separately so the engine can say "you know OF this, but you
 * have never SAT with it".
 */

import type { ConceptEvidence, ConceptId } from "./types";
import { CONCEPT_IDS } from "./catalog";

const clamp01 = (n: number): number => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));

export function computeFamiliarity(input: {
  exposureCount?: number;
  practiceCount?: number;
  selfReport?: number;
}): number {
  const exposure = clamp01((input.exposureCount ?? 0) / 3);
  const practice = clamp01((input.practiceCount ?? 0) / 3);
  const self = clamp01(input.selfReport ?? 0);
  return Math.round((0.45 * exposure + 0.35 * practice + 0.2 * self) * 100) / 100;
}

export function emptyConceptEvidence(conceptId: ConceptId): ConceptEvidence {
  return {
    conceptId,
    familiarity: 0,
    exposureCount: 0,
    practiceCount: 0,
    selfReport: 0,
    lastAt: null,
  };
}

export function emptyConceptEvidenceMap(): Record<ConceptId, ConceptEvidence> {
  return CONCEPT_IDS.reduce((acc, id) => {
    acc[id] = emptyConceptEvidence(id);
    return acc;
  }, {} as Record<ConceptId, ConceptEvidence>);
}

export function withFamiliarity(evidence: ConceptEvidence): ConceptEvidence {
  return {
    ...evidence,
    familiarity: computeFamiliarity({
      exposureCount: evidence.exposureCount,
      practiceCount: evidence.practiceCount,
      selfReport: evidence.selfReport,
    }),
  };
}
