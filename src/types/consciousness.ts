/**
 * CONSCIOUSNESS TYPES — Core type definitions for the 11-Band Spiral Journey
 * Covers: 6 Dimensions, Micro-bands, V-Level, Speed Profiles, Band Archetypes
 */

// ─── 6 Dimensions of Consciousness ───

export type DimensionId = 'thought' | 'emotion' | 'body' | 'action' | 'connection' | 'spirit';

export interface DimensionMeta {
  id: DimensionId;
  label: string;
  description: string;
  icon: string;
  maxBand: number; // thought/emotion/body/action/connection = 7, spirit = 10
  isPrimary: boolean; // Primary 4 used for V-Level calc
}

export const DIMENSIONS: DimensionMeta[] = [
  { id: 'thought',    label: 'Thought (Mind)',        description: 'Clarity of thinking, cognitive patterns, belief structures', icon: '🧠', maxBand: 7, isPrimary: true },
  { id: 'emotion',    label: 'Emotion (Heart)',       description: 'Emotional intelligence, regulation, depth of feeling',       icon: '❤️', maxBand: 7, isPrimary: true },
  { id: 'body',       label: 'Body (Gut/Instinct)',   description: 'Somatic awareness, energy sensitivity, physical intuition',  icon: '🫁', maxBand: 7, isPrimary: true },
  { id: 'action',     label: 'Action (Karma)',        description: 'Integrity of action, alignment between values and behavior', icon: '⚡', maxBand: 7, isPrimary: false },
  { id: 'connection', label: 'Connection (Relational)', description: 'Depth of relationships, empathy, community awareness',   icon: '🤝', maxBand: 7, isPrimary: false },
  { id: 'spirit',     label: 'Spirit (Awareness)',    description: 'Pure awareness, witness consciousness, non-dual perception', icon: '✨', maxBand: 10, isPrimary: true },
];

export const PRIMARY_DIMENSIONS: DimensionId[] = ['thought', 'emotion', 'body', 'spirit'];
export const INTEGRATION_DIMENSIONS: DimensionId[] = ['action', 'connection'];

// ─── Micro-Band System (x.0 / x.5 / x.9) ───

export type MicroLevel = 'entering' | 'deepening' | 'mastery';

export interface MicroBand {
  level: MicroLevel;
  suffix: number; // 0.0, 0.5, 0.9
  label: string;
  guidance: string; // How much hand-holding
}

export const MICRO_BANDS: MicroBand[] = [
  { level: 'entering',  suffix: 0.0, label: '🌱 Entering',  guidance: 'High support, small tasks, less freedom' },
  { level: 'deepening', suffix: 0.5, label: '🌿 Deepening', guidance: 'Balanced, cross-pollination starts' },
  { level: 'mastery',   suffix: 0.9, label: '🌳 Mastery',   guidance: 'Minimal guidance, user leads' },
];

// ─── 11-Band Consciousness Spectrum ───

export type BandId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface BandArchetype {
  band: BandId;
  name: string;
  title: string;
  coreState: string;       // "I AM my thoughts"
  struggle: string;
  engineApproach: string;
  isHumanJourney: boolean; // Bands 0-6
  microLabels: [string, string, string]; // x.0, x.5, x.9 labels
}

export const BAND_ARCHETYPES: BandArchetype[] = [
  {
    band: 0, name: 'THE SLEEPER', title: 'The Sleeper',
    coreState: 'I AM my thoughts.', struggle: 'Reactive, victim mindset',
    engineApproach: 'Stabilize nervous system (breath, mood tracking, validation)',
    isHumanJourney: true, microLabels: ['Deep Sleep', 'Awakening Spark', 'The Seeker'],
  },
  {
    band: 1, name: 'THE QUESTIONER', title: 'The Questioner',
    coreState: "Maybe I'm NOT my thoughts.", struggle: 'Frustration loop',
    engineApproach: 'Validate & label',
    isHumanJourney: true, microLabels: ['Doubter', 'Gap Finder', 'Pattern Spotter'],
  },
  {
    band: 2, name: 'THE OBSERVER', title: 'The Observer',
    coreState: 'I CAN be the observer.', struggle: 'Sustainability',
    engineApproach: 'Micro-interventions (3-second pause)',
    isHumanJourney: true, microLabels: ['Watcher', 'Mid-Awareness', 'Sustained Witness'],
  },
  {
    band: 3, name: 'THE ALCHEMIST', title: 'The Alchemist',
    coreState: 'Pain is a teacher.', struggle: 'Purge phase',
    engineApproach: 'Direct guidance ("This isn\'t failure, this is purging")',
    isHumanJourney: true, microLabels: ['Transformer', 'Loop Breaker', 'Golden Alchemist'],
  },
  {
    band: 4, name: 'THE NAVIGATOR', title: 'The Navigator',
    coreState: 'I can choose.', struggle: 'Fear of freedom',
    engineApproach: 'Celebration & push',
    isHumanJourney: true, microLabels: ['Conscious Chooser', 'Identity Shedder', 'Navigator'],
  },
  {
    band: 5, name: 'THE ARCHITECT', title: 'The Architect',
    coreState: 'I create my reality.', struggle: 'Final control struggle',
    engineApproach: 'Surrender nudge',
    isHumanJourney: true, microLabels: ['Life Integrator', 'Fractal Master', 'Architect'],
  },
  {
    band: 6, name: 'THE CHANNEL', title: 'The Channel',
    coreState: 'Life lives ME.', struggle: 'Flow state maintenance',
    engineApproach: 'Silence & presence (minimal words)',
    isHumanJourney: true, microLabels: ['Flow Walker', 'Deep Channel', 'Dissolving Self'],
  },
  {
    band: 7, name: 'THE RISHI', title: 'The Rishi',
    coreState: 'Turiya — 24/7 awareness.', struggle: 'None — pure being',
    engineApproach: 'Peer-level, no teaching — mutual exploration',
    isHumanJourney: false, microLabels: ['Awakened', 'Stabilized', 'Established Rishi'],
  },
  {
    band: 8, name: 'THE JAGADGURU', title: 'The Jagadguru',
    coreState: 'Universal compassion.', struggle: 'None',
    engineApproach: 'Silent presence',
    isHumanJourney: false, microLabels: ['World Teacher', 'Compassion Embodied', 'Jagadguru'],
  },
  {
    band: 9, name: 'THE AVATAR', title: 'The Avatar',
    coreState: 'Cosmic consciousness.', struggle: 'None',
    engineApproach: 'Beyond app scope',
    isHumanJourney: false, microLabels: ['Cosmic Being', 'Universal Self', 'Avatar'],
  },
  {
    band: 10, name: 'THE ABSOLUTE', title: 'The Absolute',
    coreState: 'Shunya — Only ONE exists.', struggle: 'None',
    engineApproach: 'Beyond app scope',
    isHumanJourney: false, microLabels: ['Shiva', 'Brahman', 'The Absolute'],
  },
];

// ─── V-Level (Overall Consciousness Score) ───

export interface VLevel {
  value: number;           // e.g. 2.5
  band: BandId;            // floor(value) → 2
  microLevel: MicroLevel;  // 'deepening'
  dimensionScores: Record<DimensionId, number>;
  calculatedAt: string;    // ISO timestamp
  // Server-side extensions (optional for client compatibility)
  witnessQuality?: number;
  loopPenalty?: number;
  integrationScore?: number;
}

// ─── Speed Profiles ───

export type SpeedProfileType = 'fast' | 'steady' | 'deep';

export interface SpeedProfile {
  type: SpeedProfileType;
  label: string;
  percentage: string;        // "~15% of users"
  sessionsPerLevel: [number, number]; // min-max sessions to level up
  riskFactor: string;
  protection: string;
}

export const SPEED_PROFILES: SpeedProfile[] = [
  {
    type: 'fast', label: 'Fast Tracker', percentage: '~15%',
    sessionsPerLevel: [5, 7],
    riskFactor: 'Skipping depth, intellectualizing',
    protection: 'Slow down. Feel it, don\'t just understand it.',
  },
  {
    type: 'steady', label: 'Steady Walker', percentage: '~65%',
    sessionsPerLevel: [8, 14],
    riskFactor: 'Plateauing, losing motivation',
    protection: 'Cross-pollination, new guru, variety',
  },
  {
    type: 'deep', label: 'Deep Digger', percentage: '~20%',
    sessionsPerLevel: [15, 25],
    riskFactor: 'Guilt, feeling "behind", quitting',
    protection: 'Extra support, gentler practices, ARYA returns',
  },
];

// ─── Level-Up Criteria ───

export interface LevelUpCriteria {
  qualityMin: number;
  consistencyMin: number;
  sessionsRequired: number;
  canSkipLevel: boolean;
}

export const LEVEL_UP_TRACKS: Record<string, LevelUpCriteria> = {
  fast:       { qualityMin: 0.8, consistencyMin: 5, sessionsRequired: 5,  canSkipLevel: true },
  normal:     { qualityMin: 0.6, consistencyMin: 3, sessionsRequired: 8,  canSkipLevel: false },
  slow:       { qualityMin: 0.4, consistencyMin: 1, sessionsRequired: 15, canSkipLevel: false },
  struggling: { qualityMin: 0.0, consistencyMin: 0, sessionsRequired: 99, canSkipLevel: false },
};

// ─── Quality Score Ranges ───

export interface QualityRange {
  min: number;
  max: number;
  label: string;
  action: string;
}

export const QUALITY_RANGES: QualityRange[] = [
  { min: 0.0, max: 0.3, label: 'Struggling',  action: 'Stay, adjust approach' },
  { min: 0.3, max: 0.6, label: 'Learning',    action: 'More sessions needed' },
  { min: 0.6, max: 0.8, label: 'Ready',       action: 'Level up' },
  { min: 0.8, max: 1.0, label: 'Mastered',    action: 'Can skip to +2' },
];

// ─── State vs Skill Matrix ───

export interface StateSkillCheck {
  rule: string;
  condition: string;
  action: string;
}

export const STATE_SKILL_RULES: StateSkillCheck[] = [
  {
    rule: 'Spiritual Bypassing',
    condition: 'Skill > State by 2+ levels',
    action: 'Assign grounding practice (body/emotion)',
  },
  {
    rule: 'Foundation First',
    condition: 'Observation & Breath must be within 1 level of any skill',
    action: 'Lock advanced practices until foundation catches up',
  },
  {
    rule: 'Heart > Head',
    condition: 'Emotion < Thought by 2+ levels',
    action: 'Prioritize Bhakti / feeling practices',
  },
  {
    rule: 'Integration Lock',
    condition: 'Kriya/Neti-Neti attempted but Body & Emotion < Band 2',
    action: 'Lock advanced skills until prerequisites met',
  },
];

// ─── Anti-Guilt Messages ───

export const ANTI_GUILT_MESSAGES = {
  neverSay: [
    "You're behind other users",
    "You should be at Level X by now",
    "Other people have progressed faster",
  ],
  alwaysSay: [
    "Your pace is perfect for YOU",
    "Depth matters more than speed",
    "In a spiral, you visit the same place twice. Depth is greater.",
  ],
  guiltDetected: "Bro, chill. This isn't a race.",
  durationReduceHint: "Duration auto-reduces from 5 min → 2 min for guilt-prone users",
};

// ─── Regression Handling ───

export interface RegressionPolicy {
  rule: string;
  detail: string;
}

export const REGRESSION_POLICIES: RegressionPolicy[] = [
  { rule: 'No penalty', detail: 'Level drops allowed, no streaks lost, no shame' },
  { rule: 'Session credit kept', detail: 'Previous sessions at that level still count' },
  { rule: 'Fewer to return', detail: '3 sessions at quality ≥ 0.7 instead of full requirement' },
  { rule: 'Spiral framing', detail: '"In a spiral, you visit the same place twice. Depth is greater."' },
  { rule: 'Warm-up after gap', detail: 'Skip 3+ days → level drops 0.5 for first session, then restores' },
];

// ─── Calibration Period ───

export const CALIBRATION = {
  durationDays: 30,
  maxBandDuringCalibration: 1.0,
  label: 'Universal Calibration',
  day1Title: 'Meeting Yourself Where You Are',
} as const;

// ─── Lifetime Convergence (10-year view) ───

export const LIFETIME_CONVERGENCE: Record<SpeedProfileType, { y1: number; y5: number; y10: number }> = {
  fast:   { y1: 4.5, y5: 6.2, y10: 7.1 },
  steady: { y1: 3.8, y5: 6.0, y10: 7.0 },
  deep:   { y1: 2.5, y5: 5.8, y10: 6.9 },
};
