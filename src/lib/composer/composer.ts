/**
 * @deprecated NOT the live compose path. The single AI compose brain is
 * `supabase/functions/compose-session-v3` (wired through
 * `src/lib/session-shell/api.ts` → `startGenerativeSession`). This
 * deterministic client composer is retained only for the unused
 * `useComposedSession` hook — do not wire new code to it.
 */
/**
 * COMPOSER — Layer 3 of the Composer Framework
 * ─────────────────────────────────────────────
 * Given a user context (band, energy, gate, time budget, active loops, levels,
 * recent ingredient history), pick an Archetype and fill each slot with the
 * highest-scoring eligible Ingredient. Time-scale to fit the budget.
 *
 * Pure function — no I/O. The edge function `compose-session` provides the
 * context from DB and persists the result.
 */
import type { Practice } from "@/lib/sutra/practices";
import {
  selectArchetype,
  type ArchetypeContext,
  type Archetype,
  type ArchetypeSlot,
  SLOT_LABEL,
} from "./archetypes";
import {
  ALL_INGREDIENTS,
  type Ingredient,
  type Gate,
  type Energy,
} from "./ingredients";

// ─── Scoring Weights (tunable) ───
const W = {
  loopMatch: 3,
  practiceLevelFit: 2,
  gateAlignment: 2,
  freshness: 1.5,
  energyFit: 1,
  bandFit: 1,
  slotBias: 2.5,
  repetitionPenalty: -4,
  // The user's own path and needs outweigh generic fit signals.
  pathMatch: 6, dimensionNeed: 4, journeyFit: 2, chittaFit: 3,
  // Learned fit — what this user actually finishes. Only as strong as the evidence.
  learnedBehavior: 5, learnedQuality: 3,
} as const;

/** Chitta vritti (mind modes) → practice categories that settle that mode. */
const CHITTA_PRACTICES: Record<string, string[]> = {
  restless: ["breath", "body"],
  distracted: ["witness", "breath", "mantra"],
  dull: ["breath", "movement"],
  focused: ["inquiry", "witness"],
  restrained: ["witness", "contemplation"],
};

export interface ComposerContext extends ArchetypeContext {
  /** User's active loop IDs (e.g. VAL001,OVT003). */
  activeLoops: string[];
  /** Practice levels 0-7 per practice id. */
  practiceLevels: Partial<Record<Practice, number>>;
  /** Ingredient IDs surfaced in the last 7 sessions. */
  recentIngredientIds: string[];
  /** Learned per-ingredient behaviour from the user's own completions. */
  ingredientPerformance?: Record<string, {
    attempts: number;
    completions: number;
    completionRate: number;
    avgQuality: number;
    avgSeconds: number;
  }>;
}

export interface ComposedSlot {
  role: ArchetypeSlot["role"];
  roleLabel: string;
  ingredient: Ingredient;
  minutes: number;
  score: number;
  reason: string;
}

export interface ComposedSession {
  archetypeId: Archetype["id"];
  archetypeLabel: string;
  archetypeReason: string;
  toneWords: string[];
  totalMinutes: number;
  slots: ComposedSlot[];
}

// ─── Eligibility ───
function eligibleFor(slot: ArchetypeSlot, ing: Ingredient, ctx: ComposerContext): boolean {
  if (!slot.accepts.includes(ing.kind)) return false;
  if (ing.bandRange) {
    const [lo, hi] = ing.bandRange;
    if (ctx.band < lo || ctx.band > hi) return false;
  }
  if (ing.energyFit && !ing.energyFit.includes(ctx.energy)) return false;
  if (ing.gateFit && !ing.gateFit.includes(ctx.gate)) return false;
  return true;
}

// ─── Scoring ───
function scoreIngredient(
  ing: Ingredient,
  slot: ArchetypeSlot,
  ctx: ComposerContext,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Loop match
  if (ing.loopTargets && ing.loopTargets.length && ctx.activeLoops.length) {
    const hits = ing.loopTargets.filter((l) => ctx.activeLoops.includes(l)).length;
    if (hits > 0) {
      score += W.loopMatch * hits;
      reasons.push(`loop match ×${hits}`);
    }
  }

  // 2. Practice level fit (only for practice ingredients)
  if (ing.practice) {
    const lvl = ctx.practiceLevels[ing.practice] ?? 0;
    // depth deep → reward higher level; light → reward lower
    const want = ing.depth === "deep" ? 3 : ing.depth === "medium" ? 1 : 0;
    const diff = Math.abs(lvl - want);
    const fit = Math.max(0, 2 - diff); // 0..2
    if (fit > 0) {
      score += W.practiceLevelFit * fit;
      reasons.push(`practice-level fit ${fit}`);
    }
  }

  // 3. Gate alignment
  if (ing.gateFit?.includes(ctx.gate)) {
    score += W.gateAlignment;
    reasons.push("gate aligned");
  }

  // 4. Freshness (not in recent)
  if (!ctx.recentIngredientIds.includes(ing.id)) {
    score += W.freshness;
    reasons.push("fresh");
  } else {
    score += W.repetitionPenalty;
    reasons.push("repeat");
  }

  // 5. Energy fit
  if (ing.energyFit?.includes(ctx.energy)) {
    score += W.energyFit;
    reasons.push("energy fit");
  }

  // 6. Band fit centered in window
  if (ing.bandRange) {
    score += W.bandFit;
    reasons.push("band fit");
  }

  // 7. Slot practice bias
  if (slot.practiceBias && ing.practice && slot.practiceBias.includes(ing.practice)) {
    score += W.slotBias;
    reasons.push(`slot prefers ${ing.practice}`);
  }
  // Slot depth bias
  if (slot.depth && ing.depth === slot.depth) {
    score += W.slotBias * 0.5;
    reasons.push("depth match");
  }

  // 8. Yoga path — the user's own path outweighs generic fit signals
  if (ing.paths?.length && ctx.pathAffinity) {
    let pathScore = 0;
    for (const p of ing.paths) {
      const strength = Math.min(1, Math.max(0, Number(ctx.pathAffinity?.[p] ?? 0) / 6));
      if (strength > 0) pathScore += strength;
    }
    if (pathScore > 0) {
      score += W.pathMatch * Math.min(1.5, pathScore);
      reasons.push(`serves ${ing.paths.join("/")} yoga`);
    }
  }

  // 9. Weakest consciousness dimension gets worked
  if (ctx.dimensionBands && ing.dimensions?.length) {
    let weak: string | null = null;
    let weakScore = Infinity;
    for (const d of ["body", "emotion", "thought", "awareness"] as const) {
      const s = Number(ctx.dimensionBands[d]);
      if (Number.isFinite(s) && s > 0 && s < weakScore) { weakScore = s; weak = d; }
    }
    if (weak && ing.dimensions.includes(weak as typeof ing.dimensions[number])) {
      score += W.dimensionNeed * (1.25 - Math.min(1, weakScore / 10));
      reasons.push(`works your ${weak} band`);
    }
  }

  // 10. Journey readiness: not-yet-due practices are nudged back; phase-fitting ones forward
  const journeyDay = ctx.journeyDay ?? 1;
  if (ing.minJourneyDay && journeyDay >= ing.minJourneyDay) {
    score += W.journeyFit;
    reasons.push(`journey day ${journeyDay} is ready`);
  }
  const early = ctx.journeyPhase === "assessment" || journeyDay <= 7;
  if (early && ing.depth === "light") { score += W.journeyFit * 0.5; reasons.push("early journey — gentle"); }

  // 11. Chitta vritti — the mind's current mode asks for a matching practice
  if (ctx.chittaVritti && ing.settlesChitta?.includes(ctx.chittaVritti)) {
    score += W.chittaFit;
    reasons.push(`settles ${ctx.chittaVritti}`);
  } else if (ctx.chittaVritti && ing.practice && CHITTA_PRACTICES[ctx.chittaVritti]?.includes(ing.practice)) {
    score += W.chittaFit * 0.6;
    reasons.push(`fits ${ctx.chittaVritti}`);
  }

  // 12. Learned fit — what this user actually finishes and rates well.
  const perf = ctx.ingredientPerformance?.[ing.id];
  if (perf && perf.attempts >= 2) {
    const confidence = Math.min(1, perf.attempts / 4);
    score += W.learnedBehavior * (perf.completionRate - 0.5) * 2 * confidence;
    if (perf.avgQuality > 0) {
      score += W.learnedQuality * (perf.avgQuality - 0.5) * 2 * confidence;
    }
    if (perf.completionRate >= 0.7) reasons.push("learned: this works for you");
    else if (perf.completionRate <= 0.3) reasons.push("learned: usually abandoned");
  }

  return { score, reasons };
}

// ─── Main compose function ───
export function composeSession(ctx: ComposerContext): ComposedSession {
  const { archetype, reason: archetypeReason } = selectArchetype(ctx);

  // Pool: filter ingredients globally eligible (rough cut)
  const pool = ALL_INGREDIENTS;

  // For each slot, pick best-scoring ingredient — avoid reusing within session
  const usedIds = new Set<string>();
  const slots: ComposedSlot[] = [];

  for (const slot of archetype.slots) {
    const candidates = pool.filter((i) => eligibleFor(slot, i, ctx) && !usedIds.has(i.id));
    if (!candidates.length) continue;

    const ranked = candidates
      .map((ing) => ({ ing, ...scoreIngredient(ing, slot, ctx) }))
      .sort((a, b) => b.score - a.score);

    // Weighted pick among the top few — the ranking still decides, but the
    // same stack of scores doesn't have to win the same way twice.
    const pickWeighted = <T,>(items: T[], weight: (item: T) => number): T => {
      const weights = items.map((i) => Math.max(0.05, weight(i)));
      const total = weights.reduce((a, b) => a + b, 0);
      let roll = Math.random() * total;
      for (let i = 0; i < items.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return items[i];
      }
      return items[items.length - 1];
    };
    const best = pickWeighted(ranked.slice(0, Math.min(3, ranked.length)), (c) => c.score);

    usedIds.add(best.ing.id);
    const minutes = Math.max(1, Math.round(ctx.timeBudgetMin * slot.share));
    slots.push({
      role: slot.role,
      roleLabel: SLOT_LABEL[slot.role],
      ingredient: best.ing,
      minutes,
      score: best.score,
      reason: best.reasons.join(", "),
    });
  }

  // Normalize minutes to fit budget exactly
  const totalRaw = slots.reduce((s, x) => s + x.minutes, 0);
  if (totalRaw !== ctx.timeBudgetMin && slots.length) {
    const factor = ctx.timeBudgetMin / totalRaw;
    let running = 0;
    slots.forEach((s, idx) => {
      if (idx === slots.length - 1) {
        s.minutes = Math.max(1, ctx.timeBudgetMin - running);
      } else {
        s.minutes = Math.max(1, Math.round(s.minutes * factor));
        running += s.minutes;
      }
    });
  }

  return {
    archetypeId: archetype.id,
    archetypeLabel: archetype.label,
    archetypeReason,
    toneWords: archetype.toneWords,
    totalMinutes: slots.reduce((s, x) => s + x.minutes, 0),
    slots,
  };
}

/** Convenience: human-readable session title from archetype tone + gate. */
export function composeTitle(session: ComposedSession, gate: Gate): string {
  const tone = session.toneWords[0] ?? "";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const suffix = gate === "morning" ? "Opening"
              : gate === "evening" ? "Settling"
              : gate === "night"   ? "Release"
              : "Pause";
  return `${cap(tone)} ${suffix}`.trim();
}
