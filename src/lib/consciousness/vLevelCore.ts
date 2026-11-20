/**
 * V-LEVEL CORE — Shared pure computation (client + server parity)
 * Single source of truth for V-Level math. Both client and server import this.
 */

import type { DimensionId } from '@/types/consciousness';
import { PRIMARY_DIMENSIONS } from '@/types/consciousness';

export interface VLevelInput {
  dimensionBands: Record<DimensionId, number>;
  witnessGap: number;
  witnessStability: number;
  witnessDepth: number;
  loopSeverity: Record<string, string>; // "acute" | "active" | "seen" | "loosening" | "dormant" | "dissolved" | "integrated"
  integrationScore: number;
  vLevelBaseline: number;
  vLevelPeak: number;
  journeyDay: number;
  totalSessions: number;
  regression?: {
    dark_night_count: number;
    baseline_highest: number;
  };
}

export interface VLevelOutput {
  value: number;
  band: number;
  microLevel: 'entering' | 'deepening' | 'mastery';
  components: {
    blendedScore: number;
    witnessModifier: number;
    loopPenalty: number;
    integrationBonus: number;
  };
}

/** Compute witness quality from 3 components (0-1 each) */
function computeWitnessQuality(input: VLevelInput): number {
  const gap = input.witnessGap || 0;
  const stability = input.witnessStability || 0;
  const depth = input.witnessDepth || 0;
  return 0.4 * gap + 0.35 * stability + 0.25 * depth;
}

/** Integration Score v2 — peak-baseline proximity, testing depth, consistency, balance */
function computeIntegrationScoreV2(input: VLevelInput): number {
  const baseline = input.vLevelBaseline || 0;
  const peak = input.vLevelPeak || 0;
  const journeyDay = input.journeyDay || 1;
  const regression = input.regression || {};
  const darkNightCount = regression.dark_night_count || 0;
  const totalSessions = input.totalSessions || 0;

  // Component 1: Peak-Baseline Proximity (0-1)
  const peakProximity = peak > 0 ? Math.max(0, 1 - ((peak - baseline) / Math.max(peak, 0.01))) : 0;

  // Component 2: Testing Depth (0-1) — dark night recovery scores HIGHER than never tested
  const testingDepth = Math.min(1, darkNightCount > 0
    ? (regression.baseline_highest || 0) > baseline * 0.8 ? 0.8 + (darkNightCount * 0.05) : 0.4
    : Math.min(0.3, journeyDay / 100)
  );

  // Component 3: Session Consistency (0-1)
  const expectedSessions = Math.max(1, journeyDay * 0.5);
  const consistencyRatio = Math.min(1, totalSessions / expectedSessions);

  // Component 4: Dimension Balance (0-1)
  const dims = input.dimensionBands;
  const dimVals = [dims.thought || 0, dims.emotion || 0, dims.body || 0, dims.awareness || 0];
  const dimMax = Math.max(...dimVals);
  const dimMin = Math.min(...dimVals);
  const balanceScore = dimMax > 0 ? dimMin / dimMax : 0;

  const integration = 0.30 * peakProximity
    + 0.25 * testingDepth
    + 0.25 * consistencyRatio
    + 0.20 * balanceScore;

  return parseFloat(Math.max(0, Math.min(1, integration)).toFixed(3));
}

/** Main V-Level computation — pure, deterministic, no side effects */
export function computeVLevel(input: VLevelInput): VLevelOutput {
  const dims = input.dimensionBands;
  const vals = [
    dims.thought || 0,
    dims.emotion || 0,
    dims.body || 0,
    dims.awareness || 0,
  ];
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);

  // Geometric mean (zero-safe with epsilon)
  const epsilon = 0.01;
  const safeVals = vals.map(v => v + epsilon);
  const geometricMean = Math.pow(safeVals.reduce((a, b) => a * b, 1), 0.25) - epsilon;

  // Harmonic mean (stronger balance incentive)
  const harmonicMean = vals.every(v => v > 0)
    ? 4 / vals.reduce((sum, v) => sum + (1 / Math.max(0.01, v)), 0)
    : 0;

  // Blend: 40% geometric + 30% harmonic + 20% MIN + 10% MAX
  const blendedScore = 0.40 * Math.max(0, geometricMean)
    + 0.30 * harmonicMean
    + 0.20 * minVal
    + 0.10 * maxVal;

  const witnessQuality = computeWitnessQuality(input);
  const witnessModifier = 0.70 + (0.30 * witnessQuality);

  const loopSeverity = input.loopSeverity || {};
  const acuteCount = Object.values(loopSeverity).filter(s => s === "acute").length;
  const activeCount = Object.values(loopSeverity).filter(s => s === "active").length;
  const loopPenalty = Math.max(0.50, 1.0 - (0.05 * acuteCount) - (0.02 * activeCount));

  const integrationScore = computeIntegrationScoreV2(input);
  const integrationBonus = 1.0 + (0.10 * integrationScore);

  const rawVLevel = blendedScore * witnessModifier * loopPenalty * integrationBonus;
  const clampedVLevel = Math.max(0, Math.min(8.0, parseFloat(rawVLevel.toFixed(2))));

  const band = Math.floor(clampedVLevel);
  const fractional = clampedVLevel - band;
  let microLevel: 'entering' | 'deepening' | 'mastery';
  if (fractional < 0.3) microLevel = 'entering';
  else if (fractional < 0.7) microLevel = 'deepening';
  else microLevel = 'mastery';

  return {
    value: clampedVLevel,
    band,
    microLevel,
    components: {
      blendedScore: parseFloat(blendedScore.toFixed(3)),
      witnessModifier: parseFloat(witnessModifier.toFixed(3)),
      loopPenalty: parseFloat(loopPenalty.toFixed(3)),
      integrationBonus: parseFloat(integrationBonus.toFixed(3)),
    },
  };
}

/** Client-side calibration cap (30 days → max Band 1.0) */
export function applyCalibrationCap(vLevel: number, daysSinceStart: number): number {
  const CALIBRATION_DAYS = 30;
  const MAX_BAND_DURING_CALIBRATION = 1.0;
  if (daysSinceStart < CALIBRATION_DAYS) {
    return Math.min(vLevel, MAX_BAND_DURING_CALIBRATION);
  }
  return vLevel;
}

/** Time decay — dimensions fade without practice */
export function applyTimeDecay(
  dimensionBands: Record<DimensionId, number>,
  lastSessionAt: string | null
): Record<DimensionId, number> {
  if (!lastSessionAt) return dimensionBands;
  const daysSince = Math.floor(
    (Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince <= 1) return dimensionBands;
  const decayRate = 0.01 * Math.min(daysSince, 50);
  const result = { ...dimensionBands };
  for (const dim of PRIMARY_DIMENSIONS) {
    result[dim] = Math.max(0, (result[dim] || 0) - decayRate);
  }
  return result;
}

/** Warm-up adjustment after gap */
export function getWarmUpAdjustment(daysSinceLastSession: number): {
  levelDrop: number;
  message: string;
  restoresAfterSessions: number;
} {
  if (daysSinceLastSession <= 3) {
    return { levelDrop: 0, message: '', restoresAfterSessions: 0 };
  }
  return {
    levelDrop: 0.5,
    message: "Welcome back. We'll ease in gently today.",
    restoresAfterSessions: 1,
  };
}