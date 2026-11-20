/**
 * T-SHAPE ORCHESTRATOR (v4 Theme Engine)
 *
 * Decides per-day whether to go DEEP (lean into strength), WIDE (grow weakness),
 * or BALANCED (gentle nudge to weak edge while honoring strength).
 *
 * Driven by: band, arc_type, spread, plateau, completion rate.
 */

import type { PracticeMatrixSignal } from "./practiceMatrix.ts";

export type TShapeMode = "deep" | "wide" | "balanced";

export interface TShapeInput {
  overallBand: number;
  arcType?: string | null;          // e.g. "foundation" | "consolidation" | "expansion" | "integration"
  spiralDepth?: number;
  matrix: PracticeMatrixSignal;
  completionRate7d?: number;        // 0..1
  recentlyRegressed?: boolean;
  recentlyBreakthrough?: boolean;
}

export interface TShapeDirective {
  mode: TShapeMode;
  reason: string;
  /** Concrete instruction for the AI prompt. */
  promptDirective: string;
  /** Which practice should be the theme's anchor today. */
  anchorPractice: string;
  /** L+1 hint for the anchor practice. */
  microHint: string;
}

export function decideTShape(input: TShapeInput): TShapeDirective {
  const { overallBand, arcType, matrix, completionRate7d, recentlyRegressed, recentlyBreakthrough } = input;

  // ── Hard overrides ──
  if (recentlyRegressed) {
    return buildDirective("deep", "Recent regression — return to a known strength to rebuild trust.", matrix, true);
  }

  if (matrix.plateauedPractice) {
    return buildDirective("wide", `${matrix.plateauedPractice.practice} plateaued at L${matrix.plateauedPractice.level} — pivot to a sister practice.`, matrix, false);
  }

  // ── Arc-driven ──
  const arc = (arcType || "foundation").toLowerCase();
  if (arc.includes("consolidation") || arc.includes("integration")) {
    return buildDirective("deep", `${arc} arc — go deep on what's already alive.`, matrix, true);
  }
  if (arc.includes("expansion") || arc.includes("exploration")) {
    return buildDirective("wide", `${arc} arc — widen the foundation by growing the weakest practice.`, matrix, false);
  }

  // ── Band-driven defaults ──
  if (overallBand < 2) {
    // Early band: always grow the floor (wide)
    return buildDirective("wide", "Early band — build the foundation by raising the floor.", matrix, false);
  }
  if (overallBand >= 5) {
    // Mature band: honor depth, gentle stretch
    return buildDirective("balanced", "Mature band — deepen strength with a gentle nudge to the edge.", matrix, false);
  }

  // ── Mid-band: spread + breakthrough decide ──
  if (recentlyBreakthrough && matrix.strongestPractice) {
    return buildDirective("deep", "Breakthrough on the strong path — go deeper into it.", matrix, true);
  }

  if (matrix.spread >= 3) {
    // T-shape detected → grow the weak side
    return buildDirective("wide", `T-shape detected (spread=${matrix.spread}) — grow the weak side.`, matrix, false);
  }

  // Default: balanced
  if ((completionRate7d ?? 0.5) >= 0.7) {
    return buildDirective("balanced", "Strong consistency — balanced day with one stretch.", matrix, false);
  }

  return buildDirective("wide", "Default growth posture — raise the weakest practice.", matrix, false);
}

function buildDirective(
  mode: TShapeMode,
  reason: string,
  matrix: PracticeMatrixSignal,
  preferStrong: boolean,
): TShapeDirective {
  let anchor = matrix.weakestPractice?.label || "Observation";
  let hint = matrix.microAnchor?.hint || "stay one beat longer than yesterday";

  if (preferStrong && matrix.strongestPractice) {
    anchor = matrix.strongestPractice.label;
    hint = `you're at L${matrix.strongestPractice.level} in ${anchor} — go one layer deeper than usual today`;
  }

  const lines: string[] = [];
  lines.push(`═══ T-SHAPE DIRECTIVE ═══`);
  lines.push(`Mode: ${mode.toUpperCase()} — ${reason}`);
  lines.push(`Anchor practice today: ${anchor}`);
  lines.push(`Micro-hint: ${hint}`);
  switch (mode) {
    case "deep":
      lines.push(`→ Theme should HONOR the user's depth in ${anchor}. Don't introduce new practices. Let them sit in what they already know — but at the next subtlety.`);
      break;
    case "wide":
      lines.push(`→ Theme should GENTLY introduce or strengthen ${anchor}. Frame as "you've been deep in X — now we balance with a tiny dose of Y." No overwhelm.`);
      break;
    case "balanced":
      lines.push(`→ Theme should ANCHOR in their strength but include ONE small invitation to the weak edge. 70% familiar, 30% stretch.`);
      break;
  }

  return {
    mode,
    reason,
    promptDirective: lines.join("\n"),
    anchorPractice: anchor,
    microHint: hint,
  };
}
