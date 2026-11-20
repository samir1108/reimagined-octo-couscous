// Shared types for the Universal (Generative) Session Shell.
// Mirrors the edge function payloads.

import type { Prescription } from "@/lib/prescription";

export type StepKind =
  | "wisdom-read"
  | "breathwork"
  | "journal"
  | "micro-act"
  | "reflection"
  | "guide-chat"
  | "practice"
  | "temple-chat"
  | "witness"
  | "silent_sit"
  | "body_scan"
  | "gratitude"
  | "loving_kindness"
  | "forgiveness"
  | "movement"
  | "walking"
  | "yoga_asana"
  | "sound_bath"
  | "mantra"
  | "visualization"
  | "scripture"
  | "affirmation"
  | "contemplation"
  | "noticing"
  | "stretching"
  | "tai_chi"
  | "balance"
  | "free_write"
  | "plan";

/** A contingency: a predictable obstacle and what to do about it. */
export interface GuidanceIfThen {
  /** The obstacle, phrased as a when-clause: "Your mind keeps racing". */
  when: string;
  /** What to do about it: "Drop the counting and follow only the exhale." */
  then: string;
}

/** An alternate way to run the step — accessibility, or going deeper. */
export interface GuidanceVariation {
  /** e.g. "Easier", "Deeper", "If sitting is painful". */
  label: string;
  /** How to run the step this way. */
  detail: string;
}

/** How to close the step so the work doesn't leak. */
export interface GuidanceAfter {
  /** A question to answer in the journal afterwards. */
  journalPrompt?: string;
  /** One concrete thing to carry into the rest of the day. */
  carryIntoDay?: string;
  /** How to come back — matters after deep practices. */
  restNote?: string;
}

/**
 * One ordered instruction inside a step's deep guidance.
 * `detail` is long-form on purpose — a full paragraph reads better than a bullet.
 */
export interface GuidanceBeat {
  /** Optional short heading, e.g. "Set up", "The descent", "Coming back". */
  title?: string;
  /** The full instruction for this beat. */
  detail: string;
  /** Optional per-beat timer in seconds, for steps that are internally phased. */
  seconds?: number;
  /** Spoken line for TTS. Written for the ear — second person, short sentences. */
  narration?: string;
  /** Lineage attribution — sutra, verse, or the master's own line. */
  source?: string;
}

/**
 * Deep, long-form guidance attached to a single session step.
 * Everything is optional so existing steps keep rendering unchanged.
 */
export interface StepGuidance {
  /** One sentence on what this step is for. */
  summary?: string;
  /** Ordered beats — the "specific steps" the practitioner follows. */
  beats: GuidanceBeat[];
  /** Effort/intensity, 1–5, so the user knows what they're walking into. */
  effort?: 1 | 2 | 3 | 4 | 5;
  /** Short cues surfaced beside the timer. */
  cues?: string[];
  /** The single most common misunderstanding of this practice. */
  misconception?: string;
  /**
   * Normalise the strange sensations. This is what stops a beginner from
   * concluding "I'm doing it wrong" and quitting at day three.
   */
  whatYouMayNotice?: string[];
  /** Contingency plans for predictable obstacles. */
  ifThen?: GuidanceIfThen[];
  /** Accessibility and progression options. */
  variations?: GuidanceVariation[];
  /** Cautions. Do not push through these. */
  safety?: string[];
  /** What "done well" looks like. */
  doneWhen?: string;
  /** Common ways people get this step wrong. */
  pitfalls?: string[];
  /** How to close the step. */
  after?: GuidanceAfter;
}

export interface SessionStep {
  kind: StepKind;
  title: string;
  /** 3–5 beat script: setup → concrete action → what not to do → stop condition. */
  script?: string[];
  prompt?: string;
  /** Deep, long-form, step-by-step guidance. Rendered by StepFrame automatically. */
  guidance?: StepGuidance;
  params?: Record<string, unknown>;
  optional?: boolean;
  /** Authoritative duration. Widgets obey this, not est_minutes. */
  durationSeconds?: number;
  est_minutes: number;
  /** Sankalpa Engine T1: one concrete sentence referencing the signal that justified this step. */
  whyForYou?: string;
  /** Optional reference id of the signal (loop id, dimension, chakra, level) that produced whyForYou. */
  signalRef?: string;
  /** The step the rest of the sitting hinges on. */
  keystone?: boolean;
}

export type CouncilVoice = "head" | "heart" | "gut";

export interface SessionPlanMeta {
  vLevelStart?: number | null;
  dimensionBandsStart?: Record<string, number> | null;
  composedBy?: string;
  /** Server-owned session name produced by the composer (edge), when present. */
  invocation?: string | null;
  /** "Evening Threshold · Sitting III" */
  gateLine?: string | null;
  /** "III" */
  sittingRoman?: string | null;
  /** hsl accent for the gate, e.g. "45 100% 60%" */
  gateAccent?: string | null;
  /** 6th-axis decision the composer made server-side. */
  need?: {
    concept?: string;
    label?: string;
    intent?: string;
    familiarity?: number;
    minutes?: number;
    why?: string;
    evidence?: string[];
  } | null;
  /** Safety verdict at composition time. */
  safety?: "clear" | "adapt" | "rest_only" | "hold" | "refer" | null;
  /** Which brain policy produced this plan — see `lib/session/brain`. */
  brainMode?: "local" | "hybrid" | "cloud";
  /** User-safe reason the brain policy picked this path. */
  brainReason?: string;
  /** Set when a more capable composer failed and a lower tier produced this plan. */
  fallbackReason?: string | null;
  /** `session_spine` row that produced this plan — lets completion score it. */
  spineId?: string | null;
  /** Row id in `engine_decisions` — the replay handle for this plan. */
  decisionId?: string;
  /** Scoring/rule version used to build this plan. */
  policyVersion?: string;
  /** True when the contract rejected the plan and a minimal safe sitting shipped. */
  contractVetoed?: boolean;
  /** True when invalid steps were dropped and the rest shipped. */
  contractRepaired?: boolean;
  languageRefinedBy?: string;
  archetype?: string;
  archetypeReason?: string;
  toneWords?: string[];
  whyThisSession?: string;
  /** Which council voice led the composition. */
  leadVoice?: CouncilVoice | null;
  /** Master the engine assigned to this sitting. */
  leadMaster?: string | null;
  /** Active loops this session was built around. */
  primaryLoopId?: string | null;
  namedLoops?: Array<{ id: string; name: string }>;
  starvedDimension?: string | null;
  chakraFocus?: string | null;
  /** Safety + dose + arc for this sitting, decided before it started. */
  prescription?: Prescription;
  /** Current level per practice family (family → 1..5). */
  practiceLevels?: Record<string, number> | null;
  stage?: string | null;
  /** True when long-term memory was injected into the composition. */
  memoryInjected?: boolean;
  /** Hardware signals actually used, e.g. ["hrv", "voice"]. */
  hardwareUsed?: string[];
  provenance?: {
    vLevel?: number | null;
    stage?: string | null;
    guru?: string | null;
    memoryInjected?: boolean;
    hardwareSignals?: boolean;
  };
  /** The actual council the composer convened — rendered instead of a derived one. */
  council?: {
    head?: string | null;
    heart?: string | null;
    gut?: string | null;
    lead?: CouncilVoice | null;
    archetype?: string | null;
    reason?: string | null;
  } | null;
  /** Deterministic content-quality score (0..1) from the session contract. */
  contentQuality?: number | null;
  contentQualityBreakdown?: Record<string, number> | null;
  /** True when the plan came from the banker fallback rather than the composer. */
  banker?: boolean;
}

export interface SessionPlan {
  id: string;
  intent: string;
  intro: string;
  steps: SessionStep[];
  _meta?: SessionPlanMeta;
}

export interface CompletedStepRecord {
  kind: StepKind;
  /** Index into plan.steps — required for outcome attribution. */
  stepIndex?: number;
  title?: string;
  payload?: Record<string, unknown>;
  durationSeconds?: number;
}

export interface DimensionNudge {
  id: string;
  delta: number;
}

export interface SessionCompleteResult {
  ok: boolean;
  sessionId: string;
  completedStepCount: number;
  durationMs: number;
  loopsTouched: string[];
  karmaEarned: number;
  shiftSummary?: string | null;
  nextTeaser?: string | null;
  vLevelDelta?: number | null;
  dimensionNudges?: DimensionNudge[];
  alreadyCompleted?: boolean;
  qualityScore?: number;
  primaryPractice?: string | null;
}
