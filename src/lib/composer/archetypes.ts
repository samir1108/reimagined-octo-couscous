/**
 * SESSION ARCHETYPES — Layer 1 of the Composer Framework
 * ───────────────────────────────────────────────────────
 * Every session, regardless of ingredients, has one of 7 shapes.
 * The archetype is chosen by gate + energy + gap days + band — NEVER by the user.
 * It defines the *slots* (ordered roles) that the composer fills with ingredients.
 */
import type { GateId } from "@/lib/consciousness/dailyGates";

export type ArchetypeId =
  | "opening"      // morning wake-up
  | "inquiry"      // sit with a question
  | "teaching"     // learn + integrate
  | "practice_deep" // one practice, gone deep
  | "integration"  // process the day (evening)
  | "release"      // let go (night)
  | "micro";       // 60-180s presence reset

export type SlotRole =
  | "settle"        // arrive, ground
  | "anchor"        // wisdom / quote / teaching seed
  | "core"          // main practice
  | "deepen"        // extend the core
  | "reflect"       // journal / prompt
  | "release"       // let go / rest
  | "seal";         // closing intention / off-app

export interface ArchetypeSlot {
  role: SlotRole;
  /** Share of total time (sums to ~1.0 across slots). */
  share: number;
  /** Ingredient kinds this slot accepts, in preference order. */
  accepts: Array<"practice" | "knowledge" | "reflection" | "micro_action">;
  /** Optional bias toward certain practice ids/categories for this slot. */
  practiceBias?: string[];
  /** Optional depth bias: light | medium | deep. */
  depth?: "light" | "medium" | "deep";
}

export interface Archetype {
  id: ArchetypeId;
  label: string;
  description: string;
  /** Gates where this archetype is preferred. */
  preferredGates: GateId[];
  /** Min/max total session minutes this shape fits. */
  durationRangeMin: [number, number];
  /** Energy bands this archetype fits. */
  energyFit: Array<"low" | "medium" | "high">;
  /** Ordered slot template. */
  slots: ArchetypeSlot[];
  /** Headline copy generator. */
  toneWords: string[];
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  opening: {
    id: "opening",
    label: "Opening",
    description: "Wake the system: breath → body → intention.",
    preferredGates: ["morning"],
    durationRangeMin: [3, 20],
    energyFit: ["low", "medium", "high"],
    toneWords: ["gentle", "grounded", "clear"],
    slots: [
      { role: "settle", share: 0.25, accepts: ["practice", "micro_action"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "anchor", share: 0.20, accepts: ["knowledge", "micro_action"], depth: "light" },
      { role: "seal",   share: 0.55, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },

  inquiry: {
    id: "inquiry",
    label: "Inquiry",
    description: "Sit with a question: witness → self-inquiry → journal.",
    preferredGates: ["midday", "evening"],
    durationRangeMin: [8, 45],
    energyFit: ["medium", "high"],
    toneWords: ["curious", "spacious", "honest"],
    slots: [
      { role: "settle", share: 0.15, accepts: ["practice"], practiceBias: ["witness", "breath"], depth: "light" },
      { role: "core",   share: 0.50, accepts: ["practice"], practiceBias: ["inquiry", "jnana", "witness"], depth: "deep" },
      { role: "reflect",share: 0.35, accepts: ["reflection"], depth: "medium" },
    ],
  },

  teaching: {
    id: "teaching",
    label: "Teaching",
    description: "Learn + integrate: knowledge → reflection → micro-practice.",
    preferredGates: ["morning", "midday", "evening"],
    durationRangeMin: [5, 25],
    energyFit: ["medium", "high"],
    toneWords: ["clear", "illuminating", "practical"],
    slots: [
      { role: "anchor", share: 0.40, accepts: ["knowledge"], depth: "medium" },
      { role: "reflect",share: 0.25, accepts: ["reflection"], depth: "medium" },
      { role: "core",   share: 0.35, accepts: ["practice", "micro_action"], depth: "light" },
    ],
  },

  practice_deep: {
    id: "practice_deep",
    label: "Deep Practice",
    description: "One practice, gone deep.",
    preferredGates: ["morning", "midday", "evening"],
    durationRangeMin: [12, 90],
    energyFit: ["medium", "high"],
    toneWords: ["focused", "deep", "still"],
    slots: [
      { role: "settle", share: 0.10, accepts: ["practice"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "core",   share: 0.65, accepts: ["practice"], depth: "deep" },
      { role: "deepen", share: 0.15, accepts: ["practice"], depth: "deep" },
      { role: "seal",   share: 0.10, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },

  integration: {
    id: "integration",
    label: "Integration",
    description: "Process the day: review → release → reflection.",
    preferredGates: ["evening"],
    durationRangeMin: [5, 25],
    energyFit: ["low", "medium"],
    toneWords: ["soft", "honest", "settling"],
    slots: [
      { role: "settle", share: 0.20, accepts: ["practice"], practiceBias: ["breath", "body"], depth: "light" },
      { role: "reflect",share: 0.50, accepts: ["reflection", "knowledge"], depth: "medium" },
      { role: "release",share: 0.30, accepts: ["practice", "micro_action"], practiceBias: ["witness", "breath"], depth: "light" },
    ],
  },

  release: {
    id: "release",
    label: "Release",
    description: "Let go: body scan → breath → silence.",
    preferredGates: ["night"],
    durationRangeMin: [3, 20],
    energyFit: ["low", "medium"],
    toneWords: ["soft", "dim", "letting go"],
    slots: [
      { role: "settle", share: 0.30, accepts: ["practice"], practiceBias: ["body", "breath"], depth: "light" },
      { role: "release",share: 0.50, accepts: ["practice"], practiceBias: ["witness", "breath"], depth: "medium" },
      { role: "seal",   share: 0.20, accepts: ["reflection", "micro_action"], depth: "light" },
    ],
  },

  micro: {
    id: "micro",
    label: "Micro Pause",
    description: "One breath. One witness. 60–180s of presence.",
    preferredGates: ["morning", "midday", "evening", "night"],
    durationRangeMin: [1, 3],
    energyFit: ["low", "medium", "high"],
    toneWords: ["instant", "alive", "present"],
    slots: [
      { role: "core", share: 1.0, accepts: ["practice", "micro_action"], practiceBias: ["breath", "witness"], depth: "light" },
    ],
  },
};

/**
 * Pick the best archetype for the current context.
 * Pure function — no I/O. Caller passes gate/energy/gap/etc.
 */
export interface ArchetypeContext {
  gate: GateId;
  energy: "low" | "medium" | "high";
  gapDays: number;        // days since last session
  timeBudgetMin: number;  // available minutes
  band: number;           // current V-band 0-10
  /** Archetype ids used by recent sessions (newest first) — rotated out. */
  recentArchetypeIds?: string[];
  /** Yoga-path affinity (0-10 each). The dominant path steers the session shape. */
  pathAffinity?: Partial<Record<"raja" | "jnana" | "karma" | "bhakti", number>>;
  /** Journey day (1-based) and phase — early journeys stay foundational. */
  journeyDay?: number | null;
  journeyPhase?: string | null;
  /** Chitta vritti — the mind's current mode from yoga psychology. */
  chittaVritti?: string | null;
  /** Consciousness dimension bands (0-10). The weakest band gets worked. */
  dimensionBands?: Partial<Record<"body" | "emotion" | "thought" | "awareness", number>> | null;
  /** Witness stability 0-1 — gates deep witness/inquiry practices. */
  witnessStability?: number | null;
  /** Optional: user explicitly requested an archetype shape. */
  preferred?: ArchetypeId;
}

/** Which archetypes each yoga path naturally serves — a bonus, never a lock. */
const PATH_ARCHETYPE_BIAS: Record<"raja" | "jnana" | "karma" | "bhakti", ArchetypeId[]> = {
  raja: ["practice_deep", "micro", "release"],
  jnana: ["inquiry", "teaching", "practice_deep"],
  karma: ["teaching", "integration", "micro"],
  bhakti: ["integration", "teaching", "opening"],
};

function archetypeFit(a: Archetype, ctx: ArchetypeContext): number {
  let fit = 0;
  if (a.preferredGates.includes(ctx.gate)) fit += 3;
  if (a.energyFit.includes(ctx.energy)) fit += 2;
  const [lo, hi] = a.durationRangeMin;
  if (ctx.timeBudgetMin >= lo && ctx.timeBudgetMin <= hi) fit += 2;
  else if (ctx.timeBudgetMin >= Math.max(1, lo - 2) && ctx.timeBudgetMin <= hi + 5) fit += 1;
  // Dominant yoga path nudges the shape it naturally serves.
  const aff = ctx.pathAffinity;
  if (aff) {
    let bestPath: "raja" | "jnana" | "karma" | "bhakti" | null = null;
    let bestScore = 0;
    for (const p of ["raja", "jnana", "karma", "bhakti"] as const) {
      const s = Number(aff[p] ?? 0);
      if (s > bestScore) { bestScore = s; bestPath = p; }
    }
    if (bestPath && PATH_ARCHETYPE_BIAS[bestPath].includes(a.id)) fit += 2;
  }
  return fit;
}

/**
 * Shapes that fight the time of day — "wake the system" at night, "let go" at
 * sunrise. Everything else is allowed anywhere; the gate only weights the pick.
 */
const GATE_CONFLICTS: Partial<Record<ArchetypeId, GateId[]>> = {
  opening: ["night"],
  release: ["morning"],
};

/** Weighted pick — real variety between sessions, without losing the engine's intent. */
function pickWeighted<T>(items: T[], weight: (item: T) => number): T {
  const weights = items.map((i) => Math.max(0.05, weight(i)));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

function archetypeReason(a: Archetype, ctx: ArchetypeContext): string {
  const gateWord = ctx.gate === "midday" ? "Midday" : ctx.gate[0].toUpperCase() + ctx.gate.slice(1);
  return `${gateWord} ${a.label.toLowerCase()}`;
}

export function selectArchetype(ctx: ArchetypeContext): { archetype: Archetype; reason: string } {
  if (ctx.preferred && ARCHETYPES[ctx.preferred]) {
    return { archetype: ARCHETYPES[ctx.preferred], reason: "User preference" };
  }

  // Micro short-circuit: under 3 min always = micro
  if (ctx.timeBudgetMin <= 3) {
    return { archetype: ARCHETYPES.micro, reason: "Time budget < 3 min" };
  }

  // Everything that fits this moment: right energy, sensible duration, not
  // fighting the gate. The gate only weights the pick — it never pins it.
  const recent = ctx.recentArchetypeIds ?? [];
  const fitting = (Object.keys(ARCHETYPES) as ArchetypeId[])
    .map((id) => ARCHETYPES[id])
    .filter((a) => !(GATE_CONFLICTS[a.id] ?? []).includes(ctx.gate))
    .filter((a) => a.energyFit.includes(ctx.energy))
    .filter((a) => archetypeFit(a, ctx) > 0);

  // Hold out the shapes the last sessions already used, so consecutive
  // sessions never come out identical.
  const rotated = fitting.filter((a) => !recent.includes(a.id));
  const pool = rotated.length ? rotated : fitting;
  if (!pool.length) return { archetype: ARCHETYPES.integration, reason: "Integration — default" };

  // Re-entry after long gap, or low energy: stay gentle, but still rotate
  // between the gentle shapes instead of always returning the same one.
  if (ctx.gapDays >= 4 || ctx.energy === "low") {
    const gentle = pool.filter((a) =>
      a.id === "opening" || a.id === "integration" || a.id === "release" || a.id === "micro");
    const gentlePool = gentle.length ? gentle : pool;
    const chosen = pickWeighted(gentlePool, (a) => archetypeFit(a, ctx));
    const why = ctx.gapDays >= 4
      ? `Re-entry after ${ctx.gapDays}d gap`
      : `Low energy + ${ctx.gate}`;
    return { archetype: chosen, reason: why };
  }

  const chosen = pickWeighted(pool, (a) => archetypeFit(a, ctx));
  return { archetype: chosen, reason: archetypeReason(chosen, ctx) };
}

/** Convenience: get readable slot label for UI. */
export const SLOT_LABEL: Record<SlotRole, string> = {
  settle: "Settle",
  anchor: "Anchor",
  core: "Core Practice",
  deepen: "Deepen",
  reflect: "Reflection",
  release: "Release",
  seal: "Seal",
};
