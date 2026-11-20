// Turns raw composition metadata into the human-readable "frame" of a sitting:
// archetype, leading voice, starved dimension, chakra, loops and stage.
// Pure presentation helpers — safe to delete without touching the engine.

import type { CouncilVoice, SessionPlanMeta, SessionStep, StepKind } from "@/lib/session-shell/types";

export const VOICE_META: Record<CouncilVoice, { label: string; line: string }> = {
  head: { label: "Head voice", line: "the thought-pattern is leading this sitting" },
  heart: { label: "Heart voice", line: "the longing is leading this sitting" },
  gut: { label: "Gut voice", line: "the body and action are leading this sitting" },
};

const ARCHETYPE_FRAME: Record<string, { label: string; shape: string; line: string }> = {
  opening: { label: "Opening", shape: "Breath → Frame → Intention", line: "wake the system, then set one true intention" },
  inquiry: { label: "Inquiry", shape: "Settle → Question → Write", line: "sit with the question until it answers itself" },
  teaching: { label: "Teaching", shape: "Frame → Reflect → Micro-practice", line: "receive the lens before doing the work" },
  practice_deep: { label: "Deep Practice", shape: "Settle → Core → Deepen → Seal", line: "one practice, taken further than yesterday" },
  integration: { label: "Integration", shape: "Arrive → Review → Release", line: "process the day so it doesn't follow you to bed" },
  release: { label: "Release", shape: "Body scan → Breath → Silence", line: "let the day leave the body" },
  micro: { label: "Micro Pause", shape: "One breath · One witness", line: "a 60–180s reset inside the day" },

  settling: { label: "Settling", shape: "Body → Breath → Soft close", line: "the body lands before anything is asked of it" },
  "re-entry": { label: "Re-entry", shape: "Welcome → Ground → One line", line: "return without guilt, return gently" },
  "shadow mirror": { label: "Shadow Mirror", shape: "Name → Meet → Write", line: "what was disowned is met with eyes open" },
  confrontation: { label: "Confrontation", shape: "Name → Hold → Write", line: "the avoided sentence is spoken first" },
  "stuck-loop break": { label: "Stuck-Loop Break", shape: "See → Interrupt → Act", line: "one small act bends the loop" },
  "witness deepening": { label: "Witness Deepening", shape: "Sit → Watch → Stay", line: "the noticer is stretched past its comfort" },
  "inquiry spiral": { label: "Inquiry Spiral", shape: "Ask → Wait → Write", line: "one piercing question, no escape hatch" },
  devotional: { label: "Devotional", shape: "Sit → Receive → Bow", line: "receive from the lineage instead of efforting" },
  "karmic action": { label: "Karmic Action", shape: "See → Act → Seal", line: "insight finishes only when the body acts" },
  reconciliation: { label: "Reconciliation", shape: "Name → Soften → Speak", line: "a relationship is repaired from the inside first" },
  "lineage initiation": { label: "Lineage Initiation", shape: "Honour → Receive → Mark", line: "a threshold is marked, not skipped" },
  celebration: { label: "Celebration", shape: "Notice → Honour → Carry", line: "what grew is allowed to be seen" },
  dissolution: { label: "Dissolution", shape: "Release → Empty → Rest", line: "nothing is added tonight, something is put down" },
  "dark night hold": { label: "Dark Night Hold", shape: "Breathe → Witness → Stay", line: "no progress today — only being held" },
};

export function archetypeMeta(id?: string | null): { label: string; shape: string; line: string } | null {
  if (!id) return null;
  const spaced = id.trim().replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  const key = spaced.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
  return (
    ARCHETYPE_FRAME[key] ||
    ARCHETYPE_FRAME[key.replace(/ /g, "_")] ||
    ARCHETYPE_FRAME[key.replace(/ /g, "-")] ||
    { label: spaced, shape: "", line: "" }
  );
}

/**
 * Turn a raw plan intent into a title a person can read.
 * `KarmicActionSession` → "Karmic Action", `settling session` → "Settling".
 * Natural-language intents (anything with spaces) are left untouched.
 */
export function humanIntent(intent?: string | null): string {
  if (!intent) return "Today's sitting";
  const trimmed = intent.trim();
  const base = trimmed.replace(/\s*session$/i, "");
  if (/\s/.test(base)) return trimmed;
  const spaced = base.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ");
  return archetypeMeta(spaced)?.label || spaced;
}

const DIMENSION_LABEL: Record<string, string> = {
  thought: "Thought",
  emotion: "Emotion",
  body: "Body",
  awareness: "Awareness",
  action: "Action",
  connection: "Connection",
  spirit: "Spirit",
};

export function dimensionLabel(id?: string | null): string | null {
  if (!id) return null;
  return DIMENSION_LABEL[id.toLowerCase()] || id;
}

const CHAKRA_LABEL: Record<string, string> = {
  root: "Root",
  sacral: "Sacral",
  solar: "Solar plexus",
  heart: "Heart",
  throat: "Throat",
  "third-eye": "Third eye",
  third_eye: "Third eye",
  crown: "Crown",
};

export function chakraLabel(id?: string | null): string | null {
  if (!id) return null;
  return CHAKRA_LABEL[id.toLowerCase()] || id;
}

const HARDWARE_LABEL: Record<string, string> = {
  hrv: "heart rate",
  voice: "voice tone",
  face: "expression scan",
  env: "environment",
};

export function hardwareLabel(id: string): string {
  return HARDWARE_LABEL[id] || id;
}

/** Humanize a composer signal ref: `loop:VAL003` → "Validation loop". */
export function signalLabel(ref: string | undefined, meta?: SessionPlanMeta | null): string | null {
  if (!ref) return null;
  const [head, ...rest] = ref.split(":");
  const value = rest.join(":");
  if (!value) return null;
  if (head === "loop") {
    const named = meta?.namedLoops?.find((l) => l.id.toLowerCase() === value.toLowerCase());
    return `${named?.name || value} loop`;
  }
  if (head === "dim" || head === "dimension") return `${dimensionLabel(value) || value} dimension`;
  if (head === "chakra") return `${chakraLabel(value) || value} chakra`;
  if (head === "practice") {
    const [family, level] = value.split(":");
    return level ? `${family} · L${level.replace(/^L/i, "")}` : family;
  }
  if (head === "memory") return `last ${value} of memory`;
  if (head === "gate") return `${value} gate`;
  if (head === "closure") return "closure";
  return null;
}

/** Replace raw loop ids inside a composer reason with their human names. */
export function humanizeWhy(reason: string | undefined, meta?: SessionPlanMeta | null): string | null {
  if (!reason) return null;
  let out = reason;
  for (const loop of meta?.namedLoops || []) {
    if (!loop?.id) continue;
    out = out.replace(new RegExp(`\\b${loop.id}\\b`, "gi"), `${loop.name} loop`);
  }
  return out.replace(/\s+—\s+/g, " — ").trim();
}

const STEP_FRAME: Record<StepKind, { label: string; what: string }> = {
  breathwork: { label: "Arrive", what: "Slower exhale than inhale. Nothing to fix yet." },
  witness: { label: "Observe", what: "Watch what arises. Do not name it, do not follow it." },
  journal: { label: "Name", what: "One honest line beats a page of performance." },
  "micro-act": { label: "Act", what: "One small true act, done now, without commentary." },
  reflection: { label: "Seal", what: "One sentence to close — otherwise the insight leaks." },
  practice: { label: "Practice", what: "Stay one breath longer than feels comfortable." },
  "wisdom-read": { label: "Receive", what: "Read slowly. Stop at the line that catches you." },
  "guide-chat": { label: "Speak", what: "Say the inconvenient sentence first." },
  "temple-chat": { label: "Ask", what: "Sit with the master. Ask one real question." },
};

export function stepFrame(kind: StepKind): { label: string; what: string } {
  return STEP_FRAME[kind] || STEP_FRAME.reflection;
}

/** One-line "what happens" for a step: prompt if real, else the kind's grammar. */
export function stepExpectation(step: SessionStep): string {
  const prompt = (step.prompt || "").replace(/\s+/g, " ").trim();
  if (prompt.length >= 12) return prompt.length > 220 ? `${prompt.slice(0, 217)}…` : prompt;
  return stepFrame(step.kind).what;
}

export function loopChips(meta?: SessionPlanMeta | null): Array<{ id: string; name: string }> {
  if (!meta) return [];
  const active = [meta.primaryLoopId, ...(meta.namedLoops || []).map((l) => l.id)]
    .filter(Boolean) as string[];
  const unique = Array.from(new Set(active)).slice(0, 3);
  return unique.map((id) => ({
    id,
    name: meta.namedLoops?.find((l) => l.id === id)?.name || id,
  }));
}
