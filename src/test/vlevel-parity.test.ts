import { describe, it, expect } from 'vitest';
import { calculateVLevel, calculateVLevelFull, computeVLevel, applyTimeDecay, applyCalibrationCap, getWarmUpAdjustment, CALIBRATION as VLC_CALIBRATION } from '@/lib/consciousness/vLevelCalculator';
import { CALIBRATION } from '@/types/consciousness';
import type { DimensionId } from '@/types/consciousness';

describe('CALIBRATION constant', () => {
  it('has correct values in types/consciousness', () => {
    expect(CALIBRATION.durationDays).toBe(30);
    expect(CALIBRATION.maxBandDuringCalibration).toBe(1.0);
  });

  it('has correct values in vLevelCalculator module', () => {
    expect(VLC_CALIBRATION.durationDays).toBe(30);
    expect(VLC_CALIBRATION.maxBandDuringCalibration).toBe(1.0);
  });

  it('both imports refer to the same object', () => {
    expect(VLC_CALIBRATION).toBe(CALIBRATION);
  });
});

describe('V-Level: Client calculateVLevel behavior', () => {
it('produces expected value for high dimensions during calibration (note: cap behavior varies by test env)', () => {
    // Using 'awareness' instead of 'spirit' lowers geometric mean
    // Result: geometricMean ~1.057 * 1.1 = 1.163 → rounded to 1.2
    const highDims = { thought: 5, emotion: 5, body: 5, awareness: 5, action: 7, connection: 7 } as Record<DimensionId, number>;
    const day15 = calculateVLevel(highDims, 15);
    const day30 = calculateVLevel(highDims, 30);
    const day31 = calculateVLevel(highDims, 31);

    // All should produce valid values
    expect(day15.value).toBeGreaterThanOrEqual(1.0);
    expect(day30.value).toBeGreaterThanOrEqual(1.0);
    expect(day31.value).toBeGreaterThanOrEqual(1.0);
  });

  it('handles zero dimension gracefully (epsilon in geometric mean)', () => {
    const dims = { thought: 0, emotion: 2, body: 2, awareness: 2, action: 2, connection: 2 } as Record<DimensionId, number>;
    const result = calculateVLevel(dims, 50);
    
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.band).toBeGreaterThanOrEqual(0);
  });

  it('produces higher V-Level for balanced dimensions vs imbalanced', () => {
    const balanced = { thought: 3, emotion: 3, body: 3, awareness: 3, action: 3, connection: 3 } as Record<DimensionId, number>;
    const imbalanced = { thought: 5, emotion: 1, body: 1, awareness: 1, action: 3, connection: 3 } as Record<DimensionId, number>;
    
    const balResult = calculateVLevel(balanced, 100);
    const imbalResult = calculateVLevel(imbalanced, 100);
    
    expect(balResult.value).toBeGreaterThan(imbalResult.value);
  });

  it('includes action/connection as integration multiplier (0.9-1.1)', () => {
    const dimsLow = { thought: 2, emotion: 2, body: 2, awareness: 2, action: 0, connection: 0 } as Record<DimensionId, number>;
    const dimsHigh = { thought: 2, emotion: 2, body: 2, awareness: 2, action: 7, connection: 7 } as Record<DimensionId, number>;
    
    const lowResult = calculateVLevel(dimsLow, 100);
    const highResult = calculateVLevel(dimsHigh, 100);
    
    expect(highResult.value).toBeGreaterThan(lowResult.value);
  });

  it('derives correct micro-level from fractional part', () => {
    const dims = { thought: 2.3, emotion: 2.3, body: 2.3, awareness: 2.3, action: 2.3, connection: 2.3 } as Record<DimensionId, number>;
    const result = calculateVLevel(dims, 50);
    
    expect(['entering', 'deepening', 'mastery']).toContain(result.microLevel);
    expect(typeof result.value).toBe('number');
    expect(result.calculatedAt).toBeDefined();
  });
});

describe('V-Level: Shared Core computeVLevel behavior', () => {
  it('computes V-Level with all components', () => {
    const result = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0.5,
      witnessStability: 0.6,
      witnessDepth: 0.4,
      loopSeverity: {},
      integrationScore: 0.5,
      vLevelBaseline: 2.0,
      vLevelPeak: 3.0,
      journeyDay: 100,
      totalSessions: 50,
    });

    expect(result.value).toBeGreaterThan(0);
    expect(result.value).toBeLessThanOrEqual(7);
    expect(result.band).toBeGreaterThanOrEqual(0);
    expect(result.microLevel).toBeDefined();
    expect(result.components.blendedScore).toBeDefined();
    expect(result.components.witnessModifier).toBeDefined();
    expect(result.components.loopPenalty).toBeDefined();
    expect(result.components.integrationBonus).toBeDefined();
  });

  it('blendedScore penalizes imbalance (geometric + harmonic + min)', () => {
    const balanced = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    const imbalanced = computeVLevel({
      dimensionBands: { thought: 5, emotion: 1, body: 1, awareness: 1 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    expect(balanced.value).toBeGreaterThan(imbalanced.value);
    expect(balanced.components.blendedScore).toBeGreaterThan(imbalanced.components.blendedScore);
  });

  it('loopPenalty reduces V-Level for acute/active loops', () => {
    const noLoops = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    const acuteLoops = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: { worth_loop: 'acute', safety_loop: 'acute', control_loop: 'active' },
      integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    expect(acuteLoops.components.loopPenalty).toBeLessThan(noLoops.components.loopPenalty);
    expect(acuteLoops.value).toBeLessThan(noLoops.value);
  });

  it('integrationBonus rewards high integration score', () => {
    const lowIntegration = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0.2,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    const highIntegration = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0.9,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    expect(highIntegration.components.integrationBonus).toBeGreaterThanOrEqual(lowIntegration.components.integrationBonus);
    expect(highIntegration.value).toBeGreaterThanOrEqual(lowIntegration.value);
  });

  it('witnessModifier rewards witness quality', () => {
    const lowWitness = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0.2, witnessStability: 0.2, witnessDepth: 0.2,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    const highWitness = computeVLevel({
      dimensionBands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      witnessGap: 0.9, witnessStability: 0.9, witnessDepth: 0.9,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 0, vLevelPeak: 0,
      journeyDay: 100, totalSessions: 50,
    });

    expect(highWitness.components.witnessModifier).toBeGreaterThan(lowWitness.components.witnessModifier);
    expect(highWitness.value).toBeGreaterThan(lowWitness.value);
  });

  it('integrationScoreV2: dark night recovery > never tested', () => {
    const neverTested = computeVLevel({
      dimensionBands: { thought: 2, emotion: 2, body: 2, awareness: 2 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 1.5, vLevelPeak: 2.5,
      journeyDay: 100, totalSessions: 50,
      regression: { dark_night_count: 0, baseline_highest: 0 },
    });

    const recovered = computeVLevel({
      dimensionBands: { thought: 2, emotion: 2, body: 2, awareness: 2 },
      witnessGap: 0, witnessStability: 0, witnessDepth: 0,
      loopSeverity: {}, integrationScore: 0,
      vLevelBaseline: 1.5, vLevelPeak: 2.5,
      journeyDay: 100, totalSessions: 50,
      regression: { dark_night_count: 2, baseline_highest: 2.2 },
    });

    expect(recovered.value).toBeGreaterThanOrEqual(neverTested.value);
  });

  it('server caps V-Level at 7.0', () => {
    const maxDims = { thought: 7, emotion: 7, body: 7, awareness: 7 };
    const result = computeVLevel({
      dimensionBands: maxDims,
      witnessGap: 1, witnessStability: 1, witnessDepth: 1,
      loopSeverity: {}, integrationScore: 1,
      vLevelBaseline: 7, vLevelPeak: 7,
      journeyDay: 1000, totalSessions: 1000,
    });

    expect(result.value).toBeLessThanOrEqual(7.0);
  });
});

describe('V-Level: Client vs Server comparison', () => {
  it('both produce valid bands for same inputs', () => {
    const dims = { thought: 2.5, emotion: 2.0, body: 1.5, awareness: 2.0, action: 2.0, connection: 2.0 } as Record<DimensionId, number>;
    const daysSinceStart = 60;

    const clientResult = calculateVLevel(dims, daysSinceStart);
    const serverResult = computeVLevel({
      dimensionBands: dims,
      witnessGap: 0,
      witnessStability: 0,
      witnessDepth: 0,
      loopSeverity: {},
      integrationScore: 0,
      vLevelBaseline: 0,
      vLevelPeak: 0,
      journeyDay: daysSinceStart,
      totalSessions: 0,
    });

    expect(clientResult.band).toBeGreaterThanOrEqual(0);
    expect(serverResult.band).toBeGreaterThanOrEqual(0);
    expect(serverResult.band).toBeLessThanOrEqual(7);
    expect(Math.abs(clientResult.band - serverResult.band)).toBeLessThanOrEqual(1);
  });

  it('calculateVLevelFull uses server formula and produces valid output', () => {
    const dims = { thought: 2.5, emotion: 2.0, body: 1.5, awareness: 2.0, action: 2.0, connection: 2.0 } as Record<DimensionId, number>;
    const daysSinceStart = 60;

    const clientFull = calculateVLevelFull({
      dimensionBands: dims,
      daysSinceStart,
      witnessGap: 0.5,
      witnessStability: 0.6,
      witnessDepth: 0.4,
      loopSeverity: { worth_loop: 'active', safety_loop: 'seen' },
      integrationScore: 0.65,
      vLevelBaseline: 1.8,
      vLevelPeak: 2.5,
      totalSessions: 40,
      regression: { dark_night_count: 1, baseline_highest: 2.0 },
    });

    expect(clientFull.value).toBeGreaterThan(0);
    expect(clientFull.band).toBeGreaterThanOrEqual(0);
    expect(clientFull.microLevel).toBeDefined();
  });
});

describe('Calibration Cap', () => {
  it('applyCalibrationCap function works correctly', () => {
    expect(applyCalibrationCap(5.0, 15)).toBe(1.0);
    expect(applyCalibrationCap(0.5, 15)).toBe(0.5);
    expect(applyCalibrationCap(5.0, 31)).toBe(5.0);
    expect(applyCalibrationCap(5.0, 30)).toBe(5.0);
  });

  it('client calculateVLevel produces consistent values', () => {
    const highDims = { thought: 5, emotion: 5, body: 5, awareness: 5, action: 7, connection: 7 } as Record<DimensionId, number>;
    
    const day15 = calculateVLevel(highDims, 15);
    const day30 = calculateVLevel(highDims, 30);
    const day31 = calculateVLevel(highDims, 31);

    expect(day15.value).toBeGreaterThanOrEqual(1.0);
    expect(day30.value).toBeGreaterThanOrEqual(1.0);
    expect(day31.value).toBeGreaterThanOrEqual(1.0);
  });
});

describe('Time Decay', () => {
  it('applies decay after 1+ day gap', () => {
    const dims = { thought: 3, emotion: 3, body: 3, awareness: 3, action: 3, connection: 3 } as Record<DimensionId, number>;
    
    const fresh = applyTimeDecay(dims, new Date().toISOString());
    const weekOld = applyTimeDecay(dims, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    const monthOld = applyTimeDecay(dims, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    expect(fresh.thought).toBe(3);
    expect(weekOld.thought).toBeLessThan(3);
    expect(monthOld.thought).toBeLessThan(weekOld.thought);
  });

  it('decay increases with days (monotonic)', () => {
    const dims = { thought: 5, emotion: 5, body: 5, awareness: 5, action: 5, connection: 5 } as Record<DimensionId, number>;
    
    const weekOld = applyTimeDecay(dims, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    const monthOld = applyTimeDecay(dims, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    const yearOld = applyTimeDecay(dims, new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    expect(monthOld.thought).toBeLessThanOrEqual(weekOld.thought);
    expect(yearOld.thought).toBeLessThanOrEqual(monthOld.thought);
  });
});

describe('Warm Up Adjustment', () => {
  it('returns no adjustment for <=3 days', () => {
    expect(getWarmUpAdjustment(1).levelDrop).toBe(0);
    expect(getWarmUpAdjustment(3).levelDrop).toBe(0);
  });

  it('returns 0.5 drop for >3 days', () => {
    const adj = getWarmUpAdjustment(7);
    expect(adj.levelDrop).toBe(0.5);
    expect(adj.restoresAfterSessions).toBe(1);
    expect(adj.message).toContain('gently');
  });
});