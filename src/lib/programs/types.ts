/**
 * Programs v3 — Session-based, Atom-composed
 * ─────────────────────────────────────────────
 * A Program is a fixed INTENT delivered over N sessions (not days).
 * Each Session = composition of 3–12 ATOMS drawn from 30 categories
 * (~580 atoms total). The composer picks atoms per user state.
 *
 * This file defines ONLY types. No runtime logic, no imports.
 * Safe to import anywhere.
 */

// ─── 30 Atom Categories ──────────────────────────────────────────
export type AtomCategory =
  // Knowledge / Teaching
  | "teaching"           // story, sutra, parable, koan
  | "wisdom-read"        // Gita / Upanishad / Tao / Rumi excerpts
  | "neuroscience"       // brain-science explainer
  | "framework"          // mental model, diagram
  // Practice — body / energy
  | "breathwork"
  | "body-scan"
  | "kriya"              // energetic cleansing technique
  | "movement"           // micro-movement, asana
  | "mudra"
  | "mantra"
  // Practice — mind / awareness
  | "meditation"
  | "witness"            // sakshi bhav observation
  | "observation"        // structured noticing (5-senses, etc)
  | "concentration"      // dharana, single-pointed
  // Inquiry / Reflection
  | "self-inquiry"       // who-am-I, atma-vichara
  | "contemplation"      // sit-with-a-question
  | "journal"            // structured writing
  | "voice-journal"      // spoken reflection
  // Emotional / Therapy
  | "ifs-parts"          // internal-family-systems part dialogue
  | "somatic-release"    // tension release
  | "emotion-naming"     // RAIN, label-to-tame
  | "shadow-work"
  // Dialogue / Social
  | "guru-dialogue"      // chat with a master
  | "council"            // multi-guru council
  | "guide-chat"         // wise-sibling AI guide
  // Real-world acts
  | "micro-act"          // tangible action (call mom, drink water)
  | "speech-vow"         // intentional speech act
  | "detox"              // refrain action (no phone 1h)
  // Generative / Adaptive
  | "ai-mirror"          // AI reflects user's pattern back
  | "loop-confront"      // engage detected loop
  | "ritual";            // ceremonial close/open

export const ATOM_CATEGORIES: AtomCategory[] = [
  "teaching","wisdom-read","neuroscience","framework",
  "breathwork","body-scan","kriya","movement","mudra","mantra",
  "meditation","witness","observation","concentration",
  "self-inquiry","contemplation","journal","voice-journal",
  "ifs-parts","somatic-release","emotion-naming","shadow-work",
  "guru-dialogue","council","guide-chat",
  "micro-act","speech-vow","detox",
  "ai-mirror","loop-confront","ritual",
];

// ─── Multipliers ─────────────────────────────────────────────────
export type AtomIntensity = "gentle" | "balanced" | "fierce";
export type AtomModality = "read" | "listen" | "move" | "speak" | "write" | "sit";
export type AtomGate = "morning" | "midday" | "evening" | "night" | "any";
export type AtomEnergy = "low" | "medium" | "high";

// ─── The Atom ────────────────────────────────────────────────────
export interface Atom {
  /** Stable id, e.g. "breath.box-4-4-4-4". */
  id: string;
  category: AtomCategory;
  /** Short human label. */
  label: string;
  /** 1-line intent for the AI/composer. */
  intent: string;
  /** Minimum and typical duration in seconds. */
  durationSec: { min: number; typical: number; max: number };
  /** Practice level 0–6 (0 = anyone). */
  level: number;
  modality: AtomModality;
  intensity: AtomIntensity;
  /** Which daily gates this atom suits. */
  gates: AtomGate[];
  /** Energy levels this atom fits. */
  energy: AtomEnergy[];
  /** Loop IDs this atom targets (e.g. ["VAL001"]). */
  loopTargets?: string[];
  /** Step-by-step script (kept short — runner expands as needed). */
  script?: string[];
  /** Body content for read/teaching atoms. */
  body?: string;
  /** Optional voice/master id whose tone fits. */
  voiceHint?: string;
  /** Tags for search/filter. */
  tags?: string[];
}

// ─── Composed Session ────────────────────────────────────────────
export interface SessionAtomInstance {
  atomId: string;
  /** Order in session. */
  order: number;
  /** Adjusted duration for this instance. */
  durationSec: number;
  /** Optional overrides set by composer. */
  intensity?: AtomIntensity;
  /** Why composer picked this atom. */
  reason?: string;
}

export interface ComposedSession {
  /** 1-based index inside the program. */
  sessionIndex: number;
  /** Intent of this session within the program arc. */
  intent: string;
  /** Phase tag (Foundation / Practice / Integration / Mastery). */
  phase: ProgramPhase;
  /** The atom sequence. */
  atoms: SessionAtomInstance[];
  /** Total duration in seconds. */
  totalSec: number;
  /** Composer rationale shown to user. */
  why?: string;
}

// ─── Program (intent + arc, NOT day-based) ───────────────────────
export type ProgramPhase = "Foundation" | "Practice" | "Integration" | "Mastery";
export type ProgramDifficulty = "beginner" | "intermediate" | "advanced";

export interface ProgramSessionTemplate {
  /** Session number (1-based). */
  index: number;
  phase: ProgramPhase;
  /** Theme / intent for this session. */
  intent: string;
  /** Required atoms (always included). */
  required: string[]; // atom ids
  /** Optional atoms (composer may add based on state). */
  optional?: string[];
  /** Atom categories the composer may freely draw from to fill time. */
  fillFrom?: AtomCategory[];
  /** Target duration in minutes. */
  targetMinutes: number;
}

export interface SessionProgramV3 {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: ProgramDifficulty;
  category: string;
  tags: string[];
  icon: string;
  coverGradient: string;
  /** Total sessions in the program. */
  totalSessions: number;
  /** Phase distribution for at-a-glance UI. */
  phases: { phase: ProgramPhase; sessions: number; focus: string }[];
  /** The session templates — composer fills in atoms. */
  sessions: ProgramSessionTemplate[];
}
