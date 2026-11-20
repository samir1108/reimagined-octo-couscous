/**
 * firstElevenTypes — shared types for The First Eleven (Gate 2)
 * ─────────────────────────────────
 * The First Eleven is the closed, 11-sitting pre-journey curriculum every
 * 2026 user walks through before journeys unlock. Closed = the eleven
 * sittings and their spine are fixed and authored. Adaptive = which
 * questions fill the spine's question slots is selected per user from a
 * 100+ question bank, seeded by everything said so far.
 */

/** The four mapped dimensions (matches the existing dimension_bands model). */
export type SEDimension = "thought" | "emotion" | "body" | "awareness";

/** Question roles inside a session spine. */
export type SERole = "open" | "deepen" | "body" | "mirror" | "choice";

export interface SEQuestionOption {
  id: string;
  label: string;
  hint?: string;
  /** 0–10 consciousness-band signal. */
  band: number;
  dimension: SEDimension;
  /** Loop ids from the loop catalog this option activates/deepens. */
  loops?: string[];
}

interface SEQuestionBase {
  id: string;
  sessionId: string;
  role: SERole;
  title: string;
  subtitle?: string;
}

export type SEQuestion =
  | (SEQuestionBase & {
      kind: "choice";
      options: SEQuestionOption[];
    })
  | (SEQuestionBase & {
      kind: "scale";
      minLabel: string;
      maxLabel: string;
      /** band signal at value 1 and at value 5 (interpolated between). */
      lowBand: number;
      highBand: number;
      dimension: SEDimension;
      loops?: string[];
    })
  | (SEQuestionBase & {
      kind: "text";
      placeholder: string;
      maxLength: number;
      dimension: SEDimension;
      /** Approximate band signal for a reflective text answer. */
      bandHint: number;
      loops?: string[];
    });

/** A fixed spine step. `question` steps are filled by the adaptive selector. */
export type SEStep =
  | { kind: "teaching"; title: string; body: string; master?: string; quote?: { text: string; source: string } }
  | { kind: "question"; role: SERole }
  | { kind: "silence"; seconds: number; prompt: string; speakInto?: string }
  | { kind: "breath"; pattern: string; rounds: number; note: string }
  | { kind: "act"; title: string; body: string; vowLabel: string };

export interface SESession {
  /** 1–11. */
  n: number;
  id: string;
  title: string;
  /** The sitting's koan. */
  essence: string;
  /** What a 2026 user must be told here — shown on the threshold. */
  purpose: string;
  master: string;
  estMinutes: number;
  /** ONE line. Quoted at the next sitting's opening. */
  carrySeed: string;
  steps: SEStep[];
}

/** A spine step with its question resolved by the selector. */
export type PlannedStep =
  | { kind: "teaching"; title: string; body: string; master?: string; quote?: { text: string; source: string } }
  | { kind: "question"; role: SERole; question: SEQuestion }
  | { kind: "silence"; seconds: number; prompt: string; speakInto?: string }
  | { kind: "breath"; pattern: string; rounds: number; note: string }
  | { kind: "act"; title: string; body: string; vowLabel: string };

/** One answered question, stored on progress. */
export interface SEAnswer {
  questionId: string;
  sessionId: string;
  /** option id | scale value (1–5) | free text */
  value: string | number;
  band: number;
  dimension: SEDimension;
  loops?: string[];
}

export interface FirstElevenProgress {
  current_session: number;
  completed_sessions: number[];
  answers: SEAnswer[];
  carry_seeds: Record<number, string>;
  skipped: boolean;
  completed_at: string | null;
  updated_at: string;
}

export interface FirstElevenMapping {
  /** Weighted 0–10 band estimate. */
  band: number;
  /** e.g. "3.4" — the spiral micro-level. */
  bandMicro: string;
  bandLabel: string;
  dimensions: Record<SEDimension, number>;
  loops: { id: string; score: number }[];
  archetypeHint: string;
  summaryLines: string[];
  answeredCount: number;
  readyForJourneys: boolean;
}
