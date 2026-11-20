/**
 * NEED ENGINE — types
 * ───────────────────
 * The missing 6th axis for session selection: what does this person actually
 * need next, given what they already know and can already do?
 *
 * The existing 5 axes (constellation, domains, arc, state, mode registry)
 * answer "what fits right now". This axis answers "what is the next honest
 * step" — especially for concepts the user has never met.
 */

import type { Practice } from "@/lib/sutra/practices";

export type ConceptId =
  | "observation"
  | "self_inquiry"
  | "neti_neti"
  | "witness"
  | "breath"
  | "body";

export type NeedIntent = "orient" | "first_contact" | "train" | "integrate" | "hold";

export interface ConceptPrerequisite {
  concept: ConceptId;
  minFamiliarity: number;
}

export interface ConceptDef {
  id: ConceptId;
  label: string;
  sanskrit?: string;
  practice: Practice;
  ladder: "observation" | "self_inquiry" | "neti_neti" | null;
  entryLevel: number;
  prerequisites: ConceptPrerequisite[];
  tasteMinutes: number;
  trainMinutes: number;
  teaching: string;
  metaphor: string;
  taste: string;
  question: string;
  carry: string;
  /** Loop categories this concept actually dissolves. */
  loopCategories: string[];
  /** Consciousness dimensions this concept trains. */
  dimensions: Array<"body" | "emotion" | "thought" | "awareness">;
}

export interface ConceptEvidence {
  conceptId: ConceptId;
  familiarity: number;
  exposureCount: number;
  practiceCount: number;
  selfReport: number;
  lastAt: string | null;
}

export interface NeedSignals {
  concepts: Record<ConceptId, ConceptEvidence>;
  activeLoops: string[];
  stressedDomains: string[];
  dimensionBands: Record<string, number>;
  overallBand: number;
  energy: "low" | "medium" | "high";
  timeBudgetMin: number;
  recentConceptIds: ConceptId[];
  capabilityLevels: Partial<Record<ConceptId, number>>;
}

export interface NeedStep {
  title: string;
  body: string;
  kind: "teach" | "taste" | "question" | "carry";
  seconds: number;
}

export interface NeedSessionShape {
  minutes: number;
  teachRatio: number;
  depth: "taste" | "guided" | "deep";
  steps: NeedStep[];
}

export interface NeedDecision {
  concept: ConceptId;
  label: string;
  intent: NeedIntent;
  familiarity: number;
  readiness: number;
  relevance: number;
  score: number;
  confidence: number;
  evidence: string[];
  why: string;
  shape: NeedSessionShape;
  practice: Practice;
  ladder: ConceptDef["ladder"];
  entryLevel: number;
}
