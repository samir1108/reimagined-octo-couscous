/**
 * ARCS — cross-concept sequences.
 * ──────────────────────────────
 * An arc is not a ladder. Each sit opens a different door (observation,
 * emotion, inquiry, subtraction), and the arc is complete only when all sits
 * are done. Observer is the reference implementation.
 */

export type ArcFamily = "observer" | "path" | "inquiry";

export interface ArcSit {
  /** 1-based. */
  index: number;
  title: string;
  concept: string;
  practice: string;
  minutes: number;
  teaching: string;
  practiceText: string;
  question: string;
  trap: string;
  carry: string;
}

export interface ArcDefinition {
  id: string;
  title: string;
  subtitle: string;
  family: ArcFamily;
  /** For the four paths: 1..6. */
  level?: number;
  sits: ArcSit[];
}

export interface ArcProgress {
  arcId: string;
  completed: number[];
  updatedAt?: string;
}
