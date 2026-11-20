/**
 * Practice Metrics Engine
 * ─────────────────────────
 * Turns user *metrics* + a *selected duration* into a NextSessionPlan.
 *
 * Inputs (all optional → engine still works with sparse data):
 *   - constellation (per-practice weights & levels)
 *   - energy / mood
 *   - active loops
 *   - stressed domains
 *   - time slot (morning/midday/evening/night)
 *
 * Strategy:
 *   1. If a curated recipe matches the slot + duration AND aligns with user
 *      energy/loops → use composeFromRecipe.
 *   2. Otherwise → composeAuto on constellation.
 *   3. Always annotates `.why` with the metric inputs so UI can explain.
 *
 * Pure, no I/O. Safe to call client-side.
 */
import type { NextSessionPlan, ConstellationSnapshot } from "@/lib/sutra/orchestrator";
import {
  composeAuto,
  composeFromRecipe,
  currentTimeSlot,
  type TimeSlot,
} from "./composer";
import { getRecipesForSlot, type PracticeRecipe } from "./recipes";
import type { Practice } from "@/lib/sutra/practices";

export interface PracticeMetrics {
  constellation?: ConstellationSnapshot | null;
  energy?: "low" | "medium" | "high";
  mood?: "tense" | "neutral" | "open";
  activeLoops?: string[];
  stressedDomains?: string[];
  /** Force a specific slot; defaults to current clock. */
  slot?: TimeSlot;
}

function scoreRecipe(
  recipe: PracticeRecipe,
  metrics: PracticeMetrics,
  durationSec: number,
): number {
  let score = 0;
  // Time fit
  if (durationSec >= recipe.minDurationSec) score += 2;
  else return -1;

  // Energy bias on recipe character
  const energy = metrics.energy ?? "medium";
  const hasKriya = recipe.steps.some((s) => s.practice === "kriya" || s.practice === "body");
  const hasWitness = recipe.steps.some((s) => s.practice === "witness");
  if (energy === "high" && hasKriya) score += 1.5;
  if (energy === "low" && hasWitness) score += 1.5;

  // Loop alignment — inquiry/witness practices help most loops
  if (metrics.activeLoops?.length) {
    const introspective = recipe.steps.some(
      (s) => s.practice === "inquiry" || s.practice === "witness" || s.practice === "observe",
    );
    if (introspective) score += 1;
  }

  // Constellation weight: practices the user already leans into
  if (metrics.constellation?.weights) {
    const w = recipe.steps.reduce(
      (sum, s) => sum + (metrics.constellation!.weights[s.practice] ?? 0),
      0,
    );
    score += w * 2; // weights are 0..1, light bump
  }

  return score;
}

/**
 * Top-level engine. Returns a plan + the reason it chose this path.
 */
export function composePracticeFromMetrics(
  metrics: PracticeMetrics,
  durationSec: number,
): NextSessionPlan {
  const slot = metrics.slot ?? currentTimeSlot();
  const recipes = getRecipesForSlot(slot, durationSec);

  let bestRecipe: PracticeRecipe | null = null;
  let bestScore = 0;
  for (const r of recipes) {
    const s = scoreRecipe(r, metrics, durationSec);
    if (s > bestScore) {
      bestScore = s;
      bestRecipe = r;
    }
  }

  const minutes = Math.round(durationSec / 60);
  const reasonBits = [
    `${minutes}m`,
    slot,
    `energy:${metrics.energy ?? "?"}`,
    metrics.activeLoops?.length ? `${metrics.activeLoops.length} active loop(s)` : null,
  ].filter(Boolean) as string[];

  if (bestRecipe && bestScore >= 2.5) {
    const levels = metrics.constellation?.levels as Record<Practice, number> | undefined;
    const plan = composeFromRecipe(bestRecipe, durationSec, levels);
    plan.why = `Engine pick · ${bestRecipe.label} · ${reasonBits.join(" · ")}`;
    return plan;
  }

  const plan = composeAuto(metrics.constellation ?? null, durationSec);
  plan.why = `Engine auto-compose · ${reasonBits.join(" · ")}`;
  return plan;
}
