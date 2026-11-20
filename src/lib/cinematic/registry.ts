/**
 * Cinematic Script Registry + level-aware picker.
 *
 * Maps:
 *   • practice / modeId → script
 *   • user practice level → fractal layer index
 *
 * The orchestrator (or Guide directive parser) calls `pickScript()` with
 * a hint and gets back a fully-resolved `{ script, layerIdx }`.
 */
import { supabase } from "@/lib/supabase";
import type { Practice } from "@/lib/sutra/practices";
import type { CinematicScript } from "./types";
import { kriyaEnergetic } from "./scripts/kriya-energetic";
import { pranayama } from "./scripts/pranayama";
import { witness } from "./scripts/witness";

export const CINEMATIC_SCRIPTS: CinematicScript[] = [
  kriyaEnergetic,
  pranayama,
  witness,
];

const BY_ID: Record<string, CinematicScript> = Object.fromEntries(
  CINEMATIC_SCRIPTS.map((s) => [s.id, s]),
);

export function getScriptById(id: string): CinematicScript | undefined {
  return BY_ID[id];
}

/** Pick the best cinematic script for a given practice. */
export function getScriptForPractice(practice: Practice): CinematicScript | undefined {
  return CINEMATIC_SCRIPTS.find((s) => s.practice === practice);
}

/** Resolve a user's per-practice level to a layer index in the script. */
export function resolveLayer(script: CinematicScript, userLevel: number): number {
  // userLevel is the constellation level (e.g. 0..7).
  // Map roughly: 0-1 → L0, 2-3 → L1, 4+ → L2 (capped to script max).
  let target = 0;
  if (userLevel >= 4) target = 2;
  else if (userLevel >= 2) target = 1;
  return Math.min(target, script.layers.length - 1);
}

/**
 * Look up the user's per-practice level from the constellation table.
 * Falls back to 0 if missing.
 */
export async function getUserPracticeLevel(
  userId: string,
  practice: Practice,
): Promise<number> {
  const { data } = await supabase
    .from("user_practice_constellation" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return 0;
  const lvl = Number((data as any)[`${practice}_level`]);
  return Number.isFinite(lvl) ? lvl : 0;
}

/** One-shot picker used by Guide directive handler. */
export async function pickScript(opts: {
  scriptId?: string;
  practice?: Practice;
  userId?: string | null;
}): Promise<{ script: CinematicScript; layerIdx: number } | null> {
  let script: CinematicScript | undefined;
  if (opts.scriptId) script = getScriptById(opts.scriptId);
  if (!script && opts.practice) script = getScriptForPractice(opts.practice);
  if (!script) return null;

  let level = 0;
  if (opts.userId) {
    try {
      level = await getUserPracticeLevel(opts.userId, script.practice);
    } catch {
      level = 0;
    }
  }
  return { script, layerIdx: resolveLayer(script, level) };
}
