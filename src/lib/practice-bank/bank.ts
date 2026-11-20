/**
 * Orb practice bank — a deterministic, indexable catalogue of practices.
 *
 * The catalogue is a product, not a JSON dump:
 *
 *   atom (authored framework or technique)
 *   × duration slot (1s … 12h)
 *   × voice (4)
 *   × delivery mode (6)
 *   × world (8)
 *   × level (7)
 *
 * Every index decodes to exactly one practice, and every practice re-encodes
 * to its index, so the bank costs no storage and survives reloads, deep links
 * and offline sessions. Search samples the product rather than materialising it.
 */
import { DURATION_SLOTS, durationBandFor, type DurationBandId } from "./durations";
import {
  DELIVERY_MODES,
  MODES_BY_ID,
  ORB_LEVELS,
  PRACTICE_WORLDS,
  VOICES,
  VOICES_BY_ID,
  WORLDS_BY_PRACTICE_ID,
  type DeliveryModeId,
  type PracticeSpec,
  type VoiceId,
} from "./model";
import { PRACTICE_ATOMS, PRACTICE_ATOMS_BY_ID, type PracticeAtom, type PracticeAtomKind } from "./atoms";
import type { WorldId } from "@/lib/bience/model";

const ATOM_COUNT = PRACTICE_ATOMS.length;
const DURATION_COUNT = DURATION_SLOTS.length;
const VOICE_COUNT = VOICES.length;
const MODE_COUNT = DELIVERY_MODES.length;
const WORLD_COUNT = PRACTICE_WORLDS.length;
const LEVEL_COUNT = ORB_LEVELS.length;

export const PRACTICE_BANK_SIZE =
  ATOM_COUNT * DURATION_COUNT * VOICE_COUNT * MODE_COUNT * WORLD_COUNT * LEVEL_COUNT;

export const PRACTICE_BANK_STATS = {
  atoms: ATOM_COUNT,
  frameworks: PRACTICE_ATOMS.filter((atom) => atom.kind === "framework").length,
  techniques: PRACTICE_ATOMS.filter((atom) => atom.kind === "technique").length,
  durations: DURATION_COUNT,
  voices: VOICE_COUNT,
  modes: MODE_COUNT,
  worlds: WORLD_COUNT,
  levels: LEVEL_COUNT,
  size: PRACTICE_BANK_SIZE,
} as const;

/** Canonical index encoding: atom outermost, level innermost. */
export function practiceSpecToIndex(spec: Omit<PracticeSpec, "index"> | PracticeSpec): number {
  const atomIndex = Math.max(0, PRACTICE_ATOMS.findIndex((atom) => atom.id === spec.atomId));
  const durationIndex = Math.max(
    0,
    DURATION_SLOTS.findIndex((slot) => slot.seconds === spec.durationSec),
  );
  const voiceIndex = Math.max(0, VOICES.findIndex((voice) => voice.id === spec.voiceId));
  const modeIndex = Math.max(0, DELIVERY_MODES.findIndex((mode) => mode.id === spec.modeId));
  const worldIndex = Math.max(0, PRACTICE_WORLDS.findIndex((world) => world.id === spec.worldId));
  const levelIndex = Math.max(0, ORB_LEVELS.indexOf(spec.level));

  return (
    (((((atomIndex * DURATION_COUNT + durationIndex) * VOICE_COUNT + voiceIndex) * MODE_COUNT +
      modeIndex) *
      WORLD_COUNT +
      worldIndex) *
      LEVEL_COUNT +
      levelIndex)
  );
}

export function practiceSpecAtIndex(rawIndex: number): PracticeSpec {
  const size = PRACTICE_BANK_SIZE;
  let n = Math.floor(Number.isFinite(rawIndex) ? rawIndex : 0) % size;
  if (n < 0) n += size;
  const index = n;

  const level = ORB_LEVELS[n % LEVEL_COUNT];
  n = Math.floor(n / LEVEL_COUNT);
  const world = PRACTICE_WORLDS[n % WORLD_COUNT];
  n = Math.floor(n / WORLD_COUNT);
  const mode = DELIVERY_MODES[n % MODE_COUNT];
  n = Math.floor(n / MODE_COUNT);
  const voice = VOICES[n % VOICE_COUNT];
  n = Math.floor(n / VOICE_COUNT);
  const slot = DURATION_SLOTS[n % DURATION_COUNT];
  n = Math.floor(n / DURATION_COUNT);
  const atom = PRACTICE_ATOMS[n % ATOM_COUNT];

  return {
    index,
    atomId: atom.id,
    durationSec: slot.seconds,
    voiceId: voice.id,
    modeId: mode.id,
    worldId: world.id,
    level,
  };
}

export function practiceId(spec: PracticeSpec): string {
  return [
    "orb",
    spec.atomId.replace(":", "-"),
    `${spec.durationSec}s`,
    spec.voiceId,
    spec.modeId,
    spec.worldId,
    `l${spec.level}`,
  ].join("-");
}

export function practiceLabel(spec: PracticeSpec): string {
  const atom = PRACTICE_ATOMS_BY_ID[spec.atomId];
  const slot = DURATION_SLOTS.find((entry) => entry.seconds === spec.durationSec);
  const voice = VOICES_BY_ID[spec.voiceId];
  const mode = MODES_BY_ID[spec.modeId];
  const world = WORLDS_BY_PRACTICE_ID[spec.worldId];
  return `${atom?.title ?? spec.atomId} · ${slot?.label ?? `${spec.durationSec}s`} · ${mode?.label ?? spec.modeId} · ${voice?.label ?? spec.voiceId} · ${world?.name ?? spec.worldId} · L${spec.level}`;
}

export interface PracticeQuery {
  atomId?: string;
  atomKind?: PracticeAtomKind;
  category?: string;
  /** Free text over title, purpose, category, tradition and technique names. */
  search?: string;
  durationSec?: number;
  minDurationSec?: number;
  maxDurationSec?: number;
  band?: DurationBandId;
  modeId?: DeliveryModeId;
  worldId?: WorldId;
  voiceId?: VoiceId;
  level?: number;
  levelAtLeast?: number;
  listenOnly?: boolean;
}

function atomMatches(atom: PracticeAtom, query: PracticeQuery): boolean {
  if (query.atomId && atom.id !== query.atomId) return false;
  if (query.atomKind && atom.kind !== query.atomKind) return false;
  if (query.category && atom.category !== query.category) return false;
  if (query.search) {
    const needle = query.search.toLowerCase().trim();
    if (needle) {
      const haystack = [
        atom.title,
        atom.purpose,
        atom.category,
        atom.tradition,
        ...atom.techniques,
        ...atom.stages,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }
  return true;
}

export function practiceMatchesQuery(spec: PracticeSpec, query: PracticeQuery): boolean {
  const atom = PRACTICE_ATOMS_BY_ID[spec.atomId];
  if (!atom || !atomMatches(atom, query)) return false;
  if (query.durationSec !== undefined && spec.durationSec !== query.durationSec) return false;
  if (query.minDurationSec !== undefined && spec.durationSec < query.minDurationSec) return false;
  if (query.maxDurationSec !== undefined && spec.durationSec > query.maxDurationSec) return false;
  if (query.band && durationBandFor(spec.durationSec) !== query.band) return false;
  if (query.modeId && spec.modeId !== query.modeId) return false;
  if (query.worldId && spec.worldId !== query.worldId) return false;
  if (query.voiceId && spec.voiceId !== query.voiceId) return false;
  if (query.level !== undefined && spec.level !== query.level) return false;
  if (query.levelAtLeast !== undefined && spec.level < query.levelAtLeast) return false;
  if (query.listenOnly && !MODES_BY_ID[spec.modeId]?.listens) return false;
  return true;
}

/** FNV-1a over a stable description; the bank never depends on Math.random. */
export function seedHash(seed: string | number): number {
  const text = String(seed);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const SAMPLE_STRIDE = 7907;

/**
 * When the caller pins any axis, build the exact candidate instead of
 * sampling 12M indices. This keeps "600 seconds, inquiry, level 3" guaranteed
 * rather than probabilistically found.
 */
function directSearch(query: PracticeQuery, seed: string | number): PracticeSpec | null {
  const atoms = query.atomId
    ? PRACTICE_ATOMS.filter((atom) => atom.id === query.atomId)
    : PRACTICE_ATOMS.filter((atom) => atomMatches(atom, query));
  if (!atoms.length) return null;

  const durations = DURATION_SLOTS.filter((slot) => {
    if (query.durationSec !== undefined && slot.seconds !== query.durationSec) return false;
    if (query.minDurationSec !== undefined && slot.seconds < query.minDurationSec) return false;
    if (query.maxDurationSec !== undefined && slot.seconds > query.maxDurationSec) return false;
    if (query.band && slot.band !== query.band) return false;
    return true;
  });
  if (!durations.length) return null;

  const voices = query.voiceId ? VOICES.filter((voice) => voice.id === query.voiceId) : [...VOICES];
  const modes = query.modeId
    ? DELIVERY_MODES.filter((mode) => mode.id === query.modeId)
    : query.listenOnly
      ? DELIVERY_MODES.filter((mode) => mode.listens)
      : [...DELIVERY_MODES];
  const worlds = query.worldId
    ? PRACTICE_WORLDS.filter((world) => world.id === query.worldId)
    : [...PRACTICE_WORLDS];
  const levels = query.level !== undefined
    ? ORB_LEVELS.filter((level) => level === query.level)
    : query.levelAtLeast !== undefined
      ? ORB_LEVELS.filter((level) => level >= query.levelAtLeast!)
      : [...ORB_LEVELS];

  if (!voices.length || !modes.length || !worlds.length || !levels.length) return null;

  const base = seedHash(seed);
  const combos = voices.length * modes.length * worlds.length * levels.length;
  const attempts = Math.min(combos, 64);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const voice = voices[(base + attempt) % voices.length];
    const mode = modes[Math.floor((base + attempt) / voices.length) % modes.length];
    const world = worlds[Math.floor((base + attempt) / (voices.length * modes.length)) % worlds.length];
    const level =
      levels[
        Math.floor((base + attempt) / (voices.length * modes.length * worlds.length)) % levels.length
      ];
    for (const atom of atoms) {
      for (const slot of durations) {
        const candidate = practiceSpecAtIndex(
          practiceSpecToIndex({
            atomId: atom.id,
            durationSec: slot.seconds,
            voiceId: voice.id,
            modeId: mode.id,
            worldId: world.id,
            level,
          }),
        );
        if (practiceMatchesQuery(candidate, query)) return candidate;
      }
    }
  }
  return null;
}

export function pickPractice(query: PracticeQuery = {}, seed: string | number = Date.now()): PracticeSpec {
  const hasPinnedAxis =
    query.durationSec !== undefined ||
    query.band !== undefined ||
    query.minDurationSec !== undefined ||
    query.maxDurationSec !== undefined ||
    query.modeId !== undefined ||
    query.worldId !== undefined ||
    query.voiceId !== undefined ||
    query.level !== undefined ||
    query.levelAtLeast !== undefined ||
    query.listenOnly !== undefined;

  if (hasPinnedAxis) {
    const direct = directSearch(query, seed);
    if (direct) return direct;
  }

  const start = seedHash(seed) % PRACTICE_BANK_SIZE;
  const attempts = Math.min(PRACTICE_BANK_SIZE, 40000);
  for (let step = 0; step < attempts; step += 1) {
    const spec = practiceSpecAtIndex((start + step * SAMPLE_STRIDE) % PRACTICE_BANK_SIZE);
    if (practiceMatchesQuery(spec, query)) return spec;
  }
  // Relax free text, then duration, so the caller always receives a real practice.
  const relaxed: PracticeQuery = { ...query, search: undefined, durationSec: undefined };
  for (let step = 0; step < attempts; step += 1) {
    const spec = practiceSpecAtIndex((start + step * SAMPLE_STRIDE) % PRACTICE_BANK_SIZE);
    if (practiceMatchesQuery(spec, relaxed)) return spec;
  }
  return practiceSpecAtIndex(start);
}

export interface ListPracticesOptions {
  limit?: number;
  seed?: string | number;
}

export function listPractices(query: PracticeQuery = {}, options: ListPracticesOptions = {}): PracticeSpec[] {
  const limit = Math.max(1, Math.min(200, options.limit ?? 24));
  const start = seedHash(options.seed ?? 1) % PRACTICE_BANK_SIZE;
  const seen = new Set<string>();
  const results: PracticeSpec[] = [];
  const attempts = Math.min(PRACTICE_BANK_SIZE, 60000);

  for (let step = 0; step < attempts && results.length < limit; step += 1) {
    const spec = practiceSpecAtIndex((start + step * SAMPLE_STRIDE) % PRACTICE_BANK_SIZE);
    if (!practiceMatchesQuery(spec, query)) continue;
    const key = practiceId(spec);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(spec);
  }
  return results;
}

/**
 * Exact count for queries that pin a duration or atom; otherwise an estimate
 * over the product. Counting the full product is cheap arithmetic when every
 * axis is filtered, so exactness is preserved for the common UI filters.
 */
export function countPractices(query: PracticeQuery = {}): number {
  const atomCount = PRACTICE_ATOMS.filter((atom) => atomMatches(atom, query)).length;
  const durationCount = DURATION_SLOTS.filter((slot) => {
    if (query.durationSec !== undefined && slot.seconds !== query.durationSec) return false;
    if (query.minDurationSec !== undefined && slot.seconds < query.minDurationSec) return false;
    if (query.maxDurationSec !== undefined && slot.seconds > query.maxDurationSec) return false;
    if (query.band && slot.band !== query.band) return false;
    return true;
  }).length;
  const voiceCount = query.voiceId ? 1 : VOICE_COUNT;
  const modeCount = query.modeId
    ? 1
    : query.listenOnly
      ? DELIVERY_MODES.filter((mode) => mode.listens).length
      : MODE_COUNT;
  const worldCount = query.worldId ? 1 : WORLD_COUNT;
  const levelCount =
    query.level !== undefined
      ? 1
      : query.levelAtLeast !== undefined
        ? ORB_LEVELS.filter((level) => level >= query.levelAtLeast!).length
        : LEVEL_COUNT;
  return atomCount * durationCount * voiceCount * modeCount * worldCount * levelCount;
}
