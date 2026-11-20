// ─────────────────────────────────────────────────────────────────
// Human Capability Training System — domain model.
//
// A capability is a trainable human function ("sustained attention").
// It is NOT a practice, NOT a game, NOT a topic. Practices, games,
// real-world experiments and reflections are the four modalities that
// train it. Levels mean something behavioural, not badge-shaped.
// ─────────────────────────────────────────────────────────────────

import type { StepKind } from "@/lib/session-shell/types";

export type CapabilityDomain =
  | "attention"
  | "awareness"
  | "will"
  | "thinking"
  | "emotion"
  | "social";

export type CapabilityId = string;

export type CapabilityLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** The four training modalities. A capability is only real once all four are used. */
export type TrainingModality = "game" | "practice" | "experiment" | "reflection";

export const TRAINING_MODALITIES: TrainingModality[] = [
  "game",
  "practice",
  "experiment",
  "reflection",
];

export type ModalityGlyph = Record<TrainingModality, string>;

export const MODALITY_GLYPH: ModalityGlyph = {
  game: "◉",
  practice: "◍",
  experiment: "◆",
  reflection: "✧",
};

/** Comparable signals every modality is normalised onto so they can be weighed together. */
export type MetricKey =
  | "accuracy"
  | "reaction_time"
  | "consistency"
  | "detection_rate"
  | "false_alarm_rate"
  | "sustain_minutes"
  | "return_count"
  | "impulse_events"
  | "self_report"
  | "adherence";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface CapabilityLevelDef {
  level: CapabilityLevel;
  name: string;
  /** What the person can do at this level, in plain behavioural terms. */
  markers: string[];
  /** Observable evidence required before the next level is proposed. */
  exit: string[];
}

export interface CapabilityDef {
  id: CapabilityId;
  name: string;
  domain: CapabilityDomain;
  essence: string;
  /** Exactly six entries, L0..L5, always ordered. */
  levels: CapabilityLevelDef[];
  /** Prerequisite capabilities. The selector will not train a level above what these allow. */
  dependsOn: CapabilityId[];
  /** Order in which modalities become available. L1 usually opens with a game. */
  modalityOrder: TrainingModality[];
  /** What to watch for when deciding the current level. */
  signals: string[];
  /**
   * Legacy column in `user_capacities` (the 12 H-capacity integers).
   * Undefined where the existing schema has no counterpart — the engine then
   * derives state purely from drill evidence.
   */
  capacityKey?: string;
}

// ── Drills ─────────────────────────────────────────────────────────────────

interface BaseDrill {
  id: string;
  capabilityId: CapabilityId;
  title: string;
  modality: TrainingModality;
  minutes: number;
  difficulty: Difficulty;
  /** Capability level range this drill is valid for, inclusive. */
  levelRange: [CapabilityLevel, CapabilityLevel];
  measures: MetricKey[];
  instructions: string;
  /** One sentence on what this drill actually develops. */
  why: string;
}

export interface GameDrill extends BaseDrill {
  modality: "game";
  /** Must resolve to a loader entry in pages/GameRoute.tsx. */
  gameId: string;
  difficultyIndex?: number;
}

export interface PracticeDrill extends BaseDrill {
  modality: "practice";
  /** Reuses an existing session-shell step so no new widget machinery is needed. */
  stepKind: StepKind;
  params?: Record<string, unknown>;
}

export interface ExperimentDrill extends BaseDrill {
  modality: "experiment";
  /** The real-world rule, stated so it can be followed without the app. */
  protocol: string;
  trigger?: string;
  checkIn: { prompt: string; options: string[] };
}

export interface ReflectionDrill extends BaseDrill {
  modality: "reflection";
  questions: string[];
}

export type Drill = GameDrill | PracticeDrill | ExperimentDrill | ReflectionDrill;

export type DrillOfModality<M extends TrainingModality> = Extract<Drill, { modality: M }>;

// ── State ──────────────────────────────────────────────────────────────────

export type AttemptOutcome = "completed" | "abandoned" | "skipped";

export interface DrillAttempt {
  drillId: string;
  capabilityId: CapabilityId;
  modality: TrainingModality;
  outcome: AttemptOutcome;
  /** MetricKey -> raw value. Units are normalised at scoring time. */
  metrics: Partial<Record<MetricKey, number>>;
  note?: string | null;
  durationSeconds?: number;
  at: string;
}

export interface CapabilityState {
  capabilityId: CapabilityId;
  level: CapabilityLevel;
  /** 0..100 within the current level band. */
  progress: number;
  attempts: number;
  completions: number;
  evidence: DrillAttempt[];
  lastTrainedAt: string | null;
  /** Consecutive days with at least one completed attempt. */
  streakDays: number;
  /** Modalities already used. Empty = never actually trained. */
  modalitiesUsed: TrainingModality[];
  /** Prerequisites not yet at the level this capability needs. */
  unmetPrerequisites: CapabilityId[];
}

export interface UserCapabilityMap {
  states: Record<CapabilityId, CapabilityState>;
  updatedAt: string;
}

// ── Selection ──────────────────────────────────────────────────────────────

export type ReasonCode =
  | "lowest_capability"
  | "unmet_modality"
  | "just_leveled"
  | "stale_capability"
  | "streak_protection"
  | "explicit_request"
  | "prerequisite_gate";

export interface TrainingRecommendation {
  capabilityId: CapabilityId;
  drill: Drill;
  reasonCode: ReasonCode;
  /** The human sentence shown on the Home orb card. */
  reason: string;
  score: number;
  alternatives: { drillId: string; capabilityId: CapabilityId; score: number }[];
}

export interface SelectionContext {
  /** Force a specific capability (user picked it from the map). */
  focusCapabilityId?: CapabilityId;
  /** Minutes the person actually has. */
  timeBudgetMinutes?: number;
  /** 1..5, gates difficulty upward. */
  energy?: number;
  /** Force a modality, e.g. the session phase wants an experiment next. */
  requireModality?: TrainingModality;
  /** Deterministic tie-break salt, normally the calendar date. */
  seed?: string;
}