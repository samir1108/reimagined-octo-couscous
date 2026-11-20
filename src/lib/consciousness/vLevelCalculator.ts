/**
 * V-LEVEL CALCULATOR — Re-exports from unified shared module
 * 
 * The canonical implementation lives in src/lib/shared/vLevel.ts
 * (which mirrors supabase/functions/_shared/vLevel.ts)
 * This file maintains backward compatibility for existing imports.
 */

export {
  calculateVLevel,
  detectSpeedProfile,
  shouldLevelUp,
  checkBypassingRisk,
  sessionsToReturn,
  getWarmUpAdjustment,
  computeWitnessQuality,
  computeLoopPenalty,
  computeIntegrationScoreV2,
  applyTimeDecay,
} from '../shared/vLevel';

export type { VLevel, SpeedProfileType } from '../shared/vLevel';