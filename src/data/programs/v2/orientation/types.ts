/**
 * Orientation Path — types for the 30-session foundational course.
 * Each session = TEACH → PRACTICE → REFLECT → INTEGRATE,
 * mirroring v2 SessionProgram shape so it reuses the same runtime.
 */

export type OrientationActId = 1 | 2 | 3 | 4 | 5;

export type OrientationFrameworkId =
  // Act 1 — Worldview
  | "simulation" | "ancient-india" | "world-traditions" | "yoga-is-exit"
  | "four-goals" | "awakening-meaning"
  // Act 2 — Awareness
  | "witness" | "session-anatomy" | "practice-levels" | "eleven-bands"
  | "six-dimensions" | "calibration"
  // Act 3 — Three Intelligences
  | "three-llms" | "head-lens" | "heart-lens" | "gut-lens"
  | "breath-bridge" | "voice-prosody"
  // Act 4 — What Runs You
  | "loops" | "samskaras" | "three-second-gap" | "four-gates"
  | "shadow" | "self-inquiry"
  // Act 5 — Living It
  | "neti-neti" | "companion" | "temple-masters" | "karma-yoga"
  | "spiritual-dna" | "vow-sankalpa";

export interface OrientationSession {
  index: number;          // 1..30
  act: OrientationActId;
  frameworkId: OrientationFrameworkId;
  title: string;
  subtitle: string;
  teach: {
    hook: string;         // 1 line opener
    body: string;         // ~90s read
    whyItMatters: string; // why the user should care
  };
  practice: {
    title: string;
    steps: string[];
    durationMinutes: number;
  };
  reflect: { prompt: string };
  integrate: { cue: string };
  /** Surfaces revealed after this session — informational only. */
  unlocks?: string[];
}

export interface OrientationAct {
  id: OrientationActId;
  title: string;
  subtitle: string;
  sessions: [number, number]; // inclusive range
  milestoneCopy: {
    title: string;
    body: string;
  };
}
