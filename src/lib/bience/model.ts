/**
 * Bience - the ambient world model.
 *
 * Pure data + math. No Web Audio, no React, no DOM. The engine, the visual
 * stage and the studio UI all read from here so a world sounds and looks the
 * same everywhere it appears.
 */

export type HSLTuple = readonly [number, number, number];

export type LayerId =
  | "rain"
  | "storm"
  | "wind"
  | "fire"
  | "stream"
  | "ocean"
  | "birds"
  | "crickets"
  | "crowd"
  | "tanpura"
  | "bowls"
  | "choir"
  | "sub"
  | "shimmer";

export type LayerGroup = "water" | "air" | "fire" | "life" | "sacred" | "space";

export interface LayerSpec {
  id: LayerId;
  label: string;
  hint: string;
  group: LayerGroup;
  /** Accent colour used by the dial + stage particles. */
  hue: number;
  /** Sensible trim so a level of 1 never dominates the mix. */
  trim: number;
  /** Particle archetype the stage draws when this layer is audible. */
  texture: "streak" | "ember" | "drift" | "ripple" | "fly" | "spark" | "grain";
}

export const LAYERS: Record<LayerId, LayerSpec> = {
  rain: {
    id: "rain",
    label: "Rain",
    hint: "Skin of water on stone",
    group: "water",
    hue: 199,
    trim: 0.5,
    texture: "streak",
  },
  storm: {
    id: "storm",
    label: "Thunder",
    hint: "Far horizon, slow rolls",
    group: "water",
    hue: 216,
    trim: 0.62,
    texture: "grain",
  },
  wind: {
    id: "wind",
    label: "Wind",
    hint: "A high pass through pine",
    group: "air",
    hue: 176,
    trim: 0.4,
    texture: "drift",
  },
  fire: {
    id: "fire",
    label: "Hearth",
    hint: "Dry crackle, low heat",
    group: "fire",
    hue: 26,
    trim: 0.48,
    texture: "ember",
  },
  stream: {
    id: "stream",
    label: "Stream",
    hint: "Water over pebbles",
    group: "water",
    hue: 188,
    trim: 0.42,
    texture: "ripple",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    hint: "Slow breathing swell",
    group: "water",
    hue: 205,
    trim: 0.55,
    texture: "ripple",
  },
  birds: {
    id: "birds",
    label: "Birds",
    hint: "First light, waking",
    group: "life",
    hue: 52,
    trim: 0.4,
    texture: "fly",
  },
  crickets: {
    id: "crickets",
    label: "Crickets",
    hint: "Night field pulse",
    group: "life",
    hue: 108,
    trim: 0.34,
    texture: "spark",
  },
  crowd: {
    id: "crowd",
    label: "Ghat murmur",
    hint: "Distant voices, no words",
    group: "life",
    hue: 44,
    trim: 0.3,
    texture: "grain",
  },
  tanpura: {
    id: "tanpura",
    label: "Tanpura",
    hint: "Sa - Pa - Sa - Sa",
    group: "sacred",
    hue: 41,
    trim: 0.55,
    texture: "spark",
  },
  bowls: {
    id: "bowls",
    label: "Singing bowls",
    hint: "Inharmonic, endless",
    group: "sacred",
    hue: 36,
    trim: 0.5,
    texture: "spark",
  },
  choir: {
    id: "choir",
    label: "Shruti choir",
    hint: "One long vowel",
    group: "sacred",
    hue: 288,
    trim: 0.36,
    texture: "drift",
  },
  sub: {
    id: "sub",
    label: "Deep sub",
    hint: "The room below the room",
    group: "space",
    hue: 252,
    trim: 0.6,
    texture: "grain",
  },
  shimmer: {
    id: "shimmer",
    label: "Shimmer",
    hint: "Thin glass harmonics",
    group: "space",
    hue: 172,
    trim: 0.3,
    texture: "spark",
  },
};

export const LAYER_IDS = Object.keys(LAYERS) as LayerId[];

export const LAYER_GROUPS: { id: LayerGroup; label: string }[] = [
  { id: "water", label: "Water" },
  { id: "air", label: "Air" },
  { id: "fire", label: "Fire" },
  { id: "life", label: "Life" },
  { id: "sacred", label: "Sacred" },
  { id: "space", label: "Space" },
];

export type WorldId =
  | "monsoon-terrace"
  | "first-light"
  | "hearth"
  | "nilgiri-night"
  | "vipassana-hall"
  | "cosmic-void"
  | "backwaters"
  | "kashi-dawn";

export type WorldMotif =
  | "monsoon"
  | "sunrise"
  | "hearth"
  | "fireflies"
  | "mandala"
  | "cosmos"
  | "water"
  | "bells";

export interface BienceWorld {
  id: WorldId;
  name: string;
  subtitle: string;
  note: string;
  root: number;
  /** Sky palette, darkest first. */
  palette: readonly [HSLTuple, HSLTuple, HSLTuple, HSLTuple];
  levels: Partial<Record<LayerId, number>>;
  reverb: number;
  /** Art direction for the stage and world cards. */
  motif: WorldMotif;
  /** Just-intonation ratios the melodic layers draw from. */
  scale: readonly number[];
}

export const WORLDS: readonly BienceWorld[] = [
  {
    id: "monsoon-terrace",
    name: "Monsoon Terrace",
    subtitle: "Rain on hot stone, thunder three streets away.",
    note: "A2 · 110 Hz",
    root: 110,
    palette: [
      [208, 34, 6],
      [198, 42, 14],
      [182, 46, 26],
      [160, 52, 44],
    ],
    levels: { rain: 0.82, storm: 0.44, wind: 0.22, sub: 0.3, bowls: 0.1 },
    reverb: 0.62,
    motif: "monsoon",
    scale: [1, 1.125, 1.25, 1.5, 1.6667, 2],
  },
  {
    id: "first-light",
    name: "First Light",
    subtitle: "Birds before the city remembers itself.",
    note: "C3 · 131 Hz",
    root: 130.81,
    palette: [
      [24, 34, 7],
      [30, 52, 16],
      [38, 70, 34],
      [48, 84, 58],
    ],
    levels: { birds: 0.72, wind: 0.3, stream: 0.36, bowls: 0.18, tanpura: 0.12 },
    reverb: 0.5,
    motif: "sunrise",
    scale: [1, 1.125, 1.25, 1.5, 1.6875, 2],
  },
  {
    id: "hearth",
    name: "Hearth",
    subtitle: "A small fire, doing the work of a whole evening.",
    note: "G2 · 98 Hz",
    root: 98,
    palette: [
      [16, 30, 5],
      [20, 48, 12],
      [26, 78, 26],
      [34, 92, 50],
    ],
    levels: { fire: 0.78, wind: 0.24, sub: 0.36, bowls: 0.12, tanpura: 0.16 },
    reverb: 0.44,
    motif: "hearth",
    scale: [1, 1.2, 1.3333, 1.5, 1.8, 2],
  },
  {
    id: "nilgiri-night",
    name: "Nilgiri Night",
    subtitle: "Crickets keeping time for a valley with no clock.",
    note: "F2 · 87 Hz",
    root: 87.31,
    palette: [
      [246, 30, 5],
      [238, 38, 12],
      [222, 44, 22],
      [196, 40, 36],
    ],
    levels: { crickets: 0.7, wind: 0.3, stream: 0.3, shimmer: 0.24, sub: 0.26 },
    reverb: 0.72,
    motif: "fireflies",
    scale: [1, 1.125, 1.2, 1.5, 1.6, 2],
  },
  {
    id: "vipassana-hall",
    name: "Vipassana Hall",
    subtitle: "Sixty people sitting. One tanpura. No hurry.",
    note: "A2 · 110 Hz",
    root: 110,
    palette: [
      [34, 26, 5],
      [38, 34, 11],
      [42, 46, 20],
      [44, 58, 34],
    ],
    levels: { tanpura: 0.68, bowls: 0.4, sub: 0.34, choir: 0.16, wind: 0.12 },
    reverb: 0.86,
    motif: "mandala",
    scale: [1, 1.25, 1.5, 2, 2.5, 3],
  },
  {
    id: "cosmic-void",
    name: "Cosmic Void",
    subtitle: "No weather. Only distance, and the fact of listening.",
    note: "C2 · 65 Hz",
    root: 65.41,
    palette: [
      [258, 32, 4],
      [250, 44, 10],
      [238, 58, 20],
      [206, 72, 38],
    ],
    levels: { sub: 0.74, shimmer: 0.44, choir: 0.32, wind: 0.16, bowls: 0.12 },
    reverb: 1,
    motif: "cosmos",
    scale: [1, 1.5, 2, 2.6667, 3, 4],
  },
  {
    id: "backwaters",
    name: "Backwaters",
    subtitle: "Slow green water, a snake-boat far off, noon heat.",
    note: "D3 · 147 Hz",
    root: 146.83,
    palette: [
      [170, 30, 5],
      [162, 38, 12],
      [150, 44, 24],
      [130, 48, 40],
    ],
    levels: { ocean: 0.6, stream: 0.46, crickets: 0.24, birds: 0.28, sub: 0.2 },
    reverb: 0.58,
    motif: "water",
    scale: [1, 1.125, 1.6667, 2, 2.25, 3],
  },
  {
    id: "kashi-dawn",
    name: "Kashi Dawn",
    subtitle: "Bells, a river, a hundred murmurs, one sun.",
    note: "A2 · 110 Hz",
    root: 110,
    palette: [
      [18, 34, 5],
      [24, 54, 12],
      [32, 74, 24],
      [40, 90, 46],
    ],
    levels: { bowls: 0.56, tanpura: 0.4, crowd: 0.36, birds: 0.32, stream: 0.34, sub: 0.22 },
    reverb: 0.7,
    motif: "bells",
    scale: [1, 1.125, 1.25, 1.5, 1.6667, 2],
  },
];

export const WORLDS_BY_ID: Record<WorldId, BienceWorld> = WORLDS.reduce(
  (acc, world) => {
    acc[world.id] = world;
    return acc;
  },
  {} as Record<WorldId, BienceWorld>,
);

export const WORLD_IDS = WORLDS.map((w) => w.id);

export type MixSource = WorldId | "custom";

export interface BienceMix {
  source: MixSource;
  base: WorldId;
  master: number;
  reverb: number;
  levels: Record<LayerId, number>;
}

export const STORAGE_KEY = "satyug-bience-v1";
export const SILENCE = 0.0001;

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function emptyLevels(): Record<LayerId, number> {
  return LAYER_IDS.reduce((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {} as Record<LayerId, number>);
}

export function levelsFromWorld(world: BienceWorld): Record<LayerId, number> {
  const levels = emptyLevels();
  for (const id of LAYER_IDS) {
    levels[id] = clamp01(world.levels[id] ?? 0);
  }
  return levels;
}

export function worldMix(worldId: WorldId): BienceMix {
  const world = WORLDS_BY_ID[worldId] ?? WORLDS[0];
  return {
    source: world.id,
    base: world.id,
    master: 0.82,
    reverb: world.reverb,
    levels: levelsFromWorld(world),
  };
}

export function withLevel(mix: BienceMix, id: LayerId, level: number): BienceMix {
  return {
    ...mix,
    source: "custom",
    levels: { ...mix.levels, [id]: clamp01(level) },
  };
}

export function withAllLevels(mix: BienceMix, levels: Record<LayerId, number>): BienceMix {
  return { ...mix, source: "custom", levels: normalizeLevels(levels) };
}

export function normalizeLevels(input: Partial<Record<LayerId, number>> | undefined): Record<LayerId, number> {
  const levels = emptyLevels();
  if (!input) return levels;
  for (const id of LAYER_IDS) {
    const raw = input[id];
    levels[id] = typeof raw === "number" && Number.isFinite(raw) ? clamp01(raw) : 0;
  }
  return levels;
}

export function normalizeMix(input: unknown): BienceMix {
  const fallback = worldMix(WORLDS[0].id);
  if (!input || typeof input !== "object") return fallback;
  const raw = input as Partial<BienceMix> & { levels?: Partial<Record<LayerId, number>> };
  const base = typeof raw.base === "string" && raw.base in WORLDS_BY_ID ? (raw.base as WorldId) : WORLDS[0].id;
  const baseMix = worldMix(base);
  const source: MixSource =
    typeof raw.source === "string" && (raw.source === "custom" || raw.source in WORLDS_BY_ID)
      ? (raw.source as MixSource)
      : base;
  return {
    source,
    base,
    master: typeof raw.master === "number" && Number.isFinite(raw.master) ? clamp01(raw.master) : baseMix.master,
    reverb:
      typeof raw.reverb === "number" && Number.isFinite(raw.reverb) ? clamp01(raw.reverb) : baseMix.reverb,
    levels: normalizeLevels(raw.levels),
  };
}

export function activeLayers(levels: Record<LayerId, number>): LayerId[] {
  return LAYER_IDS.filter((id) => levels[id] > 0.005);
}

export function mixEnergy(levels: Record<LayerId, number>): number {
  const sum = LAYER_IDS.reduce((acc, id) => acc + levels[id], 0);
  return clamp01(sum / 5);
}

export interface StoredBience {
  version: 1;
  mix: BienceMix;
  updatedAt: number;
}

export function serializeBience(mix: BienceMix): string {
  const payload: StoredBience = { version: 1, mix: normalizeMix(mix), updatedAt: Date.now() };
  return JSON.stringify(payload);
}

export function parseBience(raw: string | null): BienceMix | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredBience>;
    if (!parsed || parsed.version !== 1) return null;
    return normalizeMix(parsed.mix);
  } catch {
    return null;
  }
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function noteForFrequency(freq: number): string {
  if (!Number.isFinite(freq) || freq <= 0) return "-";
  const midi = Math.round(12 * Math.log2(freq / 440) + 69);
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave} · ${Math.round(freq)} Hz`;
}

export type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

export interface BreathPattern {
  id: "settle" | "box" | "478";
  label: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
}

export const BREATH_PATTERNS: readonly BreathPattern[] = [
  { id: "settle", label: "Settle 4-2-6", inhale: 4, hold: 2, exhale: 6, rest: 1 },
  { id: "box", label: "Box 4-4-4-4", inhale: 4, hold: 4, exhale: 4, rest: 4 },
  { id: "478", label: "4-7-8", inhale: 4, hold: 7, exhale: 8, rest: 1 },
];

export interface BreathMoment {
  phase: BreathPhase;
  /** 0-1 across the current phase. */
  progress: number;
  /** 0-1 across the whole cycle. */
  cycle: number;
  label: string;
}

export function breathAt(pattern: BreathPattern, elapsedSeconds: number): BreathMoment {
  const total = pattern.inhale + pattern.hold + pattern.exhale + pattern.rest;
  const t = ((elapsedSeconds % total) + total) % total;
  const segments: { phase: BreathPhase; length: number; label: string }[] = [
    { phase: "inhale", length: pattern.inhale, label: "Inhale" },
    { phase: "hold", length: pattern.hold, label: "Hold" },
    { phase: "exhale", length: pattern.exhale, label: "Exhale" },
    { phase: "rest", length: pattern.rest, label: "Rest" },
  ];
  let cursor = 0;
  for (const segment of segments) {
    if (t < cursor + segment.length || segment === segments[segments.length - 1]) {
      const progress = segment.length > 0 ? (t - cursor) / segment.length : 1;
      return {
        phase: segment.phase,
        progress: clamp01(progress),
        cycle: clamp01(t / total),
        label: segment.label,
      };
    }
    cursor += segment.length;
  }
  return { phase: "inhale", progress: 0, cycle: 0, label: "Inhale" };
}

export const SLEEP_OPTIONS = [0, 15, 30, 45, 60, 90] as const;
export type SleepMinutes = (typeof SLEEP_OPTIONS)[number];

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
