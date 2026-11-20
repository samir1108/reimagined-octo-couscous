/**
 * Template engine for v2 programs.
 *
 * Each template knows how to compose a GeneratedSession from a TraditionPack
 * given a ProgramSessionContext. Templates differ mainly in *which* practice
 * type to bias toward and how to interpret quality scores.
 *
 * Pure, no IO, no React. Safe to call from anywhere.
 */
import type {
  GeneratedSession,
  PracticeBlock,
  ProgramArcPhase,
  ProgramSessionContext,
  SessionProgram,
  TraditionPack,
  V2Phase,
  V2TemplateId,
} from "./types";

// ─── Helpers ─────────────────────────────────────────────────

function pickPhase(arc: ProgramArcPhase[], sessionIndex: number): ProgramArcPhase {
  let cum = 0;
  for (const p of arc) {
    cum += p.sessions;
    if (sessionIndex <= cum) return p;
  }
  return arc[arc.length - 1];
}

function avg(nums: number[]): number {
  if (!nums.length) return 0.5;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function adjustLevel(
  baseLevel: number,
  ctx: ProgramSessionContext,
  phase: ProgramArcPhase,
): number {
  let level = baseLevel;
  const q = avg(ctx.recentQuality);
  // adaptive shift
  if (ctx.regressionFlag) level -= 1;
  else if (ctx.plateauDetected) level += 1; // break plateau by going deeper
  else if (q >= 0.75) level += 1;
  else if (q < 0.4) level -= 1;
  // clamp to phase range
  return Math.max(phase.levelRange[0], Math.min(phase.levelRange[1], level));
}

function pickClosest<T extends { level?: number }>(items: T[], targetLevel: number): T {
  if (!items.length) throw new Error("Empty practice library");
  return items.reduce((best, cur) => {
    const bd = Math.abs((best.level ?? 0) - targetLevel);
    const cd = Math.abs((cur.level ?? 0) - targetLevel);
    return cd < bd ? cur : best;
  });
}

function pickForPhase<T extends { phases: V2Phase[] }>(
  items: T[],
  phase: V2Phase,
  sessionIndex: number,
): T {
  const eligible = items.filter((i) => i.phases.includes(phase));
  const pool = eligible.length ? eligible : items;
  // deterministic rotation by sessionIndex so it feels structured but varied
  return pool[sessionIndex % pool.length];
}

function adjustDuration(p: PracticeBlock, available?: number): PracticeBlock {
  if (!available || available >= p.durationMinutes) return p;
  // shrink to available, never below 2 min
  const minutes = Math.max(2, Math.min(p.durationMinutes, available));
  return { ...p, durationMinutes: minutes };
}

// ─── Core composer (shared by all templates) ─────────────────

function composeSession(
  templateId: V2TemplateId,
  arc: ProgramArcPhase[],
  pack: TraditionPack,
  ctx: ProgramSessionContext,
): GeneratedSession {
  const phase = pickPhase(arc, ctx.sessionIndex);
  const level = adjustLevel(ctx.userLevel, ctx, phase);

  // teach: phase-aware rotation
  const teach = pickForPhase(pack.teach, phase.phase, ctx.sessionIndex);

  // practice: closest level match within phase-eligible (fall back to all)
  const phasePractices = pack.practices.filter(
    (p) => p.level >= phase.levelRange[0] - 1 && p.level <= phase.levelRange[1] + 1,
  );
  const practiceBase = pickClosest(
    phasePractices.length ? phasePractices : pack.practices,
    level,
  );
  const practice = adjustDuration(practiceBase, ctx.availableMinutes);

  const reflect = pickForPhase(pack.reflects, phase.phase, ctx.sessionIndex);
  const integrate = pickForPhase(pack.integrates, phase.phase, ctx.sessionIndex);

  // reason
  const reasonParts: string[] = [];
  if (ctx.sessionIndex === 1) reasonParts.push("Foundation session — orienting the path");
  if (ctx.regressionFlag) reasonParts.push("softened (recent regression)");
  else if (ctx.plateauDetected) reasonParts.push("deeper variant (plateau detected)");
  else if (avg(ctx.recentQuality) >= 0.75) reasonParts.push("level up — quality strong");
  if (ctx.availableMinutes && ctx.availableMinutes < practiceBase.durationMinutes) {
    reasonParts.push(`shortened to ~${practice.durationMinutes}m for your time`);
  }

  return {
    sessionIndex: ctx.sessionIndex,
    phase: phase.phase,
    level,
    teach: { text: teach.text, seconds: teach.seconds ?? 90 },
    practice,
    reflect: { prompt: reflect.prompt },
    integrate: { cue: integrate.cue },
    reason: reasonParts.join(" · ") || undefined,
  };
}

// ─── Public API ──────────────────────────────────────────────

export function composeProgramSession(
  program: SessionProgram,
  ctx: ProgramSessionContext,
): GeneratedSession {
  return composeSession(program.templateId, program.arc, program.pack, ctx);
}

/**
 * Decide if program is complete. Engine logic:
 *  - User has finished all arc phases AND
 *  - Last 2 quality scores >= 0.7 (Mastery threshold)
 */
export function isProgramComplete(
  program: SessionProgram,
  ctx: { sessionIndex: number; recentQuality: number[] },
): boolean {
  const totalArc = program.arc.reduce((s, p) => s + p.sessions, 0);
  if (ctx.sessionIndex < totalArc) return false;
  const last2 = ctx.recentQuality.slice(-2);
  if (last2.length < 2) return false;
  return last2.every((q) => q >= 0.7);
}

/**
 * Estimate sessions remaining (for UI "Session 5 of ~10").
 */
export function estimateRemaining(
  program: SessionProgram,
  ctx: { sessionIndex: number; recentQuality: number[] },
): number {
  const totalArc = program.arc.reduce((s, p) => s + p.sessions, 0);
  const q = avg(ctx.recentQuality);
  // higher quality → finishes closer to typical; lower → closer to max
  const target =
    q >= 0.7
      ? program.estSessions.typical
      : q < 0.4
        ? program.estSessions.max
        : Math.round((program.estSessions.typical + program.estSessions.max) / 2);
  return Math.max(0, Math.max(totalArc, target) - ctx.sessionIndex);
}
