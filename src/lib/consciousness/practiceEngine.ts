/**
 * PRACTICE ENGINE — Decides which practice to assign next
 * Uses dimension impact matrix, spiritual DNA, active loops, and domain stress
 * Core decision logic: score each candidate practice, return highest
 */

import type { DimensionId } from '@/types/consciousness';
import type { PracticeId, CorePracticeId, PathPracticeId, PracticeLayer } from '@/types/practices';
import { CORE_PRACTICES, PATH_PRACTICES, SPECIALTY_PRACTICES, ALL_PRACTICES, getMaxLevel } from '@/types/practices';
import { DIMENSION_IMPACT_MATRIX, ENGINE_PRIORITY_WEIGHTS, getCrossPollinationSuggestion } from '@/types/dimension-matrix';

// ─── User Practice State (from DB) ───

export interface UserPracticeState {
  levels: Partial<Record<PracticeId, number>>;        // Current level per practice
  sessionsAtLevel: Partial<Record<PracticeId, number>>; // Sessions completed at current level
  qualityHistory: Partial<Record<PracticeId, number[]>>; // Last 5 quality scores per practice
  plateauDetected: PracticeId[];                       // Practices currently in plateau
}

export interface UserSpiritualDNA {
  anchorPath: PathPracticeId;   // Strongest path (confidence builder)
  growthPath: PathPracticeId;   // Weakest path (challenge)
  brainDominance: 'head' | 'heart' | 'gut';
  circadianType: string;
  traditionAffinity: string;
}

export interface EngineContext {
  /**
   * Only dimensions the user has actually been measured on. Partial on purpose:
   * fabricating zeros for unmeasured dimensions made "weakest dimension" a
   * constant, which sent every sitting at the same target.
   */
  dimensionScores: Partial<Record<DimensionId, number>>;
  practiceState: UserPracticeState;
  spiritualDNA: UserSpiritualDNA;
  activeLoops: { loopId: string; practiceId: PracticeId }[];
  lifeDomainStress: { domain: string; practiceId: PracticeId }[];
  currentBand: number;
  energy: 'low' | 'medium' | 'high';
  timeAvailableMinutes: number;
  /**
   * Additive bonus per practice, aggregated from completed mirrors by
   * `lib/mirrors/mirrorCalibration`. Deliberately additive rather than
   * overriding: a mirror can tip a decision between two close candidates,
   * but it must not outrank the foundation rules (weakest core, anchor path)
   * which exist to stop the engine recommending what the user cannot do yet.
   */
  mirrorBias?: Partial<Record<PracticeId, number>>;
}

export interface PracticeRecommendation {
  practiceId: PracticeId;
  level: number;
  score: number;
  reason: string;
  durationMinutes: number;
  isCrossPollination: boolean;
  layer: PracticeLayer;
}

// ─── Core Engine ───

/**
 * Get next practice recommendation based on full user context
 */
export function getNextPractice(ctx: EngineContext): PracticeRecommendation {
  const scores: Map<PracticeId, { score: number; reason: string; isCross: boolean }> = new Map();

  // 1. Score weakest core practice (+10)
  const weakestCore = findWeakestCore(ctx.practiceState.levels);
  if (weakestCore) {
    addScore(scores, weakestCore, ENGINE_PRIORITY_WEIGHTS.weakestCore, 'Weakest core practice');
  }

  // 2. Score anchor path (+5)
  addScore(scores, ctx.spiritualDNA.anchorPath, ENGINE_PRIORITY_WEIGHTS.anchorPath, 'Anchor path (confidence)');

  // 3. Score growth path if anchor is plateauing (+7)
  if (ctx.practiceState.plateauDetected.includes(ctx.spiritualDNA.anchorPath)) {
    addScore(scores, ctx.spiritualDNA.growthPath, ENGINE_PRIORITY_WEIGHTS.growthPath, 'Growth path (anchor plateauing)');
  }

  // 4. Active loops (+8 each)
  for (const loop of ctx.activeLoops) {
    addScore(scores, loop.practiceId, ENGINE_PRIORITY_WEIGHTS.activeLoop, `Active loop: ${loop.loopId}`);
  }

  // 5. Life domain stress (+6 each)
  for (const stress of ctx.lifeDomainStress) {
    addScore(scores, stress.practiceId, ENGINE_PRIORITY_WEIGHTS.lifeDomainStress, `Domain stress: ${stress.domain}`);
  }

  // 6. Cross-pollination for plateaued practices (+4)
  for (const plateauedId of ctx.practiceState.plateauDetected) {
    const currentLevel = ctx.practiceState.levels[plateauedId] ?? 1;
    const crossRoute = getCrossPollinationSuggestion(plateauedId, currentLevel);
    if (crossRoute) {
      const existing = scores.get(crossRoute.to);
      scores.set(crossRoute.to, {
        score: (existing?.score ?? 0) + ENGINE_PRIORITY_WEIGHTS.crossPollination,
        reason: existing?.reason ? `${existing.reason} + Cross-pollination: ${crossRoute.reason}` : `Cross-pollination: ${crossRoute.reason}`,
        isCross: true,
      });
    }
  }

  // 7. Boost practices that target weakest dimension
  const weakestDim = findWeakestDimension(ctx.dimensionScores);
  if (weakestDim) {
    for (const [practiceId, impacts] of Object.entries(DIMENSION_IMPACT_MATRIX)) {
      if (impacts[weakestDim] >= 3) {
        addScore(scores, practiceId as PracticeId, 3, `Targets weak dimension: ${weakestDim}`);
      }
    }
  }

  // 8. Mirror bias — what the completed mirrors have been pointing at.
  for (const [practiceId, bonus] of Object.entries(ctx.mirrorBias ?? {})) {
    if (!bonus) continue;
    addScore(scores, practiceId as PracticeId, bonus, 'Weighted by your mirrors');
  }

  // 9. Check specialty activation conditions
  filterByActivation(scores, ctx);

  // Find winner
  let best: PracticeRecommendation | null = null;
  for (const [practiceId, data] of scores.entries()) {
    const level = Math.min((ctx.practiceState.levels[practiceId] ?? 0) + 1, getMaxLevel(practiceId));
    const practice = ALL_PRACTICES.find(p => p.id === practiceId);
    if (!practice) continue;

    const duration = calculateDuration(ctx.energy, ctx.timeAvailableMinutes, level);

    if (!best || data.score > best.score) {
      best = {
        practiceId,
        level,
        score: data.score,
        reason: data.reason,
        durationMinutes: duration,
        isCrossPollination: data.isCross,
        layer: practice.layer,
      };
    }
  }

  // Fallback: observation L1
  return best ?? {
    practiceId: 'observation',
    level: 1,
    score: 0,
    reason: 'Default: start with observation',
    durationMinutes: 5,
    isCrossPollination: false,
    layer: 'core',
  };
}

// ─── Helper Functions ───

function addScore(
  map: Map<PracticeId, { score: number; reason: string; isCross: boolean }>,
  id: PracticeId,
  points: number,
  reason: string
) {
  const existing = map.get(id);
  map.set(id, {
    score: (existing?.score ?? 0) + points,
    reason: existing?.reason ? `${existing.reason} + ${reason}` : reason,
    isCross: existing?.isCross ?? false,
  });
}

function findWeakestCore(levels: Partial<Record<PracticeId, number>>): CorePracticeId | null {
  let weakest: CorePracticeId | null = null;
  let weakestLevel = Infinity;

  for (const p of CORE_PRACTICES) {
    const level = levels[p.id] ?? 0;
    if (level < weakestLevel) {
      weakestLevel = level;
      weakest = p.id as CorePracticeId;
    }
  }
  return weakest;
}

function findWeakestDimension(scores: Partial<Record<DimensionId, number>>): DimensionId | null {
  let weakest: DimensionId | null = null;
  let weakestScore = Infinity;
  for (const [dim, score] of Object.entries(scores) as [DimensionId, number][]) {
    if (score < weakestScore) {
      weakestScore = score;
      weakest = dim;
    }
  }
  return weakest;
}

function filterByActivation(
  scores: Map<PracticeId, { score: number; reason: string; isCross: boolean }>,
  ctx: EngineContext
) {
  // Remove specialty practices whose activation conditions aren't met
  for (const sp of SPECIALTY_PRACTICES) {
    if (!scores.has(sp.id)) continue;

    let activated = true;
    switch (sp.id) {
      case 'kriya':
        activated = (ctx.practiceState.levels['raja'] ?? 0) >= 4 && (ctx.practiceState.levels['body'] ?? 0) >= 3;
        break;
      case 'tantra':
        activated = ctx.currentBand >= 3 && (ctx.practiceState.levels['jnana'] ?? 0) >= 3;
        break;
      case 'neuroscience':
        activated = ctx.spiritualDNA.brainDominance === 'head';
        break;
      case 'emotional-healing':
        activated = (ctx.dimensionScores.emotion ?? 0) < 3;
        break;
      case 'loop-dissolution':
        activated = ctx.activeLoops.length > 0;
        break;
      // Domain practices always activated via stress detection
      default:
        break;
    }

    if (!activated) {
      scores.delete(sp.id);
    }
  }
}

function calculateDuration(energy: 'low' | 'medium' | 'high', maxTime: number, level: number): number {
  const baseDuration = energy === 'low' ? 5 : energy === 'medium' ? 10 : 15;
  const levelBonus = Math.min(level * 2, 15);
  return Math.min(baseDuration + levelBonus, maxTime);
}

/**
 * Detect plateau: same quality for 5+ sessions, no level-up
 */
export function detectPlateau(qualityHistory: number[]): boolean {
  if (qualityHistory.length < 5) return false;
  const last5 = qualityHistory.slice(-5);
  const avg = last5.reduce((a, b) => a + b, 0) / last5.length;
  const variance = last5.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / last5.length;
  // Low variance + quality not improving = plateau
  return variance < 0.02 && avg >= 0.4 && avg <= 0.75;
}

/**
 * Get the 30/50/20 session formula breakdown
 * 30% teaching, 50% practice, 20% reflection
 */
export function getSessionFormula(totalMinutes: number): {
  teachingMinutes: number;
  practiceMinutes: number;
  reflectionMinutes: number;
} {
  return {
    teachingMinutes: Math.round(totalMinutes * 0.3),
    practiceMinutes: Math.round(totalMinutes * 0.5),
    reflectionMinutes: Math.round(totalMinutes * 0.2),
  };
}
