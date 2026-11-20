/**
 * SPEED PROFILE ENGINE — Auto-detects user speed and adapts difficulty
 * Handles: detection, adaptive micro-adjustments, guilt detection, warm-up
 */

import type { SpeedProfileType } from '@/types/consciousness';
import { SPEED_PROFILES, ANTI_GUILT_MESSAGES } from '@/types/consciousness';

// ─── Detection ───

export interface SpeedDetectionInput {
  sessionsPerLevel: number[];     // How many sessions at each level before leveling up
  averageQuality: number;         // 0-1 average quality score
  daysSinceStart: number;
  totalSessions: number;
  missedDays: number;
}

export interface SpeedDetectionResult {
  type: SpeedProfileType;
  confidence: number;             // 0-1 how confident the detection is
  reason: string;
  profile: typeof SPEED_PROFILES[number];
}

/**
 * Auto-detect speed profile from user behavior
 * Requires at least 7 days and 3 sessions for meaningful detection
 */
export function detectSpeedProfile(input: SpeedDetectionInput): SpeedDetectionResult {
  const { sessionsPerLevel, averageQuality, daysSinceStart, totalSessions, missedDays } = input;

  // Too early to detect
  if (daysSinceStart < 7 || totalSessions < 3) {
    return {
      type: 'steady',
      confidence: 0.3,
      reason: 'Not enough data yet — defaulting to steady',
      profile: SPEED_PROFILES[1],
    };
  }

  const avgSessionsPerLevel = sessionsPerLevel.length > 0
    ? sessionsPerLevel.reduce((a, b) => a + b, 0) / sessionsPerLevel.length
    : totalSessions;

  const sessionRate = totalSessions / daysSinceStart;
  const missedRate = missedDays / daysSinceStart;

  // Fast Tracker: high session rate, high quality, few sessions per level
  if (avgSessionsPerLevel <= 7 && averageQuality >= 0.7 && sessionRate >= 0.8) {
    return {
      type: 'fast',
      confidence: Math.min(0.9, 0.5 + (daysSinceStart / 30) * 0.4),
      reason: `Leveling up in ${avgSessionsPerLevel.toFixed(0)} sessions avg, quality ${(averageQuality * 100).toFixed(0)}%`,
      profile: SPEED_PROFILES[0],
    };
  }

  // Deep Digger: high missed rate OR many sessions per level OR low session rate
  if (avgSessionsPerLevel >= 15 || missedRate >= 0.5 || sessionRate <= 0.3) {
    return {
      type: 'deep',
      confidence: Math.min(0.9, 0.5 + (daysSinceStart / 30) * 0.4),
      reason: missedRate >= 0.5
        ? 'Taking time between sessions — deep integration style'
        : `${avgSessionsPerLevel.toFixed(0)} sessions per level — thorough approach`,
      profile: SPEED_PROFILES[2],
    };
  }

  // Default: Steady Walker
  return {
    type: 'steady',
    confidence: Math.min(0.85, 0.5 + (daysSinceStart / 30) * 0.35),
    reason: `Balanced pace: ${sessionRate.toFixed(1)} sessions/day, quality ${(averageQuality * 100).toFixed(0)}%`,
    profile: SPEED_PROFILES[1],
  };
}

// ─── Adaptive Difficulty ───

export type DifficultyAdjustment = 'increase' | 'decrease' | 'stabilize' | 'none';

/**
 * Micro-adjust difficulty within the same level
 */
export function getAdaptiveDifficulty(recentQualities: number[]): {
  adjustment: DifficultyAdjustment;
  reason: string;
} {
  if (recentQualities.length < 3) {
    return { adjustment: 'none', reason: 'Not enough data' };
  }

  const last3 = recentQualities.slice(-3);
  const avg = last3.reduce((a, b) => a + b, 0) / last3.length;

  // High quality for 3 sessions → increase difficulty
  if (last3.every(q => q >= 0.8)) {
    return { adjustment: 'increase', reason: 'Consistently high quality — deepening practice' };
  }

  // Low quality for 3 sessions → decrease difficulty
  if (last3.every(q => q <= 0.3)) {
    return { adjustment: 'decrease', reason: 'Adjusting to a gentler approach' };
  }

  // High variance → stabilize
  const variance = last3.reduce((sum, q) => sum + Math.pow(q - avg, 2), 0) / last3.length;
  if (variance > 0.1) {
    return { adjustment: 'stabilize', reason: 'Finding your rhythm — staying consistent for now' };
  }

  return { adjustment: 'none', reason: 'Current difficulty is appropriate' };
}

// ─── Guilt Detection ───

export interface GuiltSignals {
  daysSinceLastSession: number;
  hasApologeticLanguage: boolean;     // "sorry", "I should have"
  sessionDurationDropped: boolean;    // Duration significantly less than usual
  speedProfile: SpeedProfileType;
}

export interface GuiltResponse {
  isGuiltDetected: boolean;
  message: string;
  durationReduction: boolean;
  suggestedDurationMinutes: number;
}

/**
 * Detect guilt patterns and respond with anti-guilt messaging
 */
export function handleGuiltDetection(signals: GuiltSignals): GuiltResponse {
  const isGuilty = signals.hasApologeticLanguage ||
    (signals.daysSinceLastSession > 3 && signals.speedProfile === 'deep') ||
    signals.sessionDurationDropped;

  if (!isGuilty) {
    return {
      isGuiltDetected: false,
      message: '',
      durationReduction: false,
      suggestedDurationMinutes: 0,
    };
  }

  return {
    isGuiltDetected: true,
    message: ANTI_GUILT_MESSAGES.guiltDetected,
    durationReduction: true,
    suggestedDurationMinutes: 2, // Reduce to 2 min to lower barrier
  };
}

// ─── Warm-up After Gap ───

export interface WarmUpConfig {
  levelDrop: number;
  message: string;
  restoresAfterSessions: number;
  suggestedPractice: 'breath' | 'body' | 'observation';
}

/**
 * Get warm-up configuration after a gap in practice
 */
export function getWarmUpAfterGap(daysSinceLastSession: number): WarmUpConfig | null {
  if (daysSinceLastSession <= 3) return null;

  if (daysSinceLastSession <= 7) {
    return {
      levelDrop: 0.5,
      message: 'Welcome back. Let\'s ease in gently today.',
      restoresAfterSessions: 1,
      suggestedPractice: 'breath',
    };
  }

  if (daysSinceLastSession <= 14) {
    return {
      levelDrop: 1.0,
      message: 'The practice waited for you. No rush — let\'s begin softly.',
      restoresAfterSessions: 2,
      suggestedPractice: 'body',
    };
  }

  return {
    levelDrop: 1.5,
    message: 'Every return is a homecoming. Start fresh, carry everything.',
    restoresAfterSessions: 3,
    suggestedPractice: 'observation',
  };
}
