/**
 * Observation Picker
 * ──────────────────
 * Deterministic seed selection for the 100-session observation ladder.
 *
 * The same (user, sessionNumber) always resolves to the same seed, so a
 * session can be resumed, shared, or analysed later. Variety comes from
 * three places: the hash of the session number, a no-repeat window of
 * recent seeds, and light state scoring (slot, mood, loops, arrival).
 *
 * Pure module: no I/O, no React, safe on client and server.
 */
import {
  OBS_SEEDS,
  getObsSeedById,
  obsSeedIdFromText,
  type ObsLens,
  type ObsSeed,
  type ObsSlot,
} from "@/data/observationSessions";

export interface PickObservationInput {
  userId?: string | null;
  /** Stable per sitting. Same number + same user = same seed. */
  sessionNumber: number;
  /** User's current observation level (0–7). Seeds up to level + 1 are open. */
  level: number;
  slot?: ObsSlot;
  /** Requested duration in minutes; seeds that support it score higher. */
  minutes?: number;
  arrivalState?: string | null;
  mood?: string | null;
  activeLoops?: string[];
  /** Last N seed ids (newest first) — excluded when the pool allows it. */
  recentSeedIds?: string[];
  /** Extra entropy for a deliberate re-roll ("surprise me"). */
  salt?: string;
}

/** FNV-1a 32-bit — small, stable, no dependencies. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function currentObsSlot(now: Date = new Date()): ObsSlot {
  const h = now.getHours();
  if (h < 11) return "morning";
  if (h < 17) return "midday";
  if (h < 21) return "evening";
  return "night";
}

/** Levels below the user's current level stay open for revisiting. */
export function maxOpenLevel(level: number): number {
  return Math.max(1, Math.min(7, Math.floor(level) + 1));
}

export function seedIsOpen(seed: ObsSeed, level: number): boolean {
  const max = maxOpenLevel(level);
  const floor = level >= 4 ? Math.max(1, max - 4) : 1;
  return seed.level >= floor && seed.level <= max;
}

const ARRIVAL_LENS: Record<string, ObsLens[]> = {
  scattered: ["body", "breath"],
  tired: ["body", "sensation"],
  tense: ["emotion", "body"],
  okay: ["breath", "thought"],
  open: ["watcher", "sensation"],
};

const MOOD_LENS: Record<string, ObsLens[]> = {
  tense: ["emotion", "pattern"],
  neutral: ["breath", "thought"],
  open: ["watcher", "sensation"],
  low: ["body", "emotion"],
  heavy: ["emotion", "body"],
  restless: ["breath", "body"],
  clear: ["thought", "pattern"],
};

/**
 * Score a seed for the current moment. Higher is better.
 * Deterministic — no Math.random anywhere in this module.
 */
export function scoreObsSeed(seed: ObsSeed, input: PickObservationInput): number {
  let score = 0;
  const slot = input.slot ?? currentObsSlot();

  if (seed.slot === slot) score += 3;
  else if (seed.slot === "any") score += 1.5;

  if (input.minutes && seed.minutes.includes(Math.round(input.minutes))) score += 2;

  const arrivalLenses = input.arrivalState ? ARRIVAL_LENS[input.arrivalState] : undefined;
  if (arrivalLenses?.includes(seed.lens)) score += 1.5;

  const moodLenses = input.mood ? MOOD_LENS[input.mood] : undefined;
  if (moodLenses?.includes(seed.lens)) score += 1.25;

  if (input.activeLoops?.length) {
    if (seed.lens === "pattern" || seed.lens === "thought") score += 1;
    if (seed.level >= 5 && (seed.lens === "pattern" || seed.lens === "watcher")) score += 0.5;
  }

  // Slight preference for the user's own level — depth without jumps.
  const distance = Math.abs(seed.level - Math.max(1, Math.min(7, input.level)));
  score += Math.max(0, 1.5 - distance * 0.75);

  return score;
}

/** All seeds that are legal for this user right now, best first. */
export function rankObsSeeds(input: PickObservationInput): ObsSeed[] {
  return scoredObsSeeds(input).map((entry) => entry.seed);
}

interface ScoredSeed {
  seed: ObsSeed;
  score: number;
  order: number;
}

function scoredObsSeeds(input: PickObservationInput): ScoredSeed[] {
  const key = `${input.userId ?? "guest"}|${input.sessionNumber}|${input.salt ?? ""}`;
  return OBS_SEEDS.filter((seed) => seedIsOpen(seed, input.level))
    .map((seed) => ({
      seed,
      score: scoreObsSeed(seed, input),
      order: hashString(`${key}|${seed.id}`),
    }))
    .sort((a, b) => b.score - a.score || a.order - b.order);
}

/**
 * Pick a seed from the near-best shortlist using the session hash.
 *
 * Sorting alone made a narrow slot + level resolve to one permanent winner.
 * Keeping a shortlist and rotating inside it means the same criteria still
 * prefer the right sessions, but consecutive sittings do not repeat.
 */
export function pickObservationSession(input: PickObservationInput): ObsSeed {
  const scored = scoredObsSeeds(input);
  if (scored.length === 0) return OBS_SEEDS[0];

  const best = scored[0].score;
  const shortlist = scored.filter((entry) => entry.score >= best - 1.25);
  const recent = new Set(input.recentSeedIds ?? []);
  const fresh = shortlist.filter((entry) => !recent.has(entry.seed.id));
  const pool = fresh.length > 0 ? fresh : shortlist;

  const key = `${input.userId ?? "guest"}|${input.sessionNumber}|${input.salt ?? ""}`;
  return pool[hashString(key) % pool.length].seed;
}

/**
 * Resolve a seed for a practice step: explicit pin first, then the picker.
 * Used by the practice script builder so scheduled packs and ad-hoc sittings
 * share one code path.
 */
export function resolveObservationSeed(args: {
  seedId?: string | null;
  text?: string | null;
  sessionNumber: number;
  level: number;
  minutes?: number;
  slot?: ObsSlot;
  arrivalState?: string | null;
  recentSeedIds?: string[];
}): ObsSeed {
  const pinned = getObsSeedById(args.seedId) ?? getObsSeedById(obsSeedIdFromText(args.text));
  if (pinned) return pinned;
  return pickObservationSession({
    sessionNumber: args.sessionNumber,
    level: args.level,
    minutes: args.minutes,
    slot: args.slot,
    arrivalState: args.arrivalState,
    recentSeedIds: args.recentSeedIds,
  });
}
