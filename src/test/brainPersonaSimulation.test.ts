import { describe, expect, it } from "vitest";
import {
  ARCHETYPES,
  INGREDIENT_JOURNEY_LADDER,
  INGREDIENTS,
  composeSession,
  type ComposerContext,
} from "@/supabase/_shared/composer";
import { LOOP_NAMES } from "@/supabase/_shared/loopMap";
import { completionContracts } from "@/lib/session-shell/completionContracts";

/**
 * Persona simulation. 50 synthetic users × 30 days, deterministic.
 *
 * This is the regression net for the brain: it asserts invariants that must
 * hold for every plan, not just the fixture the test author had in mind.
 */

const RENDERABLE_KINDS = new Set(Object.keys(completionContracts));
const ARCHETYPE_IDS = new Set(Object.keys(ARCHETYPES));
const LOOP_IDS = Object.keys(LOOP_NAMES);

function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GATES = ["morning", "midday", "evening", "night"] as const;
const ENERGIES = ["low", "medium", "high"] as const;

function personaContext(persona: number, day: number): ComposerContext {
  const rng = makeRng(persona * 1000 + day);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
  const loopCount = 1 + Math.floor(rng() * 3);
  const loops = Array.from({ length: loopCount }, () => pick(LOOP_IDS));

  // Exercise the learned + exploration path with synthetic outcome history.
  const ingredientPerformance: Record<string, {
    attempts: number; completions: number; completionRate: number; avgQuality: number; avgSeconds: number;
  }> = {};
  for (let i = 0; i < 6; i++) {
    const ing = pick(INGREDIENTS);
    const attempts = 1 + Math.floor(rng() * 6);
    const completions = Math.floor(rng() * (attempts + 1));
    ingredientPerformance[ing.id] = {
      attempts,
      completions,
      completionRate: completions / attempts,
      avgQuality: rng(),
      avgSeconds: 120 + Math.floor(rng() * 300),
    };
  }

  return {
    gate: pick(GATES),
    energy: pick(ENERGIES),
    gapDays: Math.floor(rng() * 4),
    timeBudgetMin: [8, 12, 15, 20][Math.floor(rng() * 4)],
    band: Math.min(7, 0.5 + day * 0.22),
    activeLoops: loops,
    practiceLevels: { breath: Math.floor(rng() * 4), witness: Math.floor(rng() * 3) },
    recentIngredientIds: INGREDIENTS.slice(0, Math.floor(rng() * 4)).map((i) => i.id),
    journeyDay: day,
    witnessStability: Math.min(1, day / 40),
    ingredientPerformance,
    seed: `persona:${persona}:${day}`,
  };
}

describe("brain persona simulation", () => {
  it("holds every invariant across 50 personas × 30 days", () => {
    let compositions = 0;
    let notDueTotal = 0;
    let slotTotal = 0;
    let lateLadderHits = 0;
    let lateCompositions = 0;

    for (let persona = 0; persona < 50; persona++) {
      for (let day = 1; day <= 30; day++) {
        const ctx = personaContext(persona, day);
        const plan = composeSession(ctx);
        compositions++;

        expect(ARCHETYPE_IDS.has(plan.archetypeId), `archetype ${plan.archetypeId}`).toBe(true);
        expect(plan.slots.length, `persona ${persona} day ${day}`).toBeGreaterThan(0);

        const ids = plan.slots.map((s) => s.ingredient.id);
        expect(new Set(ids).size, "duplicate ingredients").toBe(ids.length);

        const minutes = plan.slots.reduce((sum, s) => sum + s.minutes, 0);
        expect(minutes, "budget not honoured").toBe(ctx.timeBudgetMin);

        for (const slot of plan.slots) {
          expect(slot.minutes).toBeGreaterThanOrEqual(1);
          const stepKind = slot.ingredient.stepKind
            ?? (slot.ingredient.kind === "practice" ? "practice" : slot.ingredient.kind);
          expect(RENDERABLE_KINDS.has(stepKind), `unrenderable ${stepKind}`).toBe(true);
        }

        for (const slot of plan.slots) {
          const minDay = INGREDIENT_JOURNEY_LADDER[slot.ingredient.id] ?? 0;
          slotTotal++;
          if (minDay > day) notDueTotal++;
        }

        if (day >= 21) {
          lateCompositions++;
          if (plan.slots.some((s) => (INGREDIENT_JOURNEY_LADDER[s.ingredient.id] ?? 0) >= 21)) {
            lateLadderHits++;
          }
        }

        // Determinism: same inputs, same plan.
        const again = composeSession(personaContext(persona, day));
        expect(JSON.stringify(again)).toBe(JSON.stringify(plan));
      }
    }

    expect(compositions).toBe(1500);
    const notDueShare = notDueTotal / slotTotal;
    expect(notDueShare, `not-due share ${(notDueShare * 100).toFixed(1)}%`).toBeLessThan(0.25);
    const ladderShare = lateLadderHits / Math.max(1, lateCompositions);
    expect(ladderShare, `late ladder share ${(ladderShare * 100).toFixed(1)}%`).toBeGreaterThan(0.3);
  });

  it("never returns an empty plan for a new user", () => {
    const plan = composeSession({
      gate: "morning",
      energy: "low",
      gapDays: 0,
      timeBudgetMin: 8,
      band: 0,
      activeLoops: [],
      practiceLevels: {},
      recentIngredientIds: [],
      journeyDay: 1,
      witnessStability: 0,
      seed: "new-user",
    });
    expect(plan.slots.length).toBeGreaterThan(0);
  });
});
