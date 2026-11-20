/**
 * Cinematic Engine — Types
 * ────────────────────────
 * Authored scripts for immersive, paced practice surfaces (kriya, pranayama,
 * yoga nidra, witness, etc). Composed of phases × beats × checkpoints.
 *
 * Each script declares fractal layers (depths). The engine picks the
 * deepest layer the user has earned via per-practice level.
 *
 * Interaction model (per spec): single-tap [Yes] / [Not yet] checkpoints,
 * adaptive branching, max 3-4 checkpoints per session, no typing.
 */
import type { Practice } from "@/lib/sutra/practices";

export type CinematicSurface = "black" | "guru-bg" | "starfield";

/**
 * A "beat" is a single line/cue with hold-time. They are spoken in sequence.
 * Pauses between beats are part of the experience.
 */
export interface CinematicBeat {
  /** Text to reveal. Use "..." for breath pauses. */
  text: string;
  /** Hold duration in ms before the next beat appears. */
  holdMs: number;
  /** Optional: treat this beat as silent (no text), just timed pause. */
  silent?: boolean;
}

export type CheckpointResponse = "yes" | "not_yet";

export interface CinematicCheckpoint {
  id: string;
  question: string;
  /** Branch beats to play based on response. */
  onYes: CinematicBeat[];
  onNotYet: CinematicBeat[];
}

export interface CinematicPhase {
  id: string;
  /** Soft Arrival → Deepening → Checkpoint → Continue → Close, etc */
  kind: "arrival" | "deepen" | "checkpoint" | "integrate" | "close";
  beats: CinematicBeat[];
  /** Optional checkpoint at the end of this phase. */
  checkpoint?: CinematicCheckpoint;
}

/**
 * One fractal layer of a script. L0 = beginner (most hand-holding),
 * L3 = subtle (least narration, most space).
 */
export interface CinematicLayer {
  layer: number; // 0..3
  title: string;
  phases: CinematicPhase[];
}

export interface CinematicScript {
  id: string;
  practice: Practice;
  /** human label, e.g. "Energetic Kriya" */
  label: string;
  /** total target duration in seconds (across phases, approximate) */
  defaultDurationSec: number;
  surface: CinematicSurface;
  /** Ordered layers by depth. Engine picks based on user level. */
  layers: CinematicLayer[];
}

/** Runtime state used by the surface component. */
export interface CinematicRunState {
  scriptId: string;
  layerIdx: number;
  phaseIdx: number;
  beatIdx: number;
  /** Branch beats injected after a checkpoint response (played before next phase). */
  pendingBranch: CinematicBeat[] | null;
  startedAt: number;
  checkpointResponses: Record<string, CheckpointResponse>;
}
