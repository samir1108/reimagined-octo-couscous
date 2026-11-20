/**
 * KNOWLEDGE — claims and evidence.
 * ────────────────────────────────
 * The landing page is not separate marketing copy. It is the public face of
 * this catalog. Sessions, the guide, and analytics read the same claims, so
 * the product and the promise cannot drift apart.
 */

export type LandingSection =
  | "hero"
  | "three_brains"
  | "consciousness_model"
  | "spiritual_dna"
  | "engine"
  | "session_system"
  | "practices"
  | "home"
  | "games"
  | "themes_loops"
  | "libraries"
  | "cinematic"
  | "frameworks"
  | "why_hope"
  | "security"
  | "pricing"
  | "vision"
  | "mission";

export type EvidenceType =
  | "tradition"
  | "psychology"
  | "product"
  | "user_outcome"
  | "lineage";

export interface EvidenceRef {
  type: EvidenceType;
  /** Human-readable source, e.g. "Yoga Sutras 1.2" or "session_outcomes". */
  ref: string;
  note?: string;
}

export type ReviewStatus = "draft" | "reviewed" | "verified";

export interface Claim {
  id: string;
  /** Full statement used in teaching or essays. */
  statement: string;
  /** One-line version used on cards and landing sections. */
  short: string;
  section: LandingSection;
  conceptId?: string;
  practiceId?: string;
  loopIds?: string[];
  domainIds?: string[];
  capabilityIds?: string[];
  evidence: EvidenceRef[];
  /** 0..1 — how strongly the system stands behind this statement. */
  confidence: number;
  /** Shown when the claim could be misread (medical, metaphysical, etc.). */
  caution?: string;
  reviewStatus: ReviewStatus;
  language: "en" | "hi";
}

export interface ClaimValidation {
  ok: boolean;
  errors: string[];
}

/** Words that turn a practice claim into a medical claim. */
export const BANNED_MEDICAL_TERMS = [
  "cure",
  "cures",
  "treat",
  "treats",
  "diagnose",
  "diagnosis",
  "heal disease",
  "medical treatment",
];
