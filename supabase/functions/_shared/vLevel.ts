// ============================================================
// UNIFIED V-LEVEL CALCULATION — Single Source of Truth
// ============================================================
// Used by: client (vLevelCalculator.ts), server (consciousness-engine)
// Import in client: import { calculateVLevel } from '@/lib/shared/vLevel'
// Import in server: import { calculateVLevel } from '../_shared/vLevel.ts'

export type DimensionId = 'thought' | 'emotion' | 'body' | 'awareness' | 'action' | 'connection' | 'spirit';
export type BandId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type MicroLevel = 'entering' | 'deepening' | 'mastery';
export type SpeedProfileType = 'fast' | 'steady' | 'deep';

export interface VLevelResult {
  value: number;
  band: BandId;
  microLevel: MicroLevel;
  dimensionScores: Record<DimensionId, number>;
  calculatedAt: string;
  // Server-only extensions
  witnessQuality?: number;
  loopPenalty?: number;
  integrationScore?: number;
}

export interface DimensionScores {
  thought: number;
  emotion: number;
  body: number;
  awareness: number;
  action: number;
  connection: number;
  spirit: number;
}

export interface LoopSeverity {
  [loopId: string]: 'none' | 'active' | 'acute';
}

export interface ProfileForVLevel {
  dimension_bands: Partial<DimensionScores>;
  witness_gap?: number;
  witness_stability?: number;
  witness_depth?: number;
  loop_severity?: LoopSeverity;
  integration_score?: number;
  v_level_baseline?: number;
  v_level_peak?: number;
  journey_day?: number;
  total_sessions?: number;
  regression?: {
    dark_night_count?: number;
    baseline_highest?: number;
  };
  last_session_at?: string;
  circadian_profile?: any;
}

// Primary dimensions that drive core V-Level
const PRIMARY_DIMENSIONS: DimensionId[] = ['thought', 'emotion', 'body', 'spirit'];
const INTEGRATION_DIMENSIONS: DimensionId[] = ['action', 'connection'];

// Calibration: 30 days max Band 1.0
const CALIBRATION_DURATION_DAYS = 30;
const CALIBRATION_MAX_BAND = 1.0;

// Journey day caps per dimension (from consciousness-engine)
const DIMENSION_MAX_BY_DAY: Array<{ minDays: number; maxBand: number }> = [
  { minDays: 0, maxBand: 1.5 },
  { minDays: 7, maxBand: 2.5 },
  { minDays: 14, maxBand: 3.5 },
  { minDays: 30, maxBand: 4.5 },
  { minDays: 60, maxBand: 5.5 },
  { minDays: 90, maxBand: 6.5 },
  { minDays: 180, maxBand: 7.0 },
  { minDays: 365, maxBand: 7.5 },
  { minDays: 730, maxBand: 8.0 },
];

export function getDimensionCap(journeyDay: number, isCalibrationPeriod: boolean): number {
  if (isCalibrationPeriod) return 3.5;
  let cap = 1.5;
  for (const tier of DIMENSION_MAX_BY_DAY) {
    if (journeyDay >= tier.minDays) cap = tier.maxBand;
  }
  return cap;
}

/**
 * Compute witness quality composite (0-1)
 * 40% gap + 35% stability + 25% depth
 */
export function computeWitnessQuality(profile: ProfileForVLevel): number {
  const gap = profile.witness_gap || 0;
  const stability = profile.witness_stability || 0;
  const depth = profile.witness_depth || 0;
  return 0.4 * gap + 0.35 * stability + 0.25 * depth;
}

/**
 * Compute loop penalty from severity counts
 * Floor at 0.50, -0.05 per acute, -0.02 per active
 */
export function computeLoopPenalty(loopSeverity: LoopSeverity | undefined): number {
  if (!loopSeverity) return 1.0;
  const acuteCount = Object.values(loopSeverity).filter(s => s === 'acute').length;
  const activeCount = Object.values(loopSeverity).filter(s => s === 'active').length;
  return Math.max(0.50, 1.0 - (0.05 * acuteCount) - (0.02 * activeCount));
}

/**
 * Compute Integration Score v2
 * 30% peak-baseline proximity + 25% testing depth + 25% consistency + 20% balance
 */
export function computeIntegrationScoreV2(profile: ProfileForVLevel, vLevelCurrent: number): number {
  const baseline = profile.v_level_baseline || 0;
  const peak = profile.v_level_peak || 0;
  const journeyDay = profile.journey_day || 1;
  const regression = profile.regression || {};
  const darkNightCount = regression.dark_night_count || 0;
  const totalSessions = profile.total_sessions || 0;

  const peakProximity = peak > 0
    ? Math.max(0, 1 - ((peak - baseline) / Math.max(peak, 0.01)))
    : 0;

  const testingDepth = Math.min(1, darkNightCount > 0
    ? (regression.baseline_highest || 0) > baseline * 0.8
      ? 0.8 + (darkNightCount * 0.05)
      : 0.4
    : Math.min(0.3, journeyDay / 100)
  );

  const expectedSessions = Math.max(1, journeyDay * 0.5);
  const consistencyRatio = Math.min(1, totalSessions / expectedSessions);

  const dims = profile.dimension_bands || {};
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

/**
 * Apply time decay to dimensions
 * 0.01 per day since last session, capped at 50 days
 */
export function applyTimeDecay(dimensionBands: Partial<DimensionScores>, lastSessionAt: string | undefined): Partial<DimensionScores> {
  if (!lastSessionAt) return dimensionBands;

  const daysSince = Math.floor((Date.now() - new Date(lastSessionAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince <= 1) return dimensionBands;

  const decayRate = 0.01 * Math.min(daysSince, 50);
  const decayed: Partial<DimensionScores> = { ...dimensionBands };
  for (const dim of PRIMARY_DIMENSIONS) {
    decayed[dim] = Math.max(0, (decayed[dim] || 0) - decayRate);
  }
  return decayed;
}

/**
 * MAIN: Calculate V-Level — Canonical Formula
 * 
 * Blended score: 40% geometric mean + 30% harmonic mean + 20% min + 10% max
 * × witnessModifier (0.70 + 0.30 * witnessQuality)
 * × loopPenalty (0.50-1.0)
 * × integrationBonus (1.0 + 0.10 * integrationScore)
 * 
 * Calibration cap: 30 days → max Band 1.0
 * Dimension caps: per journey day (DIMENSION_MAX_BY_DAY)
 */
export function calculateVLevel(
  dimensionScoresInput: Partial<DimensionScores>,
  profile: ProfileForVLevel
): VLevelResult {
  // Start with input scores, apply time decay
  const dims = applyTimeDecay(dimensionScoresInput, profile.last_session_at);

  // Apply dimension caps based on journey day
  const isCalibrationPeriod = (profile.journey_day || 1) <= CALIBRATION_DURATION_DAYS;
  const dimCap = getDimensionCap(profile.journey_day || 1, isCalibrationPeriod);
  
  for (const dim of PRIMARY_DIMENSIONS) {
    if (dims[dim] !== undefined) {
      dims[dim] = Math.min(dims[dim]!, dimCap);
    }
  }

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

  // Harmonic mean
  const harmonicMean = vals.every(v => v > 0)
    ? 4 / vals.reduce((sum, v) => sum + (1 / Math.max(0.01, v)), 0)
    : 0;

  // Blended: 40% geo + 30% harmonic + 20% min + 10% max
  const blendedScore = 0.40 * Math.max(0, geometricMean)
    + 0.30 * harmonicMean
    + 0.20 * minVal
    + 0.10 * maxVal;

  // Witness modifier
  const witnessQuality = computeWitnessQuality(profile);
  const witnessModifier = 0.70 + (0.30 * witnessQuality);

  // Loop penalty
  const loopPenalty = computeLoopPenalty(profile.loop_severity);

  // Integration bonus
  const integrationScore = computeIntegrationScoreV2(profile, 0); // vLevelCurrent not needed here
  const integrationBonus = 1.0 + (0.10 * integrationScore);

  const vLevel = blendedScore * witnessModifier * loopPenalty * integrationBonus;
  const clampedValue = Math.max(0, Math.min(8.0, parseFloat(vLevel.toFixed(2))));

  // Calibration cap
  const finalValue = isCalibrationPeriod
    ? Math.min(clampedValue, CALIBRATION_MAX_BAND)
    : clampedValue;

  const value = Math.round(finalValue * 10) / 10;
  const band = Math.floor(value) as BandId;

  const fractional = value - band;
  let microLevel: MicroLevel;
  if (fractional < 0.3) microLevel = 'entering';
  else if (fractional < 0.7) microLevel = 'deepening';
  else microLevel = 'mastery';

  return {
    value,
    band,
    microLevel,
    dimensionScores: dims as Record<DimensionId, number>,
    calculatedAt: new Date().toISOString(),
    witnessQuality,
    loopPenalty,
    integrationScore,
  };
}

/**
 * Detect speed profile from session history
 */
export function detectSpeedProfile(
  sessionsPerLevel: number[],
  averageQuality: number
): SpeedProfileType {
  const avgSessions = sessionsPerLevel.length > 0
    ? sessionsPerLevel.reduce((a, b) => a + b, 0) / sessionsPerLevel.length
    : 10;

  if (avgSessions <= 7 && averageQuality >= 0.7) return 'fast';
  if (avgSessions >= 15) return 'deep';
  return 'steady';
}

/**
 * Determine if user should level up in a practice
 */
export function shouldLevelUp(
  recentQuality: number,
  consistency: number,
  sessionsAtLevel: number
): { shouldLevel: boolean; canSkip: boolean; track: string } {
  if (recentQuality >= 0.8 && consistency >= 5 && sessionsAtLevel >= 5) {
    return { shouldLevel: true, canSkip: true, track: 'fast' };
  }
  if (recentQuality >= 0.6 && consistency >= 3 && sessionsAtLevel >= 8) {
    return { shouldLevel: true, canSkip: false, track: 'normal' };
  }
  if (recentQuality >= 0.4 && consistency >= 1 && sessionsAtLevel >= 15) {
    return { shouldLevel: true, canSkip: false, track: 'slow' };
  }
  return { shouldLevel: false, canSkip: false, track: 'struggling' };
}

/**
 * Check for spiritual bypassing (skill > state by 2+)
 */
export function checkBypassingRisk(
  skillLevel: number,
  stateBand: number
): { isBypassing: boolean; gap: number; recommendation: string } {
  const gap = skillLevel - stateBand;
  if (gap >= 2) {
    return {
      isBypassing: true,
      gap,
      recommendation: 'Assign grounding practice (body awareness, emotion tracking)',
    };
  }
  return { isBypassing: false, gap, recommendation: '' };
}

/**
 * Calculate regression-aware sessions needed to return to a level
 */
export function sessionsToReturn(
  previousSessionsAtLevel: number,
  returnQuality: number
): number {
  if (returnQuality >= 0.7) return 3;
  return Math.max(3, Math.floor(previousSessionsAtLevel * 0.4));
}

/**
 * Get warm-up adjustment after a gap
 */
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
    message: 'Welcome back. We\'ll ease in gently today.',
    restoresAfterSessions: 1,
  };
}

/**
 * Band definitions with vocabulary for language adaptation
 */
export const BANDS = [
  { id: 0, name: 'THE SLEEPER', icon: '🌑', vocab: ['focus', 'energy', 'clarity', 'habits', 'patterns'], avoid: ['consciousness', 'witness', 'ego', 'awakening'] },
  { id: 1, name: 'THE QUESTIONER', icon: '🌒', vocab: ['curiosity', 'explore', 'notice', 'interesting', 'discover'], avoid: ['levels', 'progress', 'bands'] },
  { id: 2, name: 'THE OBSERVER', icon: '🌓', vocab: ['watch', 'observe', 'space', 'distance'], avoid: ['advanced spiritual terms'] },
  { id: 3, name: 'THE ALCHEMIST', icon: '🌔', vocab: ['transform', 'pattern', 'mirror', 'teacher', 'shadow'], avoid: ['enlightenment', 'transcendence'] },
  { id: 4, name: 'THE NAVIGATOR', icon: '🌕', vocab: ['choose', 'respond', 'space', 'freedom', 'conscious'], avoid: ['clinical terms'] },
  { id: 5, name: 'THE ARCHITECT', icon: '🌌', vocab: ['create', 'align', 'inner knowing', 'architect'], avoid: ['external authority'] },
  { id: 6, name: 'THE CHANNEL', icon: '🌈', vocab: ['flow', 'surrender', 'channel', 'grace'], avoid: ['effort', 'striving'] },
  { id: 7, name: 'THE RISHI', icon: '✦', vocab: ['silence', 'space', 'being'], avoid: ['everything'] },
  { id: 8, name: 'THE JAGADGURU', icon: '✦', vocab: ['compassion', 'service', 'unity'], avoid: ['everything'] },
  { id: 9, name: 'THE AVATAR', icon: '✦', vocab: ['presence', 'cosmic'], avoid: ['everything'] },
  { id: 10, name: 'THE ABSOLUTE', icon: '✦', vocab: ['silence', 'oneness'], avoid: ['everything'] },
] as const;

export function getBandInfo(band: number) {
  const clampedBand = Math.min(10, Math.max(0, Math.floor(band)));
  return BANDS[clampedBand];
}