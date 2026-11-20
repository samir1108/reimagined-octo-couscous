/**
 * Declarative step-widget framework.
 *
 * A widget is a configured, reusable practice that a session step can render:
 * the step carries composition data (why, duration, copy) and the widget id
 * selects both the engine and the defaults. Adding a practice means adding a
 * catalog row — never a new screen.
 */

export type WidgetEngine =
  | "timer"
  | "breath"
  | "breath_hold"
  | "observation"
  | "body_map"
  | "inquiry"
  | "selection"
  | "rating"
  | "jap"
  | "audio"
  | "visualization"
  | "experiment"
  | "reflection"
  | "emotion"
  | "intention"
  | "writing"
  | "checklist"
  | "guided"
  | "ambient";

export type WidgetFamily =
  | "stillness"
  | "breath"
  | "body"
  | "heart"
  | "mind"
  | "shadow"
  | "devotion"
  | "sound"
  | "movement"
  | "energy"
  | "nature"
  | "focus"
  | "sleep"
  | "integration"
  | "relational"
  | "challenge";

export interface WidgetConfig {
  [key: string]: unknown;
}

export interface StepWidgetDefinition {
  /** Stable id used by step params (`widgetId`). */
  id: string;
  label: string;
  family: WidgetFamily;
  engine: WidgetEngine;
  /** One line the guide would say when offering this practice. */
  description: string;
  /** Default length. A step may override with `params.durationSeconds`. */
  durationSeconds: number;
  /** 1 = gentle, 5 = demanding. Surfaced as dots in the UI. */
  intensity: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  config: WidgetConfig;
  /** Optional accessibility or safety note shown under the practice. */
  note?: string;
}

export interface StepWidgetResult {
  widgetId: string;
  engine: WidgetEngine;
  data: Record<string, unknown>;
  summary: string;
}

export interface FamilyMeta {
  label: string;
  blurb: string;
  /** Tailwind gradient stops for the widget aura. */
  tint: string;
  /** Tailwind background for the family dot. */
  accent: string;
}

export const FAMILY_META: Record<WidgetFamily, FamilyMeta> = {
  stillness: {
    label: "Stillness",
    blurb: "Sit, watch, and let the noise settle on its own.",
    tint: "from-slate-400/25 via-indigo-300/10 to-transparent",
    accent: "bg-slate-300/80",
  },
  breath: {
    label: "Breath",
    blurb: "Change the rhythm, change the state.",
    tint: "from-sky-400/25 via-cyan-300/10 to-transparent",
    accent: "bg-sky-300/80",
  },
  body: {
    label: "Body",
    blurb: "Come down from the head and into sensation.",
    tint: "from-teal-400/25 via-emerald-300/10 to-transparent",
    accent: "bg-teal-300/80",
  },
  heart: {
    label: "Heart",
    blurb: "Warmth, gratitude, and the courage to forgive.",
    tint: "from-rose-400/25 via-pink-300/10 to-transparent",
    accent: "bg-rose-300/80",
  },
  mind: {
    label: "Mind",
    blurb: "Name the loop, question the belief, write the truth.",
    tint: "from-violet-400/25 via-indigo-300/10 to-transparent",
    accent: "bg-violet-300/80",
  },
  shadow: {
    label: "Shadow",
    blurb: "Meet what you have been avoiding — gently, on purpose.",
    tint: "from-zinc-500/25 via-slate-400/10 to-transparent",
    accent: "bg-zinc-300/80",
  },
  devotion: {
    label: "Devotion",
    blurb: "Repetition, surrender, and remembered words.",
    tint: "from-amber-400/25 via-yellow-300/10 to-transparent",
    accent: "bg-amber-300/80",
  },
  sound: {
    label: "Sound",
    blurb: "Let listening do the work.",
    tint: "from-fuchsia-400/25 via-purple-300/10 to-transparent",
    accent: "bg-fuchsia-300/80",
  },
  movement: {
    label: "Movement",
    blurb: "The body finishes what the mind keeps circling.",
    tint: "from-orange-400/25 via-amber-300/10 to-transparent",
    accent: "bg-orange-300/80",
  },
  energy: {
    label: "Energy",
    blurb: "Wake, circulate, and settle the subtle body.",
    tint: "from-yellow-400/25 via-orange-300/10 to-transparent",
    accent: "bg-yellow-300/80",
  },
  nature: {
    label: "Nature",
    blurb: "Borrow steadiness from something older than you.",
    tint: "from-green-400/25 via-emerald-300/10 to-transparent",
    accent: "bg-green-300/80",
  },
  focus: {
    label: "Focus",
    blurb: "Train the attention like a muscle.",
    tint: "from-blue-400/25 via-sky-300/10 to-transparent",
    accent: "bg-blue-300/80",
  },
  sleep: {
    label: "Sleep",
    blurb: "Release the day and let the body go first.",
    tint: "from-indigo-500/25 via-violet-400/10 to-transparent",
    accent: "bg-indigo-300/80",
  },
  integration: {
    label: "Integration",
    blurb: "Seal the insight so it survives the day.",
    tint: "from-lime-400/25 via-emerald-300/10 to-transparent",
    accent: "bg-lime-300/80",
  },
  relational: {
    label: "Relational",
    blurb: "Practice the thing you keep postponing with people.",
    tint: "from-pink-400/25 via-rose-300/10 to-transparent",
    accent: "bg-pink-300/80",
  },
  challenge: {
    label: "Challenge",
    blurb: "Voluntary difficulty, held with care.",
    tint: "from-red-400/25 via-orange-300/10 to-transparent",
    accent: "bg-red-300/80",
  },
};
