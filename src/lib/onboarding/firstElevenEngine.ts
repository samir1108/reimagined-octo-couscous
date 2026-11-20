/**
 * firstElevenEngine — adaptive planner + mapping analyzer for The First Eleven.
 * ─────────────────────────────────
 * planSession: fills a sitting's fixed `question` slots by picking the best
 *   candidate from the bank — deterministically, from what the user has
 *   already said (dimension coverage, active loops, in-sitting variety).
 *   No two users get the same eleven sittings.
 *
 * analyzeFirstEleven: folds conditioning + foundation + all sitting answers
 *   into the post-eleven mapping (band micro-level, dimensions, loops,
 *   archetype) — the payload The Mirror (Gate 4) renders and the journey
 *   picker (Gate 6) filters on.
 */
import type {
  SESession, SEQuestion, PlannedStep, SEAnswer, SEDimension,
  FirstElevenProgress, FirstElevenMapping,
} from "./firstElevenTypes";
import {
  FIRST_ELEVEN_QUESTIONS_BY_SESSION,
} from "./firstElevenQuestions";
import {
  FIRST_ELEVEN_SESSIONS,
  FIRST_ELEVEN_SESSION_NUMBER,
  FIRST_ELEVEN_TOTAL,
} from "./firstElevenSessions";
import { LOOP_CATALOG } from "@/lib/loopLibraryCatalog";
import type { ConditioningResult } from "./conditioningQuestions";
import type { FoundationAnswers } from "./foundationAnalyzer";

/** Spiral band labels — the 11 bands (0–10), spiral not ladder. */
export const SPIRAL_BANDS: { band: number; name: string; fear: string }[] = [
  { band: 0, name: "Survival", fear: "Death" },
  { band: 1, name: "Reactivity", fear: "Pain" },
  { band: 2, name: "Identity", fear: "Insignificance" },
  { band: 3, name: "Achievement", fear: "Uselessness" },
  { band: 4, name: "Belonging", fear: "Rejection" },
  { band: 5, name: "Meaning", fear: "Meaninglessness" },
  { band: 6, name: "Awareness", fear: "Fear becomes observable sensation" },
  { band: 7, name: "Witness", fear: "You are the space thoughts occur in" },
  { band: 8, name: "Surrender", fear: "Moving with the current of reality" },
  { band: 9, name: "Unity", fear: "Fear is impossible" },
  { band: 10, name: "Source", fear: "Absorption without construction" },
];

export function spiralBandLabel(band: number): string {
  const clamped = Math.max(0, Math.min(10, band));
  return SPIRAL_BANDS[Math.round(clamped)]?.name ?? "Seeker";
}

export function loopName(id: string): string {
  return LOOP_CATALOG.find((l) => l.id === id)?.name ?? id;
}

export function loopHint(id: string): string {
  return LOOP_CATALOG.find((l) => l.id === id)?.hint ?? "";
}

const DIMENSION_LABELS: Record<SEDimension, string> = {
  thought: "Mental clarity",
  emotion: "Emotional depth",
  body: "Body awareness",
  awareness: "Witness consciousness",
};

export function dimensionLabel(d: SEDimension): string {
  return DIMENSION_LABELS[d] ?? d;
}

// ── deterministic hash (stable variety per user) ──────────────────────
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1
}

export interface PlanContext {
  askedIds: ReadonlySet<string>;
  mapping: FirstElevenMapping | null;
  activeLoops: readonly string[];
  /** stable per-user seed (userId) so choices vary across users, not reloads */
  seed: string;
}

/**
 * Fill the sitting's question slots. Scoring:
 *   +3  question targets the user's weakest mapped dimension
 *   +2  question touches an already-active loop (confirmation depth)
 *   -2  in-sitting dimension repetition (variety within six minutes)
 *   +0.5..1  deterministic per-user tiebreak
 */
export function planSession(session: SESession, ctx: PlanContext): PlannedStep[] {
  const bankByRole = new Map<string, SEQuestion[]>();
  const allForSession: SEQuestion[] = [];
  for (const q of FIRST_ELEVEN_QUESTIONS_BY_SESSION(session.id)) {
    allForSession.push(q);
    const arr = bankByRole.get(q.role) ?? [];
    arr.push(q);
    bankByRole.set(q.role, arr);
  }

  const planned: PlannedStep[] = [];
  const usedDimensions = new Set<SEDimension>();

  for (const step of session.steps) {
    if (step.kind !== "question") {
      planned.push(step);
      continue;
    }

    const candidates = bankByRole.get(step.role) ?? [];
    // Prefer unasked questions for this role; if the role's pool is exhausted
    // (e.g. a re-plan), borrow an unasked question from another role of the
    // same sitting — never re-ask.
    let pool = candidates.filter((q) => !ctx.askedIds.has(q.id));
    let borrowed = false;
    if (!pool.length) {
      pool = allForSession.filter(
        (q) => q.role !== step.role && !ctx.askedIds.has(q.id)
      );
      borrowed = true;
    }
    const scored = (pool.length ? pool : []).map((q) => {
      const dimension = q.kind === "scale" ? q.dimension : q.kind === "text" ? q.dimension : undefined;
      const loops = q.kind === "scale" || q.kind === "text" ? q.loops ?? [] : [];
      let score = hashString(`${ctx.seed}:${q.id}`);

      if (borrowed) score -= 1; // role mismatch is a last resort
      if (dimension && ctx.mapping) {
        if (dimension === weakestDimension(ctx.mapping)) score += 3;
        if (usedDimensions.has(dimension)) score -= 2;
      }
      if (loops.some((l) => ctx.activeLoops.includes(l))) score += 2;
      // Later sittings favour mirror-role depth questions on ties.
      if (q.role === "mirror") score += 0.25;

      return { q, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const pick = scored[0]?.q;

    if (pick) {
      planned.push({ kind: "question", role: step.role, question: pick });
      const d = pick.kind === "scale" || pick.kind === "text" ? pick.dimension : undefined;
      if (d) usedDimensions.add(d);
    } else {
      // No bank question for this role — keep the spine intact with a
      // degenerate teaching step rather than dropping the beat.
      planned.push({
        kind: "teaching",
        title: "A silent beat",
        body: "This beat has no words today. Stay here a moment anyway.",
      });
    }
  }

  return planned;
}

function weakestDimension(m: FirstElevenMapping): SEDimension {
  return (Object.entries(m.dimensions) as [SEDimension, number][])
    .sort((a, b) => a[1] - b[1])[0]?.[0] ?? "awareness";
}

export interface AnalyzeInput {
  progress: FirstElevenProgress;
  conditioning?: ConditioningResult | null;
  foundationAnswers?: FoundationAnswers | null;
}

/**
 * Fold everything said so far into the mapping. Weights:
 *   Light Six (conditioning) 0.6 · Foundation 1.0 · each sitting answer
 *   1 + n/11 (later sittings weigh more — depth accumulates).
 */
export function analyzeFirstEleven(input: AnalyzeInput): FirstElevenMapping {
  const { progress, conditioning, foundationAnswers } = input;

  const weighted: { v: number; w: number }[] = [];
  const byDimension: Record<SEDimension, { sum: number; weight: number }> = {
    thought: { sum: 0, weight: 0 },
    emotion: { sum: 0, weight: 0 },
    body: { sum: 0, weight: 0 },
    awareness: { sum: 0, weight: 0 },
  };
  const loopScores: Record<string, number> = {};

  // 1. Light Six seed
  if (conditioning && Object.keys(conditioning.answers).length) {
    weighted.push({ v: conditioning.avgBand, w: 0.6 });
  }

  // 2. Foundation seed
  const fb = foundationBand(foundationAnswers);
  if (fb !== null) weighted.push({ v: fb, w: 1.0 });

  // 3. Sitting answers
  for (const a of progress.answers) {
    const sessionN = FIRST_ELEVEN_SESSION_NUMBER(a.sessionId) || 1;
    const w = 1 + sessionN / 11;
    weighted.push({ v: a.band, w });
    const d = byDimension[a.dimension];
    d.sum += a.band * w;
    d.weight += w;
    for (const l of a.loops ?? []) loopScores[l] = (loopScores[l] ?? 0) + w;
  }

  const totalW = weighted.reduce((s, x) => s + x.w, 0);
  const band = totalW ? clamp(weighted.reduce((s, x) => s + x.v * x.w, 0) / totalW, 0, 10) : 3;

  const dimensions = {} as Record<SEDimension, number>;
  (Object.keys(byDimension) as SEDimension[]).forEach((d) => {
    dimensions[d] = byDimension[d].weight ? clamp(byDimension[d].sum / byDimension[d].weight, 0, 10) : 3;
  });

  const loops = Object.entries(loopScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, score]) => ({ id, score: Math.round(score * 100) / 100 }));

  const summaryLines = buildSummaryLines({
    band, dimensions, loops, answered: progress.answers.length, completed: progress.completed_sessions.length,
  });

  return {
    band: Math.round(band * 10) / 10,
    bandMicro: band.toFixed(1),
    bandLabel: spiralBandLabel(band),
    dimensions: {
      thought: Math.round(dimensions.thought * 10) / 10,
      emotion: Math.round(dimensions.emotion * 10) / 10,
      body: Math.round(dimensions.body * 10) / 10,
      awareness: Math.round(dimensions.awareness * 10) / 10,
    },
    loops,
    archetypeHint: archetypeForBand(band),
    summaryLines,
    answeredCount: progress.answers.length,
    readyForJourneys: progress.completed_sessions.length >= FIRST_ELEVEN_TOTAL,
  };
}

// ── helpers ────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function archetypeForBand(band: number): string {
  if (band < 1.5) return "hermit";    // survival — withdrawn toward safety
  if (band < 2.5) return "rebel";     // reactivity — pushes back against what's false
  if (band < 4) return "seeker";      // identity — still becoming
  if (band < 5.5) return "ruler";     // achievement — holds structure, builds standing
  if (band < 6.5) return "creator";   // meaning — makes what matters
  if (band < 7.5) return "warrior";   // cuts through
  if (band < 8.5) return "lover";     // union — dissolving into the whole
  if (band < 9.5) return "sage";      // quiet clarity
  return "mystic";                    // between worlds
}

function foundationBand(answers?: FoundationAnswers | null): number | null {
  if (!answers) return null;
  const vals = Object.values(answers).filter((v) => typeof v === "number") as number[];
  // Foundation band signals live on 0–10 for choice options; guard against
  // foreign scales by only accepting values in range.
  const inRange = vals.filter((v) => v >= 0 && v <= 10);
  if (!inRange.length) return null;
  return inRange.reduce((a, b) => a + b, 0) / inRange.length;
}

function buildSummaryLines(input: {
  band: number;
  dimensions: Record<SEDimension, number>;
  loops: { id: string; score: number }[];
  answered: number;
  completed: number;
}): string[] {
  const entries = (Object.entries(input.dimensions) as [SEDimension, number][])
    .sort((a, b) => b[1] - a[1]);
  const strongest = entries[0];
  const weakest = entries[entries.length - 1];
  const lines: string[] = [];

  lines.push(
    `You are sitting at ${input.band.toFixed(1)} — ${spiralBandLabel(input.band)}. Not a ceiling; a coordinate.`
  );

  if (strongest) {
    lines.push(
      `Strongest dimension: ${dimensionLabel(strongest[0])} (${strongest[1].toFixed(1)}). Weakest: ${dimensionLabel(weakest[0])} (${weakest[1].toFixed(1)}) — that one is your door.`
    );
  }

  if (input.loops.length) {
    const top = input.loops[0];
    lines.push(`Loudest loop: ${loopName(top.id)} — "${loopHint(top.id)}"`);
  }

  if (input.answered > 0) {
    lines.push(
      `${input.answered} questions answered across ${input.completed} sitting${input.completed === 1 ? "" : "s"}. The map sharpened ${input.completed === FIRST_ELEVEN_TOTAL ? "fully" : "with every sitting"}.`
    );
  }

  return lines;
}

// Re-exported for convenience of consumers (runner UI + tests).
export { FIRST_ELEVEN_SESSIONS, FIRST_ELEVEN_SESSION_NUMBER, FIRST_ELEVEN_TOTAL };
