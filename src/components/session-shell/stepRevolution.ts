// Frontend-only "step revolution" helpers — translates generic AI step output
// into imperative, master-attributed, level-marked guidance WITHOUT touching
// the edge function prompt or DB schema. Safe to remove without breaking flow.

import type { SessionStep, StepKind } from "@/lib/session-shell/types";
import { GURUS } from "@/lib/guru-data";

// ── Per-kind master pool (any master, anytime — rotated by seed) ─────────────
// Wider pools so the council feels alive — different masters appear across
// sessions even for the same step kind. Seed (session signature) picks one.
const KIND_MASTER_PRIORITY: Record<StepKind, string[]> = {
  breathwork:     ["babaji", "patanjali", "krishnamacharya", "iyengar", "sivananda", "tirumalai"],
  witness:        ["ramana-maharshi", "nisargadatta", "krishnamurti", "papaji", "mooji", "adyashanti"],
  journal:        ["krishnamurti", "ramana-maharshi", "vivekananda", "rumi", "thoreau", "rilke"],
  reflection:     ["rumi", "kabir", "ramana-maharshi", "hafiz", "lao-tzu", "dogen"],
  "micro-act":    ["mahavira", "buddha", "gandhi", "vivekananda", "ambedkar", "thich-nhat-hanh"],
  practice:       ["patanjali", "mahavira", "buddha", "milarepa", "bodhidharma", "dogen"],
  "wisdom-read":  ["vyasa", "shankara", "vivekananda", "ramanuja", "madhva", "abhinavagupta"],
  "guide-chat":   ["krishnamurti", "rumi", "osho", "alan-watts", "ram-dass", "chogyam-trungpa"],
  "temple-chat":  ["osho", "rumi", "ramana-maharshi", "neem-karoli-baba", "anandamayi-ma", "ramakrishna"],
};

function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function getStepMaster(kind: StepKind, seed?: string) {
  const ids = KIND_MASTER_PRIORITY[kind] || [];
  // Resolve to available GURUS in priority order, then rotate by seed.
  const available = ids
    .map((id) => GURUS.find((x) => x.id === id))
    .filter(Boolean) as any[];
  if (available.length === 0) {
    // Fall back to any master so the council always has a face.
    return GURUS[0] || null;
  }
  const offset = seed ? hashSeed(`${kind}:${seed}`) % available.length : 0;
  return available[offset];
}

// ── Imperative title overlay — only rewrites very-generic AI titles ─────────
const GENERIC_PATTERNS = [
  /^softening/i, /^embracing/i, /^a reflection/i, /^reflection on/i,
  /^opening/i, /^awakening/i, /^the quiet/i, /^grounding into/i,
  /^settling/i, /^arriving/i, /^the edges/i,
];

const IMPERATIVE_BY_KIND: Record<StepKind, string> = {
  breathwork:    "Drop your shoulders. Three slow breaths.",
  witness:       "Sit still. Watch what arises without naming it.",
  journal:       "Name the loudest thought. Write one line.",
  reflection:    "Close your eyes. Ask: what is still here?",
  "micro-act":   "Do one small act now. No commentary.",
  practice:      "Begin the practice. Stay 60 seconds longer than you want to.",
  "wisdom-read": "Read slowly. Stop at the line that catches you.",
  "guide-chat":  "Tell the truth in one sentence.",
  "temple-chat": "Enter. Sit. Ask one real question.",
};

export function getImperativeTitle(step: SessionStep): string {
  const t = (step.title || "").trim();
  if (!t) return IMPERATIVE_BY_KIND[step.kind];
  if (GENERIC_PATTERNS.some((re) => re.test(t))) return IMPERATIVE_BY_KIND[step.kind];
  return t;
}

// ── Why this step (client-side derivation) ───────────────────────────────────
const WHY_BY_KIND: Record<StepKind, string> = {
  breathwork:    "Body score reads weakest right now — breath resets the floor.",
  witness:       "Witness time has been short — going longer rebuilds the noticer.",
  journal:       "Recent reflections show the loop is still unnamed.",
  reflection:    "Without a closing line, the session's insight scatters.",
  "micro-act":   "Insight without action loops. One act breaks the cycle.",
  practice:      "This is the keystone — the rest hinges on it.",
  "wisdom-read": "A frame is needed before the body can do the work.",
  "guide-chat":  "You haven't spoken the inconvenient thing in days.",
  "temple-chat": "A master's lens cuts cleaner than your own.",
};

const WHY_VARIANTS: Record<StepKind, string[]> = {
  breathwork: [
    "Body score reads weakest right now — breath resets the floor.",
    "The body holds what the mind can't name. Breath is the bridge.",
    "Before the mind can follow, the body must arrive. Three breaths.",
  ],
  witness: [
    "Witness time has been short — going longer rebuilds the noticer.",
    "The noticer is the part of you that never gets caught. Stretch it.",
    "You've been watching thoughts. Now watch the watcher itself.",
  ],
  journal: [
    "Recent reflections show the loop is still unnamed.",
    "What you don't name, you repeat. One line breaks the cycle.",
    "The page doesn't judge. Give it the sentence you've been avoiding.",
  ],
  reflection: [
    "Without a closing line, the session's insight scatters.",
    "An unclosed session leaks. Seal it with one true sentence.",
    "What you leave unsaid dissolves. Say it now.",
  ],
  "micro-act": [
    "Insight without action loops. One act breaks the cycle.",
    "A small true act dissolves a thousand great thoughts.",
    "The mind spins. The body finishes. Do one small thing.",
  ],
  practice: [
    "This is the keystone — the rest hinges on it.",
    "Everything before this was preparation. This is the work.",
    "The practice is the point. Stay one breath longer than you want.",
  ],
  "wisdom-read": [
    "A frame is needed before the body can do the work.",
    "The teaching isn't the truth. It's the lens through which you see it.",
    "Read it once with the eyes. Twice with the body.",
  ],
  "guide-chat": [
    "You haven't spoken the inconvenient thing in days.",
    "The truth you're avoiding is the truth that frees you. Say it.",
    "Speak the inconvenient sentence first. The rest follows.",
  ],
  "temple-chat": [
    "A master's lens cuts cleaner than your own.",
    "You've been looking at this from inside. A master sees from outside.",
    "The master isn't special. They're just someone who saw through the same fog.",
  ],
};

function pickVariant(kind: StepKind, title: string): string {
  const pool = WHY_VARIANTS[kind] || [WHY_BY_KIND[kind] || "Sequenced for where you are right now."];
  const idx = hashSeed(`${kind}:${title}`) % pool.length;
  return pool[idx];
}

export function getStepWhy(step: SessionStep, isKeystone: boolean): string {
  if (isKeystone) return "Keystone — the rest of the session hinges on this.";
  return pickVariant(step.kind, step.title);
}

// ── Keystone selection ───────────────────────────────────────────────────────
const KEYSTONE_PREFERENCE: StepKind[] = [
  "practice", "witness", "journal", "micro-act", "reflection",
];

export function pickKeystoneIndex(steps: SessionStep[]): number {
  if (!steps.length) return -1;
  // Keystone = the step the rest actually hinges on. A 2-minute settle is
  // never the keystone — prefer a real practice, then witness, then a write.
  const explicit = steps.findIndex((s) => s.keystone === true);
  if (explicit >= 0) return explicit;
  for (const kind of KEYSTONE_PREFERENCE) {
    const idx = steps.findIndex((s) => s.kind === kind && !s.optional && s.est_minutes >= 3);
    if (idx >= 0) return idx;
  }
  const longest = steps.reduce(
    (best, s, i) => (!s.optional && s.est_minutes > steps[best].est_minutes ? i : best),
    0,
  );
  return longest >= 0 ? longest : 0;
}

// ── Per-step level dot (5-dot scale) ─────────────────────────────────────────
// Kept only for callers that still render a level chip from real params; the
// shell no longer invents a level from V-Level + duration.
export function renderLevelDots(level: number, max = 5): string {
  const l = Math.max(1, Math.min(max, Math.round(level)));
  return "●".repeat(l) + "○".repeat(max - l);
}

export function deriveStepLevel(step: SessionStep, vLevel?: number | null): number {
  const explicit = Number((step.params as Record<string, unknown> | undefined)?.level);
  if (Number.isFinite(explicit) && explicit > 0) return Math.max(1, Math.min(5, Math.round(explicit)));
  const base = typeof vLevel === "number" ? Math.ceil(vLevel / 2) : 3;
  const bump = step.est_minutes >= 8 ? 1 : step.est_minutes <= 2 ? -1 : 0;
  return Math.max(1, Math.min(5, base + bump));
}

// One-line verdict per step kind — used as the master's reason for being here.
const VERDICT_BY_KIND: Partial<Record<StepKind, string>> = {
  breathwork:    "brought the body.",
  witness:       "asked who is watching.",
  journal:       "said stop performing — write it.",
  reflection:    "insisted on silence at the end.",
  "micro-act":   "demanded one true act.",
  practice:      "chose the keystone.",
  "wisdom-read": "opened the frame.",
  "guide-chat":  "wants the inconvenient sentence.",
  "temple-chat": "called you to sit.",
};

// ── Council selection — pick 1–3 masters, each justified by a real step ─────
// No fixed quorum. The number reflects the session's actual diversity:
//   1 step kind → 1 master, 2 → 2, 3+ → 3 (max). Any master can show up
//   anytime — the picked master per kind rotates by a session seed so the
//   council feels alive across sessions.

export interface CouncilMember {
  guru: NonNullable<ReturnType<typeof getStepMaster>>;
  /** The step kind this master is here for — drives the verdict / reason. */
  forKind: StepKind;
  /** True when this is the user's currently-enrolled primary guru. */
  isPrimary?: boolean;
  /** Real line spoken by this voice, when the composer supplied one. */
  verdict?: string;
}

const MAX_COUNCIL = 3;

export function pickCouncil(
  steps: SessionStep[],
  primaryGuruId?: string | null,
  seed?: string,
): CouncilMember[] {
  const seen = new Set<string>();
  const out: CouncilMember[] = [];

  // Stable-but-varying seed: caller seed, or a signature of the steps themselves.
  const effectiveSeed =
    seed || steps.map((s) => `${s.kind}:${(s as any).id ?? s.title ?? ""}`).join("|");

  // 1) Primary guru (if enrolled) — anchored to the keystone step so the reason is real.
  if (primaryGuruId) {
    const g = GURUS.find((x) => x.id === primaryGuruId);
    if (g) {
      const ksIdx = pickKeystoneIndex(steps);
      const forKind = (steps[ksIdx]?.kind ?? steps[0]?.kind ?? "reflection") as StepKind;
      out.push({ guru: g as any, forKind, isPrimary: true });
      seen.add(g.id);
    }
  }

  // 2) One master per distinct step kind (in step order) — each rotated by seed
  //    so "any master, anytime" — different sessions surface different faces.
  for (const s of steps) {
    if (out.length >= MAX_COUNCIL) break;
    const m = getStepMaster(s.kind, effectiveSeed);
    if (m && !seen.has(m.id)) {
      out.push({ guru: m as any, forKind: s.kind });
      seen.add(m.id);
    }
  }

  return out.slice(0, MAX_COUNCIL);
}

export function getCouncilVerdicts(
  _steps: SessionStep[],
  council: CouncilMember[],
): string[] {
  return council.map((m) => m.verdict || VERDICT_BY_KIND[m.forKind] || "chose this for you.");
}

/**
 * Render the council the composer actually convened instead of inventing one
 * from step kinds. Returns null when no real council is available.
 */
export function councilFromMeta(
  meta: {
    council?: {
      head?: string | null;
      heart?: string | null;
      gut?: string | null;
      lead?: string | null;
      archetype?: string | null;
      reason?: string | null;
    } | null;
  } | null | undefined,
  steps: SessionStep[],
): CouncilMember[] | null {
  const council = meta?.council;
  if (!council) return null;
  const voices = [
    { voice: "head", line: council.head },
    { voice: "heart", line: council.heart },
    { voice: "gut", line: council.gut },
  ].filter((v) => typeof v.line === "string" && v.line.trim().length > 0) as Array<{ voice: string; line: string }>;
  if (!voices.length) return null;

  const keystoneIdx = pickKeystoneIndex(steps);
  const forKind = (steps[keystoneIdx]?.kind ?? steps[0]?.kind ?? "reflection") as StepKind;
  const out: CouncilMember[] = [];
  for (const v of voices) {
    // Map the voice to the master lineage that leads it, when resolvable.
    const pool =
      v.voice === "head"
        ? ["ramana-maharshi", "krishnamurti", "nisargadatta"]
        : v.voice === "heart"
          ? ["rumi", "ramakrishna", "hafiz"]
          : ["babaji", "patanjali", "buddha"];
    const guru = pool.map((id) => GURUS.find((g) => g.id === id)).find(Boolean) || GURUS[0];
    if (!guru) continue;
    out.push({ guru: guru as never, forKind, verdict: v.line.trim().slice(0, 90) });
  }
  return out.length ? out : null;
}

// M4 — "Why this order" — one-line engine-style explanation of the sequence.
export function explainOrder(steps: SessionStep[], keystoneIdx: number): string {
  if (!steps.length) return "the engine chose what your state can hold right now.";
  const first = steps[0]?.kind;
  const last = steps[steps.length - 1]?.kind;
  const keystoneKind = steps[keystoneIdx]?.kind;

  const opener: Record<string, string> = {
    breathwork: "you arrive in the body before the mind can argue",
    witness: "the noticer wakes before the noise",
    "wisdom-read": "a frame lands before the work begins",
    journal: "the loudest thought gets named first so it stops driving",
    reflection: "the system settles before it speaks",
    "micro-act": "one small act breaks the hesitation",
    practice: "the keystone goes first while you have the most clarity",
    "guide-chat": "the inconvenient sentence comes out before anything else",
    "temple-chat": "you sit with the master before doing anything else",
  };
  const closer: Record<string, string> = {
    reflection: "and the session closes with silence so the insight integrates",
    journal: "and you write the integration so the loop doesn't reopen tomorrow",
    "micro-act": "and one true act carries the work into the day",
    breathwork: "and the breath seals the work into the body",
    witness: "and you exit through the noticer, not the noise",
    "wisdom-read": "and a final line locks the frame",
    practice: "and the practice itself is the closure",
    "guide-chat": "and the last word stays with you, not the guide",
    "temple-chat": "and the master sends you out, not the door",
  };

  const open = opener[first] || "the first step matches where you are";
  const close = closer[last] || "the last step lets the work settle";
  const ks = keystoneKind && keystoneKind !== first && keystoneKind !== last
    ? ` — with the keystone placed mid-way so you're warm but not yet tired`
    : "";
  return `${open}${ks}, ${close}.`;
}
