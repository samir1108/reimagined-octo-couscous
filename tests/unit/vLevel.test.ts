/**
 * Unit Tests: Unified V-Level Calculation
 * 
 * Tests the canonical V-Level formula used by both client and server.
 * Run with: npx vitest run tests/unit/vLevel.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateVLevel,
  computeWitnessQuality,
  computeLoopPenalty,
  computeIntegrationScoreV2,
  applyTimeDecay,
  getDimensionCap,
  detectSpeedProfile,
  shouldLevelUp,
  checkBypassingRisk,
  sessionsToReturn,
  getWarmUpAdjustment,
  getBandInfo,
} from '../../src/lib/shared/vLevel';

describe('V-Level Calculation', () => {
  describe('computeWitnessQuality', () => {
    it('should compute weighted average of gap, stability, depth', () => {
      const profile = { witness_gap: 0.8, witness_stability: 0.6, witness_depth: 0.4 };
      const result = computeWitnessQuality(profile);
      // 0.4 * 0.8 + 0.35 * 0.6 + 0.25 * 0.4 = 0.32 + 0.21 + 0.10 = 0.63
      expect(result).toBeCloseTo(0.63, 2);
    });

    it('should handle missing values', () => {
      const profile = {};
      const result = computeWitnessQuality(profile);
      expect(result).toBe(0);
    });
  });

  describe('computeLoopPenalty', () => {
    it('should return 1.0 for no loops', () => {
      expect(computeLoopPenalty(undefined)).toBe(1.0);
      expect(computeLoopPenalty({})).toBe(1.0);
    });

    it('should penalize acute loops -0.05 each', () => {
      const severity = { loop1: 'acute', loop2: 'acute' };
      const result = computeLoopPenalty(severity);
      // 1.0 - 0.05 * 2 = 0.90
      expect(result).toBe(0.90);
    });

    it('should penalize active loops -0.02 each', () => {
      const severity = { loop1: 'active', loop2: 'active', loop3: 'active' };
      const result = computeLoopPenalty(severity);
      // 1.0 - 0.02 * 3 = 0.94
      expect(result).toBe(0.94);
    });

    it('should floor at 0.50', () => {
      const severity: Record<string, 'acute' | 'active'> = {};
      for (let i = 0; i < 15; i++) severity[`loop${i}`] = 'acute';
      const result = computeLoopPenalty(severity);
      expect(result).toBe(0.50);
    });
  });

  describe('computeIntegrationScoreV2', () => {
    it('should compute 4-component weighted score', () => {
      const profile = {
        v_level_baseline: 3.0,
        v_level_peak: 4.0,
        journey_day: 100,
        total_sessions: 60,
        regression: { dark_night_count: 2, baseline_highest: 3.5 },
        dimension_bands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
      };
      const result = computeIntegrationScoreV2(profile, 3.5);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it('should give low score for never-tested user with unbalanced dimensions', () => {
      const profile = {
        v_level_baseline: 1.0,
        v_level_peak: 1.0,
        journey_day: 30,
        total_sessions: 15,
        regression: { dark_night_count: 0, baseline_highest: 0 },
        dimension_bands: { thought: 3, emotion: 1, body: 1, awareness: 1 }, // unbalanced
      };
      const result = computeIntegrationScoreV2(profile, 1.0);
      // Never tested + unbalanced dimensions should score lower
      expect(result).toBeLessThan(0.7);
    });
  });

  describe('applyTimeDecay', () => {
    it('should not decay if last session was today', () => {
      const dims = { thought: 3, emotion: 2, body: 1, awareness: 2 };
      const today = new Date().toISOString();
      const result = applyTimeDecay(dims, today);
      expect(result).toEqual(dims);
    });

    it('should decay dimensions after gap', () => {
      const dims = { thought: 3, emotion: 2, body: 1, awareness: 2 };
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
      const result = applyTimeDecay(dims, tenDaysAgo);
      // 10 days * 0.01 = 0.1 decay
      expect(result.thought).toBeCloseTo(2.9, 1);
      expect(result.emotion).toBeCloseTo(1.9, 1);
    });

    it('should cap decay at 50 days', () => {
      const dims = { thought: 5, emotion: 4, body: 3, awareness: 2 };
      const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
      const result = applyTimeDecay(dims, sixtyDaysAgo);
      // 50 days * 0.01 = 0.5 max decay
      expect(result.thought).toBeCloseTo(4.5, 1);
    });

    it('should not go below zero', () => {
      const dims = { thought: 0.1, emotion: 0.1, body: 0.1, awareness: 0.1 };
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
      const result = applyTimeDecay(dims, tenDaysAgo);
      expect(result.thought).toBe(0);
      expect(result.emotion).toBe(0);
    });
  });

  describe('getDimensionCap', () => {
    it('should return 3.5 during calibration period', () => {
      expect(getDimensionCap(15, true)).toBe(3.5);
      expect(getDimensionCap(100, true)).toBe(3.5);
    });

    it('should ramp up caps by journey day', () => {
      expect(getDimensionCap(0, false)).toBe(1.5);
      expect(getDimensionCap(7, false)).toBe(2.5);
      expect(getDimensionCap(14, false)).toBe(3.5);
      expect(getDimensionCap(30, false)).toBe(4.5);
      expect(getDimensionCap(60, false)).toBe(5.5);
      expect(getDimensionCap(90, false)).toBe(6.5);
      expect(getDimensionCap(180, false)).toBe(7.0);
      expect(getDimensionCap(365, false)).toBe(7.0);
    });
  });

  describe('calculateVLevel (main formula)', () => {
    it('should compute blended score with all modifiers', () => {
      const dimensionScores = { thought: 3, emotion: 3, body: 3, awareness: 3 };
      const profile: any = {
        dimension_bands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
        witness_gap: 0.5,
        witness_stability: 0.5,
        witness_depth: 0.5,
        loop_severity: {},
        integration_score: 0.5,
        v_level_baseline: 2.0,
        v_level_peak: 3.0,
        journey_day: 100,
        total_sessions: 50,
        regression: { dark_night_count: 1, baseline_highest: 2.5 },
        last_session_at: new Date(Date.now() - 86400000).toISOString(),
      };

      const result = calculateVLevel(dimensionScores, profile);

      expect(result.value).toBeGreaterThanOrEqual(0);
      expect(result.value).toBeLessThanOrEqual(7.0);
      expect(result.band).toBeGreaterThanOrEqual(0);
      expect(result.band).toBeLessThanOrEqual(7);
      expect(['entering', 'deepening', 'mastery']).toContain(result.microLevel);
      expect(result.witnessQuality).toBeDefined();
      expect(result.loopPenalty).toBeDefined();
      expect(result.integrationScore).toBeDefined();
    });

    it('should cap at Band 1.0 during calibration (30 days)', () => {
      const dimensionScores = { thought: 5, emotion: 5, body: 5, awareness: 5 };
      const profile: any = {
        dimension_bands: { thought: 5, emotion: 5, body: 5, awareness: 5 },
        witness_gap: 1,
        witness_stability: 1,
        witness_depth: 1,
        loop_severity: {},
        integration_score: 1,
        v_level_baseline: 0,
        v_level_peak: 0,
        journey_day: 15,
        total_sessions: 10,
        regression: { dark_night_count: 0, baseline_highest: 0 },
        last_session_at: new Date().toISOString(),
      };

      const result = calculateVLevel(dimensionScores, profile);
      expect(result.value).toBeLessThanOrEqual(1.0);
    });

    it('should punish imbalance via geometric/harmonic mean', () => {
      // High spirit, low body → should be pulled down
      const imbalancedScores = { thought: 5, emotion: 5, body: 1, awareness: 5 };
      const balancedScores = { thought: 4, emotion: 4, body: 4, awareness: 4 };

      const profile: any = {
        dimension_bands: { thought: 4, emotion: 4, body: 4, awareness: 4 },
        witness_gap: 0.5,
        witness_stability: 0.5,
        witness_depth: 0.5,
        loop_severity: {},
        integration_score: 0.5,
        v_level_baseline: 3,
        v_level_peak: 4,
        journey_day: 100,
        total_sessions: 50,
        regression: { dark_night_count: 1, baseline_highest: 3.5 },
        last_session_at: new Date(Date.now() - 86400000).toISOString(),
      };

      const imbalancedResult = calculateVLevel(imbalancedScores, profile);
      const balancedResult = calculateVLevel(balancedScores, profile);

      // Balanced should score higher than imbalanced
      expect(balancedResult.value).toBeGreaterThan(imbalancedResult.value);
    });

    it('should apply loop penalty', () => {
      const dimensionScores = { thought: 3, emotion: 3, body: 3, awareness: 3 };
      const profileNoLoops: any = {
        dimension_bands: { thought: 3, emotion: 3, body: 3, awareness: 3 },
        witness_gap: 0.5,
        witness_stability: 0.5,
        witness_depth: 0.5,
        loop_severity: {},
        integration_score: 0.5,
        v_level_baseline: 2,
        v_level_peak: 3,
        journey_day: 100,
        total_sessions: 50,
        regression: { dark_night_count: 0, baseline_highest: 0 },
        last_session_at: new Date().toISOString(),
      };

      const profileWithLoops: any = {
        ...profileNoLoops,
        loop_severity: { loop1: 'acute', loop2: 'active' },
      };

      const resultNoLoops = calculateVLevel(dimensionScores, profileNoLoops);
      const resultWithLoops = calculateVLevel(dimensionScores, profileWithLoops);

      expect(resultWithLoops.value).toBeLessThan(resultNoLoops.value);
    });
  });
});

describe('Speed Profile Detection', () => {
  describe('detectSpeedProfile', () => {
    it('should return fast for low sessions + high quality', () => {
      expect(detectSpeedProfile([5, 6, 7], 0.8)).toBe('fast');
    });

    it('should return deep for high sessions', () => {
      expect(detectSpeedProfile([15, 20, 18], 0.5)).toBe('deep');
    });

    it('should return steady for middle ground', () => {
      expect(detectSpeedProfile([10, 12, 11], 0.6)).toBe('steady');
    });
  });
});

describe('Level-Up Logic', () => {
  describe('shouldLevelUp', () => {
    it('should allow skip on fast track', () => {
      const result = shouldLevelUp(0.85, 5, 5);
      expect(result.shouldLevel).toBe(true);
      expect(result.canSkip).toBe(true);
      expect(result.track).toBe('fast');
    });

    it('should allow normal level-up', () => {
      const result = shouldLevelUp(0.65, 3, 8);
      expect(result.shouldLevel).toBe(true);
      expect(result.canSkip).toBe(false);
      expect(result.track).toBe('normal');
    });

    it('should allow slow level-up', () => {
      const result = shouldLevelUp(0.45, 1, 15);
      expect(result.shouldLevel).toBe(true);
      expect(result.canSkip).toBe(false);
      expect(result.track).toBe('slow');
    });

    it('should reject struggling', () => {
      const result = shouldLevelUp(0.3, 0, 20);
      expect(result.shouldLevel).toBe(false);
      expect(result.track).toBe('struggling');
    });
  });
});

describe('Bypassing Risk', () => {
  describe('checkBypassingRisk', () => {
    it('should detect bypassing when skill > state by 2+', () => {
      const result = checkBypassingRisk(5, 2);
      expect(result.isBypassing).toBe(true);
      expect(result.gap).toBe(3);
    });

    it('should not detect when gap < 2', () => {
      const result = checkBypassingRisk(4, 3);
      expect(result.isBypassing).toBe(false);
    });
  });
});

describe('Regression Handling', () => {
  describe('sessionsToReturn', () => {
    it('should return 3 for high-quality return', () => {
      expect(sessionsToReturn(10, 0.8)).toBe(3);
    });

    it('should return proportional for lower quality', () => {
      expect(sessionsToReturn(10, 0.5)).toBe(4); // floor(10 * 0.4) = 4
    });

    it('should minimum 3', () => {
      expect(sessionsToReturn(2, 0.5)).toBe(3);
    });
  });

  describe('getWarmUpAdjustment', () => {
    it('should return no drop for gap <= 3 days', () => {
      const result = getWarmUpAdjustment(3);
      expect(result.levelDrop).toBe(0);
    });

    it('should drop 0.5 levels for gap > 3 days', () => {
      const result = getWarmUpAdjustment(5);
      expect(result.levelDrop).toBe(0.5);
      expect(result.message).toContain('ease in gently');
      expect(result.restoresAfterSessions).toBe(1);
    });
  });
});

describe('Band Info', () => {
  describe('getBandInfo', () => {
    it('should return correct band for each level', () => {
      expect(getBandInfo(0).name).toBe('THE SLEEPER');
      expect(getBandInfo(1).name).toBe('THE QUESTIONER');
      expect(getBandInfo(3).name).toBe('THE ALCHEMIST');
      expect(getBandInfo(6).name).toBe('THE CHANNEL');
      expect(getBandInfo(7).name).toBe('THE RISHI');
      expect(getBandInfo(10).name).toBe('THE ABSOLUTE');
    });

    it('should clamp out of range', () => {
      expect(getBandInfo(-1).id).toBe(0);
      expect(getBandInfo(15).id).toBe(10);
    });

    it('should include vocab and avoid lists', () => {
      const band0 = getBandInfo(0);
      expect(band0.vocab).toContain('focus');
      expect(band0.avoid).toContain('consciousness');
    });
  });
});