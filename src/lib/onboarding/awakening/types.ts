/**
 * awakeningTypes — shared types for THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * The first journey every new user walks: 11 sessions that move from
 * automatic living to conscious action. Closed spine (authored sessions),
 * adaptive questions (selected per user from the bank), and an honest
 * capability map built from what the user actually did — never a verdict.
 *
 * Design law (the founder's): every session produces something useful —
 * an observation, a practiced skill, a personal insight, or a deliberate
 * action. Capability scores are provisional indicators, not measurements
 * of a person's worth.
 */

/** The eight human capabilities the journey trains and maps. */
export type CapabilityId =
  | "awareness"
  | "attention"
  | "emotional_regulation"
  | "behavioral_patterns"
  | "intention"
  | "discipline"
  | "values"
  | "reflection";

export type SessionPhase = "discover" | "drivers" | "capabilities" | "integrate";

/** The eight beats every session is built from. */
export type Beat =
  | "arrival"
  | "observation"
  | "investigation"
  | "practice"
  | "application"
  | "reflection";

export type PracticeKind = "breath" | "silence" | "game" | "body_scan" | "gaze";

/** How much we trust a data point. */
export type EvidenceLevel = "hypothesized" | "self_reported" | "measured";

export interface CapabilitySignal {
  /** 0–10 provisional read for one capability. */
  score: number;
  /** How the read was obtained. */
  evidence: EvidenceLevel;
}

export type CapabilitySignals = Partial<Record<CapabilityId, CapabilitySignal>>;

// ── questions ───────────────────────────────────────────────────────────

export interface AwakeningOption {
  id: string;
  label: string;
  hint?: string;
  /** Capability signal this option carries (0–10, self-reported). */
  capabilities: Partial<Record<CapabilityId, number>>;
  /** Loop ids from the loop library this option activates or names. */
  loops?: string[];
  /** 0–10 spiral-band signal, kept compatible with the band model. */
  band?: number;
}

interface QuestionBase {
  id: string;
  sessionId: string;
  beat: Beat;
  title: string;
  subtitle?: string;
  /** Loops this question probes, regardless of the option chosen. */
  loops?: string[];
}

export type AwakeningQuestion =
  | (QuestionBase & {
      kind: "choice";
      options: AwakeningOption[];
    })
  | (QuestionBase & {
      kind: "scale";
      minLabel: string;
      maxLabel: string;
      /** Capability signal at value 1 and at value 5 (interpolated between). */
      low: Partial<Record<CapabilityId, number>>;
      high: Partial<Record<CapabilityId, number>>;
    })
  | (QuestionBase & {
      kind: "text";
      placeholder: string;
      maxLength: number;
      /** Capability signal for a reflective text answer. */
      capabilities: Partial<Record<CapabilityId, number>>;
      bandHint?: number;
    });

/** A question with its capability signals resolved into an answer-ready form. */
export interface PlannedQuestion {
  question: AwakeningQuestion;
}

// ── practice (the session's live exercise) ──────────────────────────────

export interface AwakeningPractice {
  kind: PracticeKind;
  title: string;
  /** The countable instruction. Never poetic. */
  instruction: string;
  note?: string;
  /** breath */
  pattern?: string;
  rounds?: number;
  /** silence */
  seconds?: number;
  speakInto?: string;
  /** game — a real id from the games registry; the practice layer. */
  gameId?: string;
  /** Capabilities this practice actually trains (measured evidence). */
  trains: CapabilityId[];
}

// ── sessions ────────────────────────────────────────────────────────────

export interface AwakeningExperiment {
  title: string;
  /** The real-world act, ≤90 seconds of doing. */
  body: string;
  /** The vow, phrased by the user in their own words. */
  vowLabel: string;
}

export type AwakeningStep =
  | { kind: "question"; beat: Beat }
  | { kind: "practice" }
  | { kind: "experiment" };

export interface AwakeningSession {
  id: string;
  /** Position in the canonical spine, 1–11. */
  n: number;
  title: string;
  /** The question this session asks. */
  question: string;
  essence: string;
  phase: SessionPhase;
  /** Primary capabilities this session trains. */
  capabilities: CapabilityId[];
  master: string;
  estMinutes: number;
  /** What the user discovers here — one line. */
  discovery: string;
  /** What the user walks away able to do. */
  outcome: string;
  /** ONE line, quoted at the next session's threshold. */
  carrySeed: string;
  experiment: AwakeningExperiment;
  practice: AwakeningPractice;
  /** Guide modes / programs this session opens a door to. */
  threads: string[];
  steps: AwakeningStep[];
}

/** A spine step with its question resolved by the planner. */
export type PlannedStep =
  | { kind: "question"; beat: Beat; question: AwakeningQuestion }
  | { kind: "practice"; practice: AwakeningPractice }
  | { kind: "experiment"; experiment: AwakeningExperiment };

// ── progress ────────────────────────────────────────────────────────────

export interface AwakeningAnswer {
  questionId: string;
  sessionId: string;
  beat: Beat;
  /** option id | scale value 1–5 | free text */
  value: string | number;
  capabilities: Partial<Record<CapabilityId, number>>;
  loops?: string[];
  band?: number;
  evidence: EvidenceLevel;
}

export type VowResult = "kept" | "partly" | "not_yet" | "not_asked";

export interface AwakeningProgress {
  current_session_id: string;
  completed_session_ids: string[];
  answers: AwakeningAnswer[];
  /** sessionId → the vow the user phrased in their own words. */
  vows: Record<string, string>;
  /** sessionId → what happened to the vow, asked at the next threshold. */
  vow_results: Record<string, VowResult>;
  /** sessionId → the carry-seed the user left with. */
  carry_seeds: Record<string, string>;
  /** The user's personal order of session ids. */
  order: string[];
  /** What the user said they want from the journey, asked once at the start. */
  goal: string | null;
  completed_at: string | null;
  updated_at: string;
}

// ── the capability map ──────────────────────────────────────────────────

export interface CapabilityMap {
  /** 0–10 provisional read per capability. */
  scores: Record<CapabilityId, number>;
  /** How many data points back each score. */
  evidence: Record<CapabilityId, number>;
  /** Strongest evidence level available per capability. */
  levels: Record<CapabilityId, EvidenceLevel>;
  strongest: CapabilityId;
  weakest: CapabilityId;
  answeredCount: number;
  /** Honest, plain-language lines. Never a verdict. */
  summaryLines: string[];
}

// ── recommendation ──────────────────────────────────────────────────────

export interface Recommendation {
  sessionId: string;
  sessionTitle: string;
  /** Why this session, in plain language. */
  reason: string;
  /** The capabilities this session trains, weakest first. */
  targets: CapabilityId[];
  confidence: EvidenceLevel;
}

// ── the final report ────────────────────────────────────────────────────

export interface ReportSection {
  id: string;
  title: string;
  lines: string[];
  capability?: CapabilityId;
}

export interface PathRecommendation {
  slug: string;
  title: string;
  reason: string;
  /** The journey door this path opens (from journeyDefinitions). */
  journeySlug?: string;
}

export interface DevelopmentReport {
  headline: string;
  sections: ReportSection[];
  /** Loops the user's own answers named, strongest first. */
  patternsIdentified: { id: string; name: string; score: number }[];
  practicesCompleted: number;
  vows: { kept: number; partly: number; notYet: number; total: number };
  strengths: CapabilityId[];
  growthEdges: CapabilityId[];
  recommendedPaths: PathRecommendation[];
}
