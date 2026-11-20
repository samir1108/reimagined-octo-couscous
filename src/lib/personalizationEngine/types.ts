// Personalization Engine — the 7-layer foundation described in the ConsciousOS
// personalization vision. Client-side types + helpers; persistence is via
// Supabase tables created in migration 20261023000000_personalization_engine.sql.
//
// Design rules (from the vision):
//  - Inferred traits are never permanent facts: every entity carries a
//    `source` ("user_shared" | "confirmed_memory" | "tentative_inference")
//    and a `confidence` (0..1).
//  - Users can correct or delete anything.
//  - AI interpretations are hypotheses, not diagnoses.
//  - Depth is earned through readiness & consent, never forced.

export type MemorySource =
  | "user_shared"
  | "confirmed_memory"
  | "tentative_inference";

export type DepthMode =
  | "arrive"
  | "observe"
  | "investigate"
  | "experiment"
  | "integrate";

export type ThreadStatus = "open" | "paused" | "resolved" | "abandoned";
export type GoalStatus = "active" | "paused" | "achieved" | "abandoned";
export type ExperimentOutcome =
  | "tried"
  | "not_yet"
  | "not_relevant"
  | "unknown";

export interface UserGoal {
  id: string;
  userId: string;
  goal: string;
  lifeDomain?: string;
  source: MemorySource;
  confidence: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserPattern {
  id: string;
  userId: string;
  trigger: string;
  reaction: string;
  underlyingConcern?: string;
  typicalResponse?: string;
  desiredResponse?: string;
  evidenceCount: number;
  source: MemorySource;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface OpenThread {
  id: string;
  userId: string;
  question: string;
  originGoalId?: string | null;
  originObservationId?: string | null;
  status: ThreadStatus;
  depthMode: DepthMode;
  sessionsCount: number;
  lastExploredAt?: string | null;
  resolutionNote?: string | null;
  source: MemorySource;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionObservation {
  id: string;
  userId: string;
  sessionId?: string | null;
  threadId?: string | null;
  observation: string;
  confirmed: boolean;
  source: MemorySource;
  confidence: number;
  createdAt: string;
}

export interface SessionFeedback {
  id: string;
  userId: string;
  sessionId?: string | null;
  relevant: boolean;
  helpful: boolean;
  difficult: boolean;
  unwanted: boolean;
  note?: string | null;
  createdAt: string;
}

export interface LivingExperiment {
  id: string;
  userId: string;
  threadId?: string | null;
  sessionId?: string | null;
  action: string;
  observationPrompt: string;
  outcome: ExperimentOutcome;
  outcomeNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizationEvent {
  id: string;
  userId: string;
  kind: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface PersonalizedSessionPlan {
  userGoal?: string;
  openThread?: { id: string; question: string; confidence: number };
  startingPoint: { context: string; source: MemorySource };
  intendedOutcome: string;
  depthMode: DepthMode;
  practice: { family: string; focus: string; level: number };
  interactionStyle: "guided_voice" | "reflective_questions" | "quiet_practice" | "interactive";
  steps: Array<{ instruction: string; purpose: string; estimatedMinutes: number; adaptationOptions: string[] }>;
  closingQuestion: string;
  optionalExperiment?: { action: string; observationPrompt: string };
  frameworkId?: string;
  frameworkName?: string;
  frameworkStages?: string[];
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

/** Map a confirmed observation count to a suggested next depth mode. */
export function suggestDepthMode(params: {
  sessionsCount: number;
  lastFeedback?: SessionFeedback | null;
  userOverwhelmed?: boolean;
}): DepthMode {
  if (params.userOverwhelmed) return "arrive";
  const n = params.sessionsCount;
  if (n <= 1) return "arrive";
  if (n <= 3) return "observe";
  if (n <= 6) return "investigate";
  if (n <= 10) return "experiment";
  return "integrate";
}

/** Depth must never auto-push: if feedback says difficult/unwanted, step back. */
export function softenDepth(mode: DepthMode): DepthMode {
  const order: DepthMode[] = ["arrive", "observe", "investigate", "experiment", "integrate"];
  const i = order.indexOf(mode);
  return i > 0 ? order[i - 1] : "arrive";
}

export const DEPTH_LABELS: Record<DepthMode, string> = {
  arrive: "Arrive — settle and notice the present",
  observe: "Observe — notice a thought, emotion, or sensation",
  investigate: "Investigate — explore the sequence of events",
  experiment: "Experiment — try a small alternative response",
  integrate: "Integrate — apply the observation to everyday life",
};
