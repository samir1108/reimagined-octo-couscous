/**
 * DIMENSION IMPACT MATRIX — How each practice impacts each dimension
 * Engine uses this to decide which practice to assign next
 */

import type { DimensionId } from './consciousness';
import type { PracticeId } from './practices';

// Impact score: 0 = no impact, 1-4 = low to max impact
export type ImpactScore = 0 | 1 | 2 | 3 | 4;

export type DimensionImpactRow = Record<DimensionId, ImpactScore>;

/**
 * The core matrix: Practice × Dimension → Impact (0-4)
 * This is the engine's decision backbone
 */
export const DIMENSION_IMPACT_MATRIX: Record<PracticeId, DimensionImpactRow> = {
  // CORE
  'observation':    { thought: 3, emotion: 1, body: 2, action: 0, connection: 0, spirit: 2 },
  'self-inquiry':   { thought: 2, emotion: 0, body: 0, action: 0, connection: 0, spirit: 1 },
  'breath':         { thought: 1, emotion: 1, body: 3, action: 0, connection: 0, spirit: 1 },
  'witnessing':     { thought: 1, emotion: 1, body: 1, action: 0, connection: 0, spirit: 3 },
  'body':           { thought: 0, emotion: 1, body: 4, action: 0, connection: 0, spirit: 1 },

  // PATH
  'bhakti':         { thought: 1, emotion: 4, body: 0, action: 1, connection: 3, spirit: 2 },
  'karma':          { thought: 2, emotion: 1, body: 3, action: 4, connection: 2, spirit: 2 },
  'jnana':          { thought: 3, emotion: 0, body: 0, action: 0, connection: 0, spirit: 1 },
  'raja':           { thought: 2, emotion: 2, body: 1, action: 2, connection: 0, spirit: 2 },

  // SPECIALTY
  'kriya':          { thought: 0, emotion: 0, body: 1, action: 1, connection: 0, spirit: 0 },
  'tantra':         { thought: 0, emotion: 1, body: 2, action: 0, connection: 1, spirit: 0 },
  'neuroscience':   { thought: 2, emotion: 1, body: 0, action: 0, connection: 0, spirit: 0 },
  'emotional-healing': { thought: 1, emotion: 4, body: 2, action: 0, connection: 1, spirit: 1 },
  'loop-dissolution':  { thought: 3, emotion: 2, body: 1, action: 1, connection: 0, spirit: 2 },
  'relationship':   { thought: 1, emotion: 2, body: 0, action: 1, connection: 4, spirit: 0 },
  'work-career':    { thought: 1, emotion: 1, body: 0, action: 3, connection: 1, spirit: 0 },
  'finance':        { thought: 1, emotion: 2, body: 0, action: 2, connection: 0, spirit: 0 },
  'health':         { thought: 0, emotion: 1, body: 4, action: 1, connection: 0, spirit: 0 },
};

// ─── Cross-Pollination Map ───

export interface CrossPollinationRoute {
  from: PracticeId;
  fromLevel: number;
  to: PracticeId;
  toLevel: number;
  reason: string;
}

export const CROSS_POLLINATION_MAP: CrossPollinationRoute[] = [
  { from: 'observation', fromLevel: 3, to: 'bhakti',     toLevel: 2, reason: 'Heart opens observation deeper' },
  { from: 'self-inquiry', fromLevel: 2, to: 'body',      toLevel: 3, reason: 'Body grounds inquiry' },
  { from: 'bhakti',      fromLevel: 4, to: 'jnana',      toLevel: 2, reason: 'Discrimination deepens devotion' },
  { from: 'karma',       fromLevel: 3, to: 'witnessing',  toLevel: 3, reason: 'Seeing patterns in action' },
  { from: 'jnana',       fromLevel: 3, to: 'bhakti',      toLevel: 2, reason: 'Heart balances intellect' },
  { from: 'breath',      fromLevel: 4, to: 'witnessing',  toLevel: 2, reason: 'Witnessing the breather' },
  { from: 'witnessing',  fromLevel: 3, to: 'self-inquiry', toLevel: 3, reason: 'Who is witnessing?' },
  { from: 'body',        fromLevel: 3, to: 'breath',      toLevel: 3, reason: 'Breath deepens body awareness' },
  { from: 'raja',        fromLevel: 4, to: 'kriya',       toLevel: 1, reason: 'Pranayama unlocks kriya path' },
];

// ─── Engine Priority Weights ───

export const ENGINE_PRIORITY_WEIGHTS = {
  weakestCore: 10,       // Weakest core practice
  anchorPath: 5,         // User's strongest path (confidence builder)
  growthPath: 7,         // Growth path when anchor plateaus
  activeLoop: 8,         // Per active loop
  lifeDomainStress: 6,   // Per stressed domain
  crossPollination: 4,   // When plateau detected
} as const;

// ─── Helper Functions ───

/**
 * Find the practice with highest impact on a given dimension
 */
export function getBestPracticeForDimension(dimension: DimensionId): PracticeId[] {
  const entries = Object.entries(DIMENSION_IMPACT_MATRIX) as [PracticeId, DimensionImpactRow][];
  return entries
    .filter(([_, row]) => row[dimension] >= 3)
    .sort((a, b) => b[1][dimension] - a[1][dimension])
    .map(([id]) => id);
}

/**
 * Get cross-pollination suggestion when a practice plateaus
 */
export function getCrossPollinationSuggestion(practiceId: PracticeId, currentLevel: number): CrossPollinationRoute | undefined {
  return CROSS_POLLINATION_MAP.find(
    route => route.from === practiceId && route.fromLevel <= currentLevel
  );
}

/**
 * Calculate dimension impact of a practice session
 */
export function getDimensionImpacts(practiceId: PracticeId): DimensionImpactRow {
  return DIMENSION_IMPACT_MATRIX[practiceId] ?? { thought: 0, emotion: 0, body: 0, action: 0, connection: 0, spirit: 0 };
}
