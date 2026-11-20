/**
 * PRESCRIPTION ENGINE — types
 * ───────────────────────────
 * Safety → dose → prescription → plan. This sits above `needEngine`: need
 * says WHAT door, prescription says HOW MUCH and WHETHER IT IS SAFE TODAY.
 */

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
  /** Kundalini-sign ids the user is currently feeling (see kundaliniSigns.ts). */
  energySignals?: string[];
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

export interface PrescriptionClaim {
  id: string;
  statement: string;
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
  /** Traceable teaching claims the session must stand on. */
  claims: PrescriptionClaim[];
  why: string;
  evidence: string[];
  nextPreview: string;
  planId: string;
  generatedAt: string;
}

export type PlanDayKind = "session" | "rest" | "review" | "transfer";

export interface PlanDay {
  day: number;
  kind: PlanDayKind;
  label: string;
  concept: string;
  intent: PrescriptionNeed["intent"];
  minutes: number;
  locked: boolean;
  gateReason?: string;
}

export interface ThirtyDayPlan {
  id: string;
  title: string;
  concept: string;
  days: PlanDay[];
  gates: string[];
}

export interface MythCard {
  myth: string;
  fact: string;
}

export interface ObserverSession {
  title: string;
  teaching: string;
  practice: string;
  question: string;
  trap: string;
  carry: string;
}
