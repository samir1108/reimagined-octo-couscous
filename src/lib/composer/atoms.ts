/**
 * Step Atom — the universal unit of a session.
 *
 * A session (1–7 atoms) can mix anything: breath, silence, journal,
 * self-inquiry with a master, wisdom drops, any of the 275 games,
 * mantra, loop-naming, vow-renewal, and more.
 *
 * ANY new practice/game the Composer wants to slot into a session
 * must be reachable through one of these `kind`s. If a new kind is
 * added, three places update in sync:
 *   1. `StepAtom` union below
 *   2. `ATOM_KINDS` array (for the LLM prompt + validators)
 *   3. Session Room step renderer switch
 */

export type MasterId =
  | "adiyogi" | "patanjali" | "krishna" | "buddha" | "ramana"
  | "nisargadatta" | "shankaracharya" | "vivekananda" | "aurobindo"
  | "yogananda" | "osho" | "kabir" | "mira";

export type MasterMode =
  | "self-inquiry" | "wisdom-drop" | "witness-guidance"
  | "breath-teaching" | "story" | "silence-sitting"
  | "koan" | "devotion" | "loop-mirror";

export type BreathVariant =
  | "nadi-shodhana" | "sheetali" | "kapalbhati"
  | "box" | "coherent" | "bhramari" | "ujjayi";

export interface AtomCover {
  video?: string;    // path/url to ambient video
  image?: string;    // fallback still
  master?: MasterId; // portrait + palette
  palette?: string;  // "warm" | "cool" | "ember" | ...
}

export interface BaseAtomFields {
  title: string;
  whyForYou?: string;  // one sentence tying it to a signal
  signalRef?: string;  // loop id, dimension, band, master affinity
  est_minutes: number;
  optional?: boolean;
  cover?: AtomCover;
}

export type StepAtom = BaseAtomFields & (
  | { kind: "breath"; variant: BreathVariant; durationSec: number }
  | { kind: "witness"; prompt: string; durationSec: number }
  | { kind: "journal"; prompt: string; minChars?: number }
  | { kind: "self-inquiry"; seed: string; master?: MasterId }
  | { kind: "wisdom-read"; sourceId?: string; text?: string; master?: MasterId }
  | { kind: "mantra"; mantra: string; count: number }
  | { kind: "silence"; durationSec: number; ambient?: string }
  | { kind: "body-scan"; durationSec: number }
  | { kind: "micro-act"; instruction: string }
  | { kind: "reflection"; question: string }
  | { kind: "master-chat"; master: MasterId; mode: MasterMode; seed: string }
  | { kind: "guide-chat"; seed: string; toneWords?: string[] }
  | { kind: "game"; gameId: string; brief?: string }
  | { kind: "thought-watch"; durationSec: number; prompt?: string }
  | { kind: "question-of-day"; question: string }
  | { kind: "gratitude-drop"; count: number }
  | { kind: "loop-name"; loopId: string; hint?: string }
  | { kind: "vow-renew"; vowId?: string; text?: string }
  | { kind: "ancestor-thank" }
  | { kind: "child-letter" }
  | { kind: "future-self" }
);

export type StepAtomKind = StepAtom["kind"];

/** Kept in sync with StepAtom union — used by composer LLM prompt & validators. */
export const ATOM_KINDS: StepAtomKind[] = [
  "breath", "witness", "journal", "self-inquiry", "wisdom-read",
  "mantra", "silence", "body-scan", "micro-act", "reflection",
  "master-chat", "guide-chat", "game", "thought-watch",
  "question-of-day", "gratitude-drop", "loop-name", "vow-renew",
  "ancestor-thank", "child-letter", "future-self",
];

export const ALL_MASTERS: MasterId[] = [
  "adiyogi", "patanjali", "krishna", "buddha", "ramana",
  "nisargadatta", "shankaracharya", "vivekananda", "aurobindo",
  "yogananda", "osho", "kabir", "mira",
];

export const ALL_MASTER_MODES: MasterMode[] = [
  "self-inquiry", "wisdom-drop", "witness-guidance",
  "breath-teaching", "story", "silence-sitting",
  "koan", "devotion", "loop-mirror",
];

// ──────────────────────────────────────────────────────────────
// SessionPlan — the Composer's output
// ──────────────────────────────────────────────────────────────

export interface SessionPlan {
  id?: string;
  intent: string;             // one-line "why this session"
  intro?: string;             // 1–2 sentence opening the user reads first
  atoms: StepAtom[];          // 1..7
  masterId?: MasterId;        // dominant master, if any
  toneWords?: string[];       // ["soft","clear"] — drives palette + copy
  targetMinutes?: number;
  archetype?: string;         // opening-core-integration | single-focus | ritual | ...
  archetypeReason?: string;
  meta?: Record<string, unknown>;
}

// ──────────────────────────────────────────────────────────────
// Validators — cheap runtime guard for LLM output
// ──────────────────────────────────────────────────────────────

export function isStepAtom(x: unknown): x is StepAtom {
  if (!x || typeof x !== "object") return false;
  const a = x as { kind?: unknown; title?: unknown; est_minutes?: unknown };
  return typeof a.kind === "string"
    && (ATOM_KINDS as string[]).includes(a.kind)
    && typeof a.title === "string"
    && typeof a.est_minutes === "number";
}

export function coerceSessionPlan(raw: unknown): SessionPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<SessionPlan>;
  if (!Array.isArray(p.atoms) || p.atoms.length === 0 || p.atoms.length > 7) return null;
  const atoms = p.atoms.filter(isStepAtom);
  if (atoms.length === 0) return null;
  return {
    id: p.id,
    intent: typeof p.intent === "string" ? p.intent : "A short guided session.",
    intro: p.intro,
    atoms,
    masterId: p.masterId,
    toneWords: p.toneWords,
    targetMinutes: p.targetMinutes ?? atoms.reduce((s, a) => s + a.est_minutes, 0),
    archetype: p.archetype,
    archetypeReason: p.archetypeReason,
    meta: p.meta,
  };
}

// ──────────────────────────────────────────────────────────────
// Deterministic fallback scaffolds (used when LLM/credits fail)
// ──────────────────────────────────────────────────────────────

export type Gate = "morning" | "midday" | "evening" | "night";

export function scaffoldFor(gate: Gate, minutes: number): StepAtom[] {
  const short = minutes <= 4;
  const medium = minutes <= 12;
  switch (gate) {
    case "morning":
      return short
        ? [
            { kind: "breath", variant: "nadi-shodhana", durationSec: 90, title: "Nadi Shodhana", est_minutes: 2 },
            { kind: "reflection", question: "What one thing matters today?", title: "One thing", est_minutes: 1 },
          ]
        : [
            { kind: "breath", variant: "nadi-shodhana", durationSec: 120, title: "Nadi Shodhana", est_minutes: 2 },
            { kind: "witness", prompt: "Notice the first thought that arises.", durationSec: 120, title: "Watch the first thought", est_minutes: 2 },
            { kind: "reflection", question: "What one thing matters today?", title: "Sankalpa", est_minutes: 2 },
            { kind: "wisdom-read", text: "You are not the doer; you are the space in which doing appears.", title: "Wisdom drop", est_minutes: medium ? 1 : 2 },
          ];
    case "midday":
      return [
        { kind: "breath", variant: "box", durationSec: 90, title: "Reset breath", est_minutes: 2 },
        { kind: "thought-watch", durationSec: 120, prompt: "Let thoughts pass like clouds.", title: "Thought watch", est_minutes: 2 },
        { kind: "reflection", question: "What loop pulled you off-center this morning?", title: "Loop check", est_minutes: 2 },
      ];
    case "evening":
      return [
        { kind: "breath", variant: "coherent", durationSec: 120, title: "Coherent breath", est_minutes: 2 },
        { kind: "journal", prompt: "What shifted today?", minChars: 40, title: "Evening reflection", est_minutes: 3 },
        { kind: "gratitude-drop", count: 3, title: "Three gratitudes", est_minutes: 2 },
      ];
    case "night":
      return [
        { kind: "body-scan", durationSec: 180, title: "Body scan", est_minutes: 3 },
        { kind: "silence", durationSec: 120, title: "Sit in silence", est_minutes: 2 },
        { kind: "reflection", question: "What do you release before sleep?", title: "Release", est_minutes: 2 },
      ];
  }
}

export function fallbackPlan(gate: Gate, minutes: number): SessionPlan {
  const atoms = scaffoldFor(gate, minutes);
  return {
    intent: `A short ${gate} session, composed for you.`,
    intro: "This is a light guide — go slower than you think you need to.",
    atoms,
    targetMinutes: atoms.reduce((s, a) => s + a.est_minutes, 0),
    archetype: "opening-core-integration",
    archetypeReason: "fallback",
    toneWords: ["gentle", "clear"],
  };
}
