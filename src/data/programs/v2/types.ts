/**
 * Session-Based Program Framework v2
 * ─────────────────────────────────────────────────────────────
 * Programs are NOT day-based. They progress by adaptive sessions.
 * Every session follows the same 4-part shape:
 *   TEACH → PRACTICE → REFLECT → INTEGRATE
 *
 * A program = metadata + arc + templateId + tradition pack.
 * The template generator composes each session on-demand using
 * the pack's level-tagged blocks and the user's current state.
 */

export type V2TemplateId =
  | "observation"
  | "inquiry"
  | "energetic"
  | "emotional"
  | "integration";

export type V2Phase = "Foundation" | "Practice" | "Integration" | "Mastery";

export type V2Difficulty = "beginner" | "intermediate" | "advanced";

export type V2Tradition =
  | "raja-yoga"
  | "tantra"
  | "jnana"
  | "bhakti"
  | "karma"
  | "buddhist"
  | "vedanta"
  | "kriya"
  | "modern"
  | "universal";

// ─── Tradition pack ────────────────────────────────────────────

export interface TeachBlock {
  /** 60–120s teach text. Markdown OK. */
  text: string;
  /** Which phases this block fits. */
  phases: V2Phase[];
  /** Estimated read time in seconds. */
  seconds?: number;
}

export interface PracticeBlock {
  title: string;
  /** Step-by-step guided script (kept short — runtime expands as needed). */
  steps: string[];
  /** Practice level 0–6. Aligns with phase levelRange. */
  level: number;
  durationMinutes: number;
  type:
    | "observation"
    | "meditation"
    | "breathwork"
    | "body-scan"
    | "journaling"
    | "contemplation"
    | "movement"
    | "mantra";
}

export interface ReflectPrompt {
  prompt: string;
  phases: V2Phase[];
}

export interface IntegrateCue {
  /** A short anchor sentence to carry through the day. */
  cue: string;
  phases: V2Phase[];
}

export interface TraditionPack {
  /** Human-readable lineage (e.g. "Raja Yoga — Patanjali's 8 limbs"). */
  lineage: string;
  /** Core promise the user can expect. */
  promise: string;
  /** Key vocabulary the AI/teacher voice should use. */
  vocabulary?: string[];
  teach: TeachBlock[];
  practices: PracticeBlock[];
  reflects: ReflectPrompt[];
  integrates: IntegrateCue[];
}

// ─── Program shape ─────────────────────────────────────────────

export interface ProgramArcPhase {
  phase: V2Phase;
  /** Suggested number of sessions in this phase. Engine may shorten/extend. */
  sessions: number;
  /** Practice level range the engine should pull from. */
  levelRange: [number, number];
  /** What the phase focuses on (shown in detail view). */
  focus: string;
}

export interface SessionProgram {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tradition: V2Tradition;
  category:
    | "awareness"
    | "mind"
    | "emotional"
    | "body"
    | "meditation"
    | "purpose"
    | "shadow"
    | "yoga-paths"
    | "sleep";
  difficulty: V2Difficulty;
  estSessions: { min: number; typical: number; max: number };
  arc: ProgramArcPhase[];
  templateId: V2TemplateId;
  pack: TraditionPack;
  tags: string[];
  icon: string;
  coverGradient: string;
}

// ─── Generated session (what the runner consumes) ──────────────

export interface GeneratedSession {
  sessionIndex: number; // 1-based
  phase: V2Phase;
  level: number;
  teach: { text: string; seconds: number };
  practice: PracticeBlock;
  reflect: { prompt: string };
  integrate: { cue: string };
  /** Engine note: why this composition (shown subtly in UI). */
  reason?: string;
}

// ─── Engine context ────────────────────────────────────────────

export interface ProgramSessionContext {
  /** Current session index (1-based). */
  sessionIndex: number;
  /** User's detected starting level for the program's practice. */
  userLevel: number;
  /** Last 1–3 quality scores (0..1). Empty = first session. */
  recentQuality: number[];
  /** True if engine detected plateau. */
  plateauDetected?: boolean;
  /** True if user regressed (drop in band). */
  regressionFlag?: boolean;
  /** Available minutes user has now (for time-aware composition). */
  availableMinutes?: number;
}
