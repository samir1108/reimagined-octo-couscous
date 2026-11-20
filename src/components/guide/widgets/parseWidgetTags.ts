// ─────────────────────────────────────────────────────────────────
// Parses [[widget:KIND key=value key="quoted value" ...]] tags out
// of an assistant message. Returns text segments interleaved with
// widget specs so we can render them inline.
// ─────────────────────────────────────────────────────────────────
import type { WidgetSpec, WidgetKind } from "./types";

export type Block =
  | { kind: "text"; text: string }
  | { kind: "widget"; spec: WidgetSpec; raw: string };

const KNOWN_KINDS: WidgetKind[] = [
  "witness_timer",
  "breath_orb",
  "self_inquiry",
  "journal",
  "micro_act",
  "reflection_card",
  "body_scan",
  "gratitude",
  "loving_kindness",
  "forgiveness",
  "movement",
  "walking",
  "yoga_asana",
  "sound_bath",
  "mantra",
  "visualization",
  "scripture",
  "affirmation",
  "contemplation",
  "noticing",
  "stretching",
  "tai_chi",
  "balance",
  "free_write",
  "plan",
];

const TAG_RE = /\[\[widget:([a-z_]+)([^\]]*)\]\]/gi;

function parseAttrs(rest: string): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  // matches  key="quoted value"  OR  key=token
  const re = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|([^\s\]]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    const k = m[1];
    const v = m[2] ?? m[3] ?? "";
    const num = Number(v);
    out[k] = !Number.isNaN(num) && v.trim() !== "" ? num : v;
  }
  return out;
}

function buildSpec(kind: string, attrs: Record<string, string | number>): WidgetSpec | null {
  if (!KNOWN_KINDS.includes(kind as WidgetKind)) return null;
  const base = { kind: kind as WidgetKind, title: attrs.title as string, prompt: attrs.prompt as string };
  switch (kind as WidgetKind) {
    case "witness_timer":
      return { ...base, kind: "witness_timer", duration: Number(attrs.duration) || 120, level: attrs.level as string };
    case "breath_orb":
      return { ...base, kind: "breath_orb", breaths: Number(attrs.breaths) || 5, pattern: (attrs.pattern as string) || "natural" };
    case "self_inquiry":
      return { ...base, kind: "self_inquiry", question: (attrs.question as string) || (attrs.prompt as string) || "Who is asking?" };
    case "journal":
      return { ...base, kind: "journal", minChars: Number(attrs.minChars) || 0 };
    case "micro_act":
      return { ...base, kind: "micro_act", act: (attrs.act as string) || (attrs.prompt as string) || "Take one mindful breath." };
    case "reflection_card":
      return { ...base, kind: "reflection_card", summary: attrs.summary as string };
    case "body_scan":
      return { ...base, kind: "body_scan", duration: Number(attrs.duration) || 300, pattern: (attrs.pattern as "top-down" | "bottom-up") || "top-down", regions: typeof attrs.regions === "string" ? (attrs.regions as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "gratitude":
      return { ...base, kind: "gratitude", count: Number(attrs.count) || 3, prompts: typeof attrs.prompts === "string" ? (attrs.prompts as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "loving_kindness":
      return { ...base, kind: "loving_kindness", duration: Number(attrs.duration) || 300, phrases: typeof attrs.phrases === "string" ? (attrs.phrases as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined, phases: typeof attrs.phases === "string" ? (attrs.phases as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "forgiveness":
      return { ...base, kind: "forgiveness", duration: Number(attrs.duration) || 240, prompts: typeof attrs.prompts === "string" ? (attrs.prompts as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "movement":
      return { ...base, kind: "movement", duration: Number(attrs.duration) || 120, repetitions: Number(attrs.repetitions) || 1, restBetween: Number(attrs.restBetween) || 0, instructions: typeof attrs.instructions === "string" ? (attrs.instructions as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "walking":
      return { ...base, kind: "walking", duration: Number(attrs.duration) || 300, pace: (attrs.pace as "very_slow" | "slow" | "normal") || "slow", phases: typeof attrs.phases === "string" ? (attrs.phases as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "yoga_asana":
      return { ...base, kind: "yoga_asana", duration: Number(attrs.duration) || 60, sides: (Number(attrs.sides) || 1) as 1 | 2, benefits: attrs.benefits as string, instructions: typeof attrs.instructions === "string" ? (attrs.instructions as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "sound_bath":
      return { ...base, kind: "sound_bath", duration: Number(attrs.duration) || 300, soundDescription: attrs.soundDescription as string, tone: attrs.tone as string };
    case "mantra":
      return { ...base, kind: "mantra", duration: Number(attrs.duration) || 180, mantra: (attrs.mantra as string) || (attrs.prompt as string) || "Om", repetitions: Number(attrs.repetitions) || 27 };
    case "visualization":
      return { ...base, kind: "visualization", duration: Number(attrs.duration) || 300, scenes: typeof attrs.scenes === "string" ? (attrs.scenes as string).split(",").map((s) => s.trim()).filter(Boolean) : [] };
    case "scripture":
      return { ...base, kind: "scripture", duration: Number(attrs.duration) || 300, segments: typeof attrs.segments === "string" ? (attrs.segments as string).split(",").map((s) => s.trim()).filter(Boolean) : [], source: attrs.source as string };
    case "affirmation":
      return { ...base, kind: "affirmation", duration: Number(attrs.duration) || 120, text: (attrs.text as string) || (attrs.prompt as string) || "I am enough", repetitions: Number(attrs.repetitions) || 1 };
    case "contemplation":
      return { ...base, kind: "contemplation", duration: Number(attrs.duration) || 300, question: (attrs.question as string) || (attrs.prompt as string) || "What is this?", periodicPrompts: typeof attrs.periodicPrompts === "string" ? (attrs.periodicPrompts as string).split(",").map((s) => s.trim()).filter(Boolean) : undefined };
    case "noticing":
      return { ...base, kind: "noticing", duration: Number(attrs.duration) || 180, target: (attrs.target as "thoughts" | "feelings" | "sensations" | "all") || "all", noticingPrompt: attrs.noticingPrompt as string };
    case "stretching":
      return { ...base, kind: "stretching", duration: Number(attrs.duration) || 30, rounds: Number(attrs.rounds) || 1, stretches: typeof attrs.stretches === "string" ? (attrs.stretches as string).split(",").map((s) => s.trim()).filter(Boolean).map((item) => { const [name, ...rest] = item.split(":"); return { name: name.trim(), instruction: rest.join(":").trim() }; }) : undefined };
    case "tai_chi":
      return { ...base, kind: "tai_chi", duration: Number(attrs.duration) || 300, phases: typeof attrs.phases === "string" ? (attrs.phases as string).split(",").map((s) => s.trim()).filter(Boolean) : [], instructions: typeof attrs.instructions === "string" ? (attrs.instructions as string).split(",").map((s) => s.trim()).filter(Boolean) : [] };
    case "balance":
      return { ...base, kind: "balance", duration: Number(attrs.duration) || 30, sides: (Number(attrs.sides) || 2) as 1 | 2, instructions: typeof attrs.instructions === "string" ? (attrs.instructions as string).split(",").map((s) => s.trim()).filter(Boolean) : [] };
    case "free_write":
      return { ...base, kind: "free_write", duration: Number(attrs.duration) || 300, prompt: (attrs.prompt as string) || "Write whatever is present." };
    case "plan":
      return { ...base, kind: "plan", duration: Number(attrs.duration) || 180, prompts: typeof attrs.prompts === "string" ? (attrs.prompts as string).split(",").map((s) => s.trim()).filter(Boolean) : [], sections: Number(attrs.sections) || 3 };
  }
}

/** Split message text into interleaved text + widget blocks. */
export function parseWidgetTags(content: string): Block[] {
  if (!content || !content.includes("[[widget:")) {
    return [{ kind: "text", text: content }];
  }
  const blocks: Block[] = [];
  let lastIdx = 0;
  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(content))) {
    const before = content.slice(lastIdx, m.index);
    if (before) blocks.push({ kind: "text", text: before });
    const spec = buildSpec(m[1].toLowerCase(), parseAttrs(m[2] || ""));
    if (spec) blocks.push({ kind: "widget", spec, raw: m[0] });
    else blocks.push({ kind: "text", text: m[0] }); // unknown — leave as-is
    lastIdx = m.index + m[0].length;
  }
  const tail = content.slice(lastIdx);
  if (tail) blocks.push({ kind: "text", text: tail });
  return blocks;
}

/** True if this assistant content already contains a finished widget tag. */
export function hasCompleteWidgetTag(content: string): boolean {
  return /\[\[widget:[a-z_]+[^\]]*\]\]/i.test(content);
}
