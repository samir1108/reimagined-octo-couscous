/**
 * INGREDIENTS — Layer 2 of the Composer Framework
 * ────────────────────────────────────────────────
 * Every fillable unit (practice, knowledge, reflection, micro-action) is an
 * `Ingredient` with uniform metadata. The composer scores ingredients against
 * the user's context and picks one per archetype slot.
 *
 * We DO NOT duplicate the existing practice modeRegistry — instead, we wrap
 * each mode as an ingredient. Knowledge / reflection / micro-action libraries
 * are seeded here and can be expanded (or moved to DB later).
 */
import type { Practice } from "@/lib/sutra/practices";
import { MODE_REGISTRY } from "@/lib/sutra/modeRegistry";

export type IngredientKind = "practice" | "knowledge" | "reflection" | "micro_action";
export type Depth = "light" | "medium" | "deep";
export type Energy = "low" | "medium" | "high";
export type Gate = "morning" | "midday" | "evening" | "night";
/** The four yoga paths — the user's affinity steers the session. */
export type YogaPath = "raja" | "jnana" | "karma" | "bhakti";
/** The four consciousness dimensions measured by the engine. */
export type ConsciousnessDimension = "body" | "emotion" | "thought" | "awareness";

export interface Ingredient {
  id: string;
  kind: IngredientKind;
  label: string;
  /** Short summary shown in "What to expect" cards. */
  summary?: string;
  /** Estimated minutes at default sizing. Composer rescales. */
  defaultMinutes: number;
  /** For practice ingredients — which of the 12 practices. */
  practice?: Practice;
  /** Loop IDs this ingredient targets (e.g. VAL001, OVT003). */
  loopTargets?: string[];
  /** Band window this ingredient fits, inclusive. */
  bandRange?: [number, number];
  /** Energy fit. */
  energyFit?: Energy[];
  /** Gate fit. */
  gateFit?: Gate[];
  depth: Depth;
  /** Optional route to launch (practice ingredients). */
  route?: string;
  /** Optional body text for knowledge/reflection ingredients. */
  body?: string;
  /** Optional icon emoji for UI. */
  icon?: string;
  /** Yoga paths this ingredient serves — scored against the user's affinity. */
  paths?: YogaPath[];
  /** Consciousness dimensions this ingredient trains — the weakest band is targeted. */
  dimensions?: ConsciousnessDimension[];
  /** Earliest journey day this ingredient is ready for. */
  minJourneyDay?: number;
  /** Chitta vritti (mind modes) this ingredient settles, e.g. "restless". */
  settlesChitta?: string[];
}

// ─────────────────────────────────────────────────────────────────────
// PRACTICE INGREDIENTS — wrap existing modeRegistry
// ─────────────────────────────────────────────────────────────────────
export const PRACTICE_INGREDIENTS: Ingredient[] = MODE_REGISTRY.map((m) => ({
  id: `practice:${m.id}`,
  kind: "practice" as const,
  label: m.label,
  summary: m.intro,
  defaultMinutes: Math.max(1, Math.round(m.defaultDurationSec / 60)),
  practice: m.practice,
  depth: m.defaultDurationSec >= 600 ? "deep" : m.defaultDurationSec >= 240 ? "medium" : "light",
  route: m.route({}),
  icon: "🧘",
}));

// ─────────────────────────────────────────────────────────────────────
// KNOWLEDGE INGREDIENTS — teaching seeds (expandable, can move to DB)
// ─────────────────────────────────────────────────────────────────────
export const KNOWLEDGE_INGREDIENTS: Ingredient[] = [
  {
    id: "k:rumi-guesthouse",
    kind: "knowledge",
    label: "The Guest House",
    summary: "Rumi — every emotion is a guest.",
    defaultMinutes: 2,
    bandRange: [0, 10],
    energyFit: ["low", "medium", "high"],
    gateFit: ["morning", "midday", "evening", "night"],
    depth: "light",
    body: "This being human is a guest house. Every morning a new arrival… welcome and entertain them all.",
    icon: "📖",
  },
  {
    id: "k:witness-vs-thinker",
    kind: "knowledge",
    label: "Witness vs Thinker",
    summary: "You are not your thoughts — you are the one who notices them.",
    defaultMinutes: 3,
    loopTargets: ["OVT001", "OVT003"],
    bandRange: [0, 5],
    depth: "medium",
    icon: "👁",
  },
  {
    id: "k:breath-as-anchor",
    kind: "knowledge",
    label: "Breath as Anchor",
    summary: "Why every tradition returns to breath.",
    defaultMinutes: 2,
    bandRange: [0, 10],
    gateFit: ["morning", "midday"],
    depth: "light",
    icon: "🌬",
  },
  {
    id: "k:nothing-to-fix",
    kind: "knowledge",
    label: "Nothing to Fix",
    summary: "What changes when you stop trying to fix yourself.",
    defaultMinutes: 3,
    bandRange: [2, 10],
    gateFit: ["evening", "night"],
    depth: "medium",
    icon: "🌙",
  },
];

// ─────────────────────────────────────────────────────────────────────
// REFLECTION INGREDIENTS — prompts (gate + depth tagged)
// ─────────────────────────────────────────────────────────────────────
export const REFLECTION_INGREDIENTS: Ingredient[] = [
  { id: "r:morning-intent", kind: "reflection", label: "One Word Intention", defaultMinutes: 2,
    gateFit: ["morning"], depth: "light", body: "One word for today. Just one.", icon: "✨" },
  { id: "r:noticed-shift", kind: "reflection", label: "What Shifted?", defaultMinutes: 3,
    gateFit: ["midday", "evening"], depth: "medium", body: "What have you noticed since this morning?", icon: "💭" },
  { id: "r:pattern-seen", kind: "reflection", label: "Pattern of the Day", defaultMinutes: 4,
    gateFit: ["evening"], depth: "medium", body: "What pattern did you see today? No judgment — just notice.", icon: "🔁" },
  { id: "r:let-go", kind: "reflection", label: "Let It Go", defaultMinutes: 3,
    gateFit: ["night"], depth: "light", body: "Let everything go. What remains?", icon: "🌌" },
  { id: "r:who-feels", kind: "reflection", label: "Who Is Feeling This?", defaultMinutes: 4,
    bandRange: [2, 10], depth: "deep", body: "When emotion arose today — who was feeling it?", icon: "🔍" },
];

// ─────────────────────────────────────────────────────────────────────
// MICRO-ACTION INGREDIENTS — quotes, mantras, presence cards, off-app
// ─────────────────────────────────────────────────────────────────────
export const MICRO_ACTION_INGREDIENTS: Ingredient[] = [
  { id: "m:inspiring-quote", kind: "micro_action", label: "Inspiring Quote", defaultMinutes: 2,
    depth: "light", icon: "📜", body: "A line to carry with you." },
  { id: "m:presence-card", kind: "micro_action", label: "Presence Card", defaultMinutes: 1,
    depth: "light", icon: "🪔", body: "Right now, this moment is complete." },
  { id: "m:three-breaths", kind: "micro_action", label: "Three Conscious Breaths", defaultMinutes: 1,
    depth: "light", icon: "🌬", body: "Before your next task — three slow breaths." },
  { id: "m:off-app-notice", kind: "micro_action", label: "Off-App Notice", defaultMinutes: 1,
    gateFit: ["morning"], depth: "light", icon: "🌅", body: "Notice 3 moments today where you catch yourself on autopilot." },
  { id: "m:gratitude-one", kind: "micro_action", label: "One Gratitude", defaultMinutes: 1,
    depth: "light", icon: "🙏", body: "Thank one person today — genuinely, for one specific thing." },
];

export const ALL_INGREDIENTS: Ingredient[] = [
  ...PRACTICE_INGREDIENTS,
  ...KNOWLEDGE_INGREDIENTS,
  ...REFLECTION_INGREDIENTS,
  ...MICRO_ACTION_INGREDIENTS,
];

export function getIngredientById(id: string): Ingredient | undefined {
  return ALL_INGREDIENTS.find((i) => i.id === id);
}
