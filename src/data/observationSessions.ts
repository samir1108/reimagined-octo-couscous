/**
 * Observation Sessions — the content spine of the Observation practice.
 *
 * 100 authored sessions, gated by the 7-level ladder in `observationLadder.ts`.
 * The runtime supplies the shape (arrive → land → anchor → exploration →
 * silence → integrate → carry); a seed supplies what makes this sitting
 * different from the last one.
 *
 *   L1 body      14    L5 pattern  14
 *   L2 breath    14    L6 watcher  14
 *   L3 emotion   14    L7 choiceless 16
 *   L4 thought   14    ───────────────── 100
 */
import { OBSERVATION_LADDER } from "./observationLadder";
import { OBS_SEEDS_L1_L3 } from "./observationSessions.part1";
import { OBS_SEEDS_L4_L5 } from "./observationSessions.part2";
import { OBS_SEEDS_L6_L7 } from "./observationSessions.part3";

export type ObsLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ObsLens =
  | "body"
  | "breath"
  | "sensation"
  | "sound"
  | "sight"
  | "thought"
  | "emotion"
  | "pattern"
  | "watcher";

export type ObsMethod =
  | "labeling"
  | "counting"
  | "54321"
  | "noting"
  | "neti-neti"
  | "open"
  | "choiceless"
  | "gazing"
  | "scan"
  | "rest";

export type ObsSlot = "morning" | "midday" | "evening" | "night" | "any";

export type ObsVisual = "orb-pulse" | "orb-still" | "candle" | "horizon";

/**
 * Session forms — there is deliberately NOT one universal skeleton.
 *
 * Each seed is played through a form that fits its level and method: a body
 * sweep is not a vigil, and a koan is not a ladder. Families keep their own
 * native scripts elsewhere in `lib/practice/script.ts`; forms only exist for
 * observation, where 100 sittings need more than one shape.
 */
export type ObsForm =
  | "sweep"
  | "ladder"
  | "noting"
  | "spiral"
  | "threshold"
  | "field"
  | "vigil"
  | "inquiry"
  | "gaze"
  | "return";

export type ObsStage =
  | "arrival"
  | "land"
  | "anchor"
  | "question"
  | "gaze"
  | "explore"
  | "silence"
  | "rest"
  | "integrate"
  | "journal"
  | "carry";

export interface ObsFormDef {
  id: ObsForm;
  label: string;
  oneLine: string;
  flow: ObsStage[];
}

export const OBS_FORMS: Record<ObsForm, ObsFormDef> = {
  sweep: {
    id: "sweep",
    label: "Sweep",
    oneLine: "Fast contact with what is here, then out. No build-up.",
    flow: ["arrival", "explore", "silence", "carry"],
  },
  ladder: {
    id: "ladder",
    label: "Ladder",
    oneLine: "Land, anchor, climb one beat at a time, integrate.",
    flow: ["arrival", "land", "anchor", "explore", "silence", "integrate", "journal", "carry"],
  },
  noting: {
    id: "noting",
    label: "Noting",
    oneLine: "Sparse labels, almost no commentary. Let the naming do the work.",
    flow: ["arrival", "anchor", "explore", "silence", "journal", "carry"],
  },
  spiral: {
    id: "spiral",
    label: "Spiral",
    oneLine: "The same object twice — first to find it, then to stay with it.",
    flow: ["arrival", "anchor", "explore", "silence", "explore", "integrate", "carry"],
  },
  threshold: {
    id: "threshold",
    label: "Threshold",
    oneLine: "A question at the door, then the crossing, then nothing to add.",
    flow: ["arrival", "land", "question", "explore", "silence", "integrate", "journal"],
  },
  field: {
    id: "field",
    label: "Field",
    oneLine: "Open awareness with minimal instruction. Nothing to complete.",
    flow: ["arrival", "explore", "rest", "integrate", "carry"],
  },
  vigil: {
    id: "vigil",
    label: "Vigil",
    oneLine: "One instruction, then a long silence. No journal, no closing line.",
    flow: ["arrival", "land", "explore", "silence", "rest"],
  },
  inquiry: {
    id: "inquiry",
    label: "Inquiry",
    oneLine: "One question held the whole way. Answers are not the point.",
    flow: ["question", "anchor", "explore", "silence", "journal"],
  },
  gaze: {
    id: "gaze",
    label: "Gaze",
    oneLine: "Eyes open, one object, no naming. The session is the looking.",
    flow: ["arrival", "gaze", "silence", "integrate", "carry"],
  },
  return: {
    id: "return",
    label: "Return",
    oneLine: "Leave the object, come back, leave again. Returning is the practice.",
    flow: ["land", "explore", "silence", "explore", "rest"],
  },
};

/** Method → native form. Seeds can be overridden by id below. */
const FORM_BY_METHOD: Record<ObsMethod, ObsForm> = {
  scan: "sweep",
  "54321": "sweep",
  counting: "ladder",
  labeling: "noting",
  noting: "spiral",
  "neti-neti": "inquiry",
  open: "field",
  choiceless: "vigil",
  gazing: "gaze",
  rest: "vigil",
};

/**
 * Hand-picked overrides so neighbouring seeds never share a shape just
 * because they share a method.
 */
const FORM_OVERRIDES: Record<string, ObsForm> = {
  "obs-l1-05": "sweep",
  "obs-l1-09": "noting",
  "obs-l1-13": "field",
  "obs-l2-05": "return",
  "obs-l2-12": "spiral",
  "obs-l3-06": "field",
  "obs-l3-12": "noting",
  "obs-l4-04": "inquiry",
  "obs-l4-10": "field",
  "obs-l4-13": "spiral",
  "obs-l5-04": "threshold",
  "obs-l5-13": "spiral",
  "obs-l6-01": "threshold",
  "obs-l6-08": "inquiry",
  "obs-l6-10": "vigil",
  "obs-l7-04": "gaze",
  "obs-l7-08": "vigil",
  "obs-l7-11": "gaze",
  "obs-l7-16": "field",
};

export function resolveObsForm(seed: ObsSeed): ObsForm {
  const override = FORM_OVERRIDES[seed.id];
  if (override) return override;
  if (seed.lens === "sight") return "gaze";
  return FORM_BY_METHOD[seed.method] ?? "ladder";
}

export function obsFormDef(seed: ObsSeed): ObsFormDef {
  return OBS_FORMS[resolveObsForm(seed)];
}

export interface ObsBeat {
  title: string;
  body: string;
}

export interface ObsSeed {
  /** Stable id, e.g. obs-l4-03 — used for no-repeat windows and analytics. */
  id: string;
  level: ObsLevel;
  lens: ObsLens;
  method: ObsMethod;
  slot: ObsSlot;
  /** Supported durations in minutes, ascending. */
  minutes: number[];
  visual: ObsVisual;
  /** tts guru id used for narration. */
  voice: string;
  /** Optional link to an authored sensorial manifest key. */
  source?: string;
  exploration: ObsBeat[];
  integration: string;
  journalPrompt: string;
  carryTask: string;
}

export const OBS_SEEDS: ObsSeed[] = [
  ...OBS_SEEDS_L1_L3,
  ...OBS_SEEDS_L4_L5,
  ...OBS_SEEDS_L6_L7,
];

export const OBS_TOTAL = OBS_SEEDS.length;

export const OBS_LENS_LABEL: Record<ObsLens, string> = {
  body: "Body",
  breath: "Breath",
  sensation: "Sensation",
  sound: "Sound",
  sight: "Sight",
  thought: "Thought",
  emotion: "Emotion",
  pattern: "Pattern",
  watcher: "Watcher",
};

export interface ObsLevelMeta {
  level: ObsLevel;
  title: string;
  sanskrit?: string;
  oneLine: string;
  signOfReadiness: string;
  total: number;
}

export const OBS_LEVEL_META: ObsLevelMeta[] = OBSERVATION_LADDER.map((lvl) => ({
  level: lvl.level as ObsLevel,
  title: lvl.title,
  sanskrit: lvl.sanskrit,
  oneLine: lvl.oneLine,
  signOfReadiness: lvl.signOfReadiness,
  total: OBS_SEEDS.filter((s) => s.level === lvl.level).length,
}));

const SEED_BY_ID = new Map(OBS_SEEDS.map((s) => [s.id, s]));

export function getObsSeedById(id: string | null | undefined): ObsSeed | undefined {
  if (!id) return undefined;
  return SEED_BY_ID.get(id);
}

export function obsSeedsForLevel(level: number): ObsSeed[] {
  return OBS_SEEDS.filter((s) => s.level === level);
}

export function obsSeedsForLens(lens: ObsLens): ObsSeed[] {
  return OBS_SEEDS.filter((s) => s.lens === lens);
}

/** 1-based position of a seed in the 100-session ladder. */
export function obsSeedIndex(id: string): number {
  return OBS_SEEDS.findIndex((s) => s.id === id) + 1;
}

/**
 * Parse a seed id out of free text (practice title / instruction) so a
 * scheduled pack can pin a specific session: "obs-l3-07".
 */
export function obsSeedIdFromText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const match = text.match(/obs-l[1-7]-\d{2}/);
  return match ? match[0] : undefined;
}

/** A seed's own title is its first exploration beat — short and human. */
export function obsSeedTitle(seed: ObsSeed): string {
  return seed.exploration[0]?.title ?? `Observation ${seed.level}`;
}
