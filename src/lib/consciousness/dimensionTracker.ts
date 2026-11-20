/**
 * DIMENSION TRACKER — Tracks 6 dimension scores over time
 * Aggregates signals from practice sessions, journals, and behavioral data
 * Feeds into V-Level calculator
 */

import type { DimensionId } from '@/types/consciousness';
import { DIMENSIONS, PRIMARY_DIMENSIONS } from '@/types/consciousness';
import type { PracticeId } from '@/types/practices';
import { DIMENSION_IMPACT_MATRIX } from '@/types/dimension-matrix';

// ─── Signal Types ───

export type SignalSource = 'practice' | 'journal' | 'behavioral' | 'assessment' | 'reflection';

export interface DimensionSignal {
  dimension: DimensionId;
  delta: number;          // How much to adjust (-0.5 to +0.5 per signal)
  confidence: number;     // 0-1 how confident the signal is
  source: SignalSource;
  sourceId?: string;      // Practice ID, journal ID, etc.
  timestamp: string;
}

export interface DimensionSnapshot {
  scores: Record<DimensionId, number>;
  signalCount: Record<DimensionId, number>;
  lastUpdated: string;
  trend: Record<DimensionId, 'rising' | 'stable' | 'falling'>;
}

// ─── Core Functions ───

/**
 * Create initial dimension scores (all zeros or from assessment)
 */
export function createInitialSnapshot(
  assessmentScores?: Partial<Record<DimensionId, number>>
): DimensionSnapshot {
  const scores = {} as Record<DimensionId, number>;
  const signalCount = {} as Record<DimensionId, number>;
  const trend = {} as Record<DimensionId, 'rising' | 'stable' | 'falling'>;

  for (const dim of DIMENSIONS) {
    scores[dim.id] = assessmentScores?.[dim.id] ?? 0;
    signalCount[dim.id] = 0;
    trend[dim.id] = 'stable';
  }

  return { scores, signalCount, lastUpdated: new Date().toISOString(), trend };
}

/**
 * Generate dimension signals from a completed practice session
 */
export function generatePracticeSignals(
  practiceId: PracticeId,
  practiceLevel: number,
  qualityScore: number,   // 0-1
  durationMinutes: number
): DimensionSignal[] {
  const impacts = DIMENSION_IMPACT_MATRIX[practiceId];
  if (!impacts) return [];

  const signals: DimensionSignal[] = [];
  const timestamp = new Date().toISOString();

  for (const dim of DIMENSIONS) {
    const impact = impacts[dim.id];
    if (impact === 0) continue;

    // Delta = impact × quality × duration factor × level factor
    const durationFactor = Math.min(durationMinutes / 15, 1.5); // Caps at 1.5x for 22+ min
    const levelFactor = 1 + (practiceLevel - 1) * 0.1;          // Higher level = slightly more impact
    const delta = (impact / 4) * qualityScore * durationFactor * levelFactor * 0.1;

    signals.push({
      dimension: dim.id,
      delta: Math.round(delta * 1000) / 1000,
      confidence: Math.min(0.9, qualityScore * 0.8 + 0.1),
      source: 'practice',
      sourceId: practiceId,
      timestamp,
    });
  }

  return signals;
}

/**
 * Apply signals to update dimension snapshot
 * Uses exponential moving average weighted by confidence
 */
export function applySignals(
  snapshot: DimensionSnapshot,
  signals: DimensionSignal[]
): DimensionSnapshot {
  const newScores = { ...snapshot.scores };
  const newCounts = { ...snapshot.signalCount };
  const newTrend = { ...snapshot.trend };

  for (const signal of signals) {
    const dim = signal.dimension;
    const maxBand = DIMENSIONS.find(d => d.id === dim)?.maxBand ?? 7;

    // Weighted update
    const weightedDelta = signal.delta * signal.confidence;
    const oldScore = newScores[dim];
    newScores[dim] = Math.max(0, Math.min(maxBand, oldScore + weightedDelta));
    newCounts[dim] = (newCounts[dim] ?? 0) + 1;

    // Update trend
    const diff = newScores[dim] - oldScore;
    if (diff > 0.01) newTrend[dim] = 'rising';
    else if (diff < -0.01) newTrend[dim] = 'falling';
    else newTrend[dim] = 'stable';
  }

  return {
    scores: newScores,
    signalCount: newCounts,
    lastUpdated: new Date().toISOString(),
    trend: newTrend,
  };
}

/**
 * Find the weakest primary dimension (for engine prioritization)
 */
export function getWeakestPrimaryDimension(scores: Record<DimensionId, number>): {
  dimension: DimensionId;
  score: number;
  gap: number; // How far behind the average
} {
  const primaryScores = PRIMARY_DIMENSIONS.map(d => ({ dimension: d, score: scores[d] ?? 0 }));
  const avg = primaryScores.reduce((sum, p) => sum + p.score, 0) / primaryScores.length;
  const weakest = primaryScores.reduce((min, p) => p.score < min.score ? p : min);

  return {
    dimension: weakest.dimension,
    score: weakest.score,
    gap: avg - weakest.score,
  };
}

/**
 * Check dimension balance — are dimensions growing evenly?
 */
export function getDimensionBalance(scores: Record<DimensionId, number>): {
  isBalanced: boolean;
  maxGap: number;
  recommendation: string;
} {
  const primaryScores = PRIMARY_DIMENSIONS.map(d => scores[d] ?? 0);
  const max = Math.max(...primaryScores);
  const min = Math.min(...primaryScores);
  const gap = max - min;

  if (gap < 1.5) {
    return { isBalanced: true, maxGap: gap, recommendation: 'Dimensions are well-balanced' };
  }

  const weakest = getWeakestPrimaryDimension(scores);
  return {
    isBalanced: false,
    maxGap: gap,
    recommendation: `Focus on ${weakest.dimension} — it's ${gap.toFixed(1)} bands behind your strongest dimension`,
  };
}

/**
 * Generate daily dimension summary for DB storage
 */
export function createDailySummary(
  snapshot: DimensionSnapshot,
  dailySignals: DimensionSignal[]
): {
  thought_score: number;
  emotion_score: number;
  body_score: number;
  awareness_score: number;
  signal_count: number;
  confidence_avg: number;
} {
  const avgConfidence = dailySignals.length > 0
    ? dailySignals.reduce((sum, s) => sum + s.confidence, 0) / dailySignals.length
    : 0;

  return {
    thought_score: snapshot.scores.thought ?? 0,
    emotion_score: snapshot.scores.emotion ?? 0,
    body_score: snapshot.scores.body ?? 0,
    awareness_score: snapshot.scores.spirit ?? 0,
    signal_count: dailySignals.length,
    confidence_avg: Math.round(avgConfidence * 100) / 100,
  };
}
