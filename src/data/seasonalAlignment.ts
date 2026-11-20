/**
 * SEASONAL & CYCLICAL ALIGNMENT — Season/lunar phase biases
 * ──────────────────────────────────────────────────────────
 */

import type { SeasonalBias, LunarPhaseBias } from '@/types/session-config';

export const SEASONAL_BIAS: SeasonalBias = {
  winter: {
    // Inward, deep, slow
    'focus': 1.2,
    'self_inquiry': 1.5,
    'jnana': 1.3,
    'witnessing': 1.4,
    'body': 1.2,
    'sleep': 1.5,
    'healing': 1.3,
    'raja_yoga': 0.8,
    'energy': 0.7,
    'creativity': 0.9,
  },
  spring: {
    // Activation, growth, new beginnings
    'energy': 1.5,
    'raja_yoga': 1.4,
    'karma': 1.3,
    'creativity': 1.4,
    'relationship': 1.2,
    'work': 1.3,
    'sleep': 0.7,
    'healing': 0.9,
  },
  summer: {
    // Expansion, outward, social
    'bhakti': 1.4,
    'creativity': 1.5,
    'relationship': 1.4,
    'karma': 1.3,
    'work': 1.2,
    'energy': 1.3,
    'self_inquiry': 0.9,
    'sleep': 0.8,
  },
  autumn: {
    // Integration, harvest, release
    'jnana': 1.4,
    'healing': 1.5,
    'integration': 1.3,
    'witnessing': 1.2,
    'relationship': 1.2,
    'karma': 1.1,
    'sleep': 1.2,
    'energy': 0.9,
  },
};

export const LUNAR_PHASE_BIAS: LunarPhaseBias = {
  new: {
    // New moon — intention, beginning, seed
    'focus': 1.3,
    'self_inquiry': 1.4,
    'energy': 1.2,
    'karma': 1.1,
  },
  waxing: {
    // Waxing — building, growing, action
    'raja_yoga': 1.3,
    'karma': 1.4,
    'energy': 1.3,
    'creativity': 1.2,
    'work': 1.2,
  },
  full: {
    // Full moon — peak, release, celebration
    'bhakti': 1.5,
    'witnessing': 1.4,
    'relationship': 1.3,
    'creativity': 1.4,
    'healing': 1.2,
    'sleep': 0.8,
  },
  waning: {
    // Waning — letting go, reflection, rest
    'sleep': 1.5,
    'healing': 1.4,
    'witnessing': 1.3,
    'self_inquiry': 1.2,
    'body': 1.2,
    'energy': 0.7,
    'work': 0.8,
  },
};

export function getCurrentSeason(hemisphere: 'northern' | 'southern' = 'northern'): string {
  const month = new Date().getMonth(); // 0-11
  if (hemisphere === 'northern') {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  } else {
    if (month >= 2 && month <= 4) return 'autumn';
    if (month >= 5 && month <= 7) return 'winter';
    if (month >= 8 && month <= 10) return 'spring';
    return 'summer';
  }
}

export function getLunarPhase(date: Date = new Date()): string {
  // Simple lunar phase approximation
  const knownNewMoon = new Date('2026-01-01T00:00:00Z');
  const lunarCycle = 29.53058867; // days
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (daysSince % lunarCycle) / lunarCycle;
  
  if (phase < 0.125) return 'new';
  if (phase < 0.375) return 'waxing';
  if (phase < 0.625) return 'full';
  return 'waning';
}