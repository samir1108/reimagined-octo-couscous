/**
 * Program Composer v3
 * ─────────────────────────────────────────────
 * Pure function. Takes a session template + user state, returns a
 * ComposedSession with the final atom sequence, durations, and reasoning.
 *
 * Pipeline:
 *   1. Always include `required` atoms (in template order).
 *   2. Score `optional` atoms against user state; include top picks
 *      that fit remaining time budget.
 *   3. If time still left and `fillFrom` categories given, pull best-
 *      scoring atoms from those categories.
 *   4. Scale individual atom durations to fit targetMinutes exactly.
 *
 * No I/O. No DB. Safe to call client-side or in edge functions.
 */
import type {
  Atom,
  AtomCategory,
  AtomGate,
  AtomEnergy,
  ComposedSession,
  ProgramSessionTemplate,
  SessionAtomInstance,
} from "./types";
import { ALL_ATOMS, getAtomById } from "./atoms";

// ─── User state the composer needs ───────────────────────────
export interface ComposerUserState {
  /** Current gate of day. */
  gate: AtomGate;
  /** User-reported energy. */
  energy: AtomEnergy;
  /** Max practice level the user has unlocked (0–6). */
  maxLevel: number;
  /** Active loop IDs (e.g., ["VAL001", "OVT003"]). */
  activeLoops?: string[];
  /** Atom IDs surfaced in the last 5 sessions — composer avoids repeats. */
  recentAtomIds?: string[];
  /** Time budget override; defaults to template.targetMinutes. */
  timeBudgetMin?: number;
}

// ─── Scoring weights ─────────────────────────────────────────
const W = {
  loopMatch: 4,
  gateFit: 2,
  energyFit: 1.5,
  levelFit: 2,
  freshness: 1.5,
  repeatPenalty: -3,
} as const;

function scoreAtom(atom: Atom, state: ComposerUserState): number {
  let s = 0;
  // Loop alignment
  if (atom.loopTargets && state.activeLoops) {
    const hits = atom.loopTargets.filter((l) => state.activeLoops!.includes(l)).length;
    if (hits) s += W.loopMatch * hits;
  }
  // Gate fit
  if (atom.gates.includes(state.gate) || atom.gates.includes("any")) s += W.gateFit;
  // Energy fit
  if (atom.energy.includes(state.energy)) s += W.energyFit;
  // Level fit — prefer atoms ≤ maxLevel; light bonus when atom.level matches user
  if (atom.level <= state.maxLevel) {
    s += W.levelFit;
    if (atom.level === state.maxLevel) s += 0.5;
  } else {
    s -= 2; // too advanced
  }
  // Freshness
  if (state.recentAtomIds?.includes(atom.id)) s += W.repeatPenalty;
  else s += W.freshness;
  return s;
}

function pickAtomDuration(atom: Atom, remainingSec: number, slotsLeft: number): number {
  // Aim for the typical, but shrink if budget is tight.
  const fairShare = remainingSec / Math.max(1, slotsLeft);
  const target = Math.min(atom.durationSec.typical, Math.max(atom.durationSec.min, fairShare));
  return Math.round(Math.min(atom.durationSec.max, target));
}

export function composeProgramSession(
  template: ProgramSessionTemplate,
  state: ComposerUserState,
): ComposedSession {
  const budgetMin = state.timeBudgetMin ?? template.targetMinutes;
  const budgetSec = budgetMin * 60;

  const chosen: { atom: Atom; reason: string }[] = [];
  const used = new Set<string>();

  // 1. Required atoms — in order.
  for (const id of template.required) {
    const a = getAtomById(id);
    if (a && !used.has(id)) {
      chosen.push({ atom: a, reason: "required by program" });
      used.add(id);
    }
  }

  // 2. Optional atoms — score & include while budget allows.
  const optScored = (template.optional ?? [])
    .map((id) => getAtomById(id))
    .filter((a): a is Atom => !!a && !used.has(a.id))
    .map((a) => ({ atom: a, score: scoreAtom(a, state) }))
    .sort((x, y) => y.score - x.score);

  // 3. Filler pool — atoms from fillFrom categories not yet used.
  const fillCats = template.fillFrom ?? [];
  const fillPool: { atom: Atom; score: number }[] = fillCats.length
    ? ALL_ATOMS
        .filter((a) => fillCats.includes(a.category) && !used.has(a.id))
        .map((a) => ({ atom: a, score: scoreAtom(a, state) }))
        .filter((x) => x.atom.level <= state.maxLevel)
        .sort((x, y) => y.score - x.score)
    : [];

  // Estimate current planned time to decide how many extras to add.
  const estPlannedSec = chosen.reduce(
    (s, c) => s + c.atom.durationSec.typical,
    0,
  );
  const slackSec = Math.max(0, budgetSec - estPlannedSec);
  // Allow extras to consume ~30% of slack (leaves room for scaling).
  const extraBudgetSec = Math.round(slackSec * 0.6);
  let extraUsed = 0;

  for (const cand of [...optScored, ...fillPool]) {
    if (extraUsed >= extraBudgetSec) break;
    if (used.has(cand.atom.id)) continue;
    const cost = cand.atom.durationSec.min;
    if (extraUsed + cost > extraBudgetSec) continue;
    chosen.push({
      atom: cand.atom,
      reason: optScored.find((o) => o.atom.id === cand.atom.id)
        ? "optional matched user state"
        : `filler from ${cand.atom.category}`,
    });
    used.add(cand.atom.id);
    extraUsed += cand.atom.durationSec.typical;
  }

  // 4. Allocate durations to fit budget exactly.
  const instances: SessionAtomInstance[] = [];
  let allocatedSec = 0;
  chosen.forEach((c, i) => {
    const slotsLeft = chosen.length - i;
    const remaining = Math.max(0, budgetSec - allocatedSec);
    const dur = pickAtomDuration(c.atom, remaining, slotsLeft);
    allocatedSec += dur;
    instances.push({
      atomId: c.atom.id,
      order: i + 1,
      durationSec: dur,
      reason: c.reason,
    });
  });

  // Build the human-readable "why" string.
  const why = buildWhy(template, state, chosen.length);

  return {
    sessionIndex: template.index,
    intent: template.intent,
    phase: template.phase,
    atoms: instances,
    totalSec: allocatedSec,
    why,
  };
}

function buildWhy(
  template: ProgramSessionTemplate,
  state: ComposerUserState,
  atomCount: number,
): string {
  const bits: string[] = [];
  bits.push(`${atomCount} atoms for "${template.intent}"`);
  bits.push(`${state.gate} · ${state.energy} energy · L${state.maxLevel}`);
  if (state.activeLoops?.length) {
    bits.push(`loop-aware (${state.activeLoops.length})`);
  }
  return bits.join(" — ");
}
