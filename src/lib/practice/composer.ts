/**
 * @deprecated NOT the live compose path. Session composition is owned by
 * `supabase/functions/compose-session-v3`; this practice-block composer has no
 * callers. Kept for reference only — do not wire new code to it.
 */
/**
 * Practice Composer
 * ─────────────────
 * Turns "I have N minutes" into a NextSessionPlan that can be handed to the
 * existing SessionOrchestrator. Two paths:
 *
 *   composeFromRecipe(recipe, durationSec, levels?)
 *     → uses curated step shares, picks best mode per practice for level
 *
 *   composeAuto(constellation, durationSec)
 *     → engine picks 1-4 practices weighted by user constellation
 *
 *   composeFromPicks(practices[], durationSec)
 *     → power-mode: user dragged practices into a sequence
 *
 * All three return the same NextSessionPlan shape. SessionOrchestrator.start()
 * already handles routing + step transitions, so the composer just shapes data.
 */
import type { NextSessionPlan, SessionBlock, ConstellationSnapshot } from "@/lib/sutra/orchestrator";
import { PRACTICES, PRACTICE_META, type Practice } from "@/lib/sutra/practices";
import { getModesByPractice, MODE_REGISTRY, type ModeEntry } from "@/lib/sutra/modeRegistry";
import { getRecipeById, type PracticeRecipe } from "./recipes";

const MIN_BLOCK_SEC = 30;

export type TimeSlot = "morning" | "midday" | "evening" | "night";

export function currentTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 17) return "midday";
  if (h < 21) return "evening";
  return "night";
}

/** User's average practice level — used to unlock long durations. */
export function avgLevel(c: ConstellationSnapshot | null): number {
  if (!c) return 0;
  const vals = PRACTICES.map((p) => c.levels[p] || 0);
  return vals.reduce((s, x) => s + x, 0) / vals.length;
}

/** Time chips offered for a given user. Long durations gated by avg level. */
export function availableDurations(c: ConstellationSnapshot | null): number[] {
  const base = [60, 5 * 60, 15 * 60, 30 * 60, 60 * 60];
  const lvl = avgLevel(c);
  if (lvl >= 2) base.push(2 * 60 * 60);   // 2h once user has any depth
  if (lvl >= 4) base.push(6 * 60 * 60);   // 6h half-day
  if (lvl >= 5) base.push(12 * 60 * 60);  // 12h
  if (lvl >= 6) base.push(24 * 60 * 60);  // full day for very advanced
  return base;
}

function pickModeForPractice(practice: Practice, durationSec: number, level: number): ModeEntry {
  const candidates = getModesByPractice(practice);
  if (!candidates.length) return MODE_REGISTRY[0];
  // Prefer modes whose default duration is closest to the slot's target.
  const sorted = [...candidates].sort((a, b) =>
    Math.abs(a.defaultDurationSec - durationSec) -
    Math.abs(b.defaultDurationSec - durationSec),
  );
  // Light level bias: deeper modes (longer) for higher level.
  if (level >= 3 && sorted.length > 1) {
    return sorted.slice(0, Math.min(3, sorted.length))[0];
  }
  return sorted[0];
}

function blockFromPractice(practice: Practice, durationSec: number, level: number): SessionBlock {
  const mode = pickModeForPractice(practice, durationSec, level);
  return {
    modeId: mode.id,
    label: mode.label,
    practice: mode.practice,
    surface: mode.surface,
    durationSec: Math.max(MIN_BLOCK_SEC, Math.round(durationSec)),
    route: mode.route({}),
    intro: mode.intro,
  };
}

/** Build a plan from a curated recipe scaled to durationSec. */
export function composeFromRecipe(
  recipeOrId: PracticeRecipe | string,
  durationSec: number,
  levels?: Record<Practice, number>,
): NextSessionPlan {
  const recipe = typeof recipeOrId === "string" ? getRecipeById(recipeOrId) : recipeOrId;
  if (!recipe) throw new Error(`Recipe not found: ${String(recipeOrId)}`);

  const totalShares = recipe.steps.reduce((s, x) => s + x.share, 0);
  const blocks: SessionBlock[] = recipe.steps.map((step) => {
    const slice = (durationSec * step.share) / totalShares;
    return blockFromPractice(step.practice, slice, levels?.[step.practice] ?? 0);
  });

  const primary = recipe.steps[0]?.practice ?? "observe";
  return {
    sessionTheme: { title: recipe.label, micro: recipe.description },
    blocks,
    totalDurationSec: blocks.reduce((s, b) => s + b.durationSec, 0),
    observationTail: `Notice what shifted across the ${recipe.label.toLowerCase()}.`,
    why: `Recipe: ${recipe.label} — sized to ${Math.round(durationSec / 60)} min.`,
    alternatives: [],
    axes: { constellation: null, arc: null, state: { energy: "medium", mood: "neutral", timeAvailableSec: durationSec, activeLoops: [], stressedDomains: [] }, domains: [] },
  };
}

/** Engine auto-composition: pick 1-4 practices weighted by constellation. */
export function composeAuto(
  c: ConstellationSnapshot | null,
  durationSec: number,
): NextSessionPlan {
  // How many blocks fit?
  let n = 1;
  if (durationSec >= 5 * 60)  n = 2;
  if (durationSec >= 20 * 60) n = 3;
  if (durationSec >= 45 * 60) n = 4;

  // Pick top-weighted practices, ensuring variety
  const ranked = (c ? PRACTICES : PRACTICES)
    .map((p) => ({ p, w: c?.weights[p] ?? 1 / PRACTICES.length }))
    .sort((a, b) => b.w - a.w)
    .map((x) => x.p);

  // Spiral: start with a grounding practice, end with witness/observe.
  const grounding: Practice[] = ["breath", "body"];
  const closing: Practice[]   = ["witness", "observe"];
  const picks: Practice[] = [];
  picks.push(grounding.find((g) => ranked.includes(g)) ?? ranked[0]);
  for (const p of ranked) {
    if (picks.length >= n - 1) break;
    if (!picks.includes(p) && !closing.includes(p)) picks.push(p);
  }
  if (n > 1) picks.push(closing.find((g) => !picks.includes(g)) ?? "witness");
  const finalPicks = picks.slice(0, n);

  const slice = durationSec / finalPicks.length;
  const blocks = finalPicks.map((p) => blockFromPractice(p, slice, c?.levels[p] ?? 0));

  return {
    sessionTheme: {
      title: "Composed for you",
      micro: finalPicks.map((p) => PRACTICE_META[p].label).join(" → "),
    },
    blocks,
    totalDurationSec: blocks.reduce((s, b) => s + b.durationSec, 0),
    observationTail: "Notice what is here, just now.",
    why: `Auto-composed from your constellation, sized to ${Math.round(durationSec / 60)} min.`,
    alternatives: [],
    axes: { constellation: c, arc: null, state: { energy: "medium", mood: "neutral", timeAvailableSec: durationSec, activeLoops: [], stressedDomains: [] }, domains: [] },
  };
}

/** Power-mode: user picked the practices themselves, in order. */
export function composeFromPicks(
  practices: Practice[],
  durationSec: number,
  c: ConstellationSnapshot | null,
): NextSessionPlan {
  if (!practices.length) return composeAuto(c, durationSec);
  const slice = durationSec / practices.length;
  const blocks = practices.map((p) => blockFromPractice(p, slice, c?.levels[p] ?? 0));
  return {
    sessionTheme: {
      title: "Your spiral",
      micro: practices.map((p) => PRACTICE_META[p].label).join(" → "),
    },
    blocks,
    totalDurationSec: blocks.reduce((s, b) => s + b.durationSec, 0),
    observationTail: "Notice what shifted.",
    why: `Composed by you — ${practices.length} practice${practices.length > 1 ? "s" : ""}, ${Math.round(durationSec / 60)} min.`,
    alternatives: [],
    axes: { constellation: c, arc: null, state: { energy: "medium", mood: "neutral", timeAvailableSec: durationSec, activeLoops: [], stressedDomains: [] }, domains: [] },
  };
}
