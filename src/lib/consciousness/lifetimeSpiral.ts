/**
 * 10-Phase Lifetime Spiral
 *
 * Maps a user's overall progress (V-Level + days active + breakthroughs)
 * to one of 10 lifetime phases. Each phase has its own teaching depth,
 * preferred practices, and guru archetypes.
 *
 * Phase 10 is "Beyond" — the app shifts to silent/minimal mode.
 */

export type LifetimePhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PhaseProfile {
  phase: LifetimePhase;
  name: string;
  description: string;
  minVLevel: number;
  minDaysActive: number;
  minBreakthroughs: number;
  teachingDepth: "foundational" | "intermediate" | "advanced" | "subtle" | "silent";
  primaryFocus: string;
  uiMode: "guided" | "adaptive" | "minimal" | "silent";
}

export const LIFETIME_PHASES: PhaseProfile[] = [
  {
    phase: 1,
    name: "Awakening",
    description: "First contact with witnessing. Curiosity, hesitation, glimpses.",
    minVLevel: 0,
    minDaysActive: 0,
    minBreakthroughs: 0,
    teachingDepth: "foundational",
    primaryFocus: "Building the habit of pause",
    uiMode: "guided",
  },
  {
    phase: 2,
    name: "Foundation",
    description: "Routine forms. Loops are seen but still binding.",
    minVLevel: 1.5,
    minDaysActive: 14,
    minBreakthroughs: 1,
    teachingDepth: "foundational",
    primaryFocus: "Daily presence anchors",
    uiMode: "guided",
  },
  {
    phase: 3,
    name: "Discipline",
    description: "Practice becomes consistent. Inner observer strengthens.",
    minVLevel: 2.5,
    minDaysActive: 45,
    minBreakthroughs: 3,
    teachingDepth: "intermediate",
    primaryFocus: "Sustained sadhana",
    uiMode: "adaptive",
  },
  {
    phase: 4,
    name: "Stillness",
    description: "Body and mind begin to settle. Restlessness loosens.",
    minVLevel: 3.5,
    minDaysActive: 90,
    minBreakthroughs: 5,
    teachingDepth: "intermediate",
    primaryFocus: "Deepening meditation",
    uiMode: "adaptive",
  },
  {
    phase: 5,
    name: "Inquiry",
    description: "Self-questioning matures. 'Who am I?' becomes a living question.",
    minVLevel: 4.5,
    minDaysActive: 150,
    minBreakthroughs: 8,
    teachingDepth: "advanced",
    primaryFocus: "Atma-vichara",
    uiMode: "adaptive",
  },
  {
    phase: 6,
    name: "Non-Dual Glimpses",
    description: "Subject/object boundary thins. Witness rests as awareness.",
    minVLevel: 5.5,
    minDaysActive: 240,
    minBreakthroughs: 12,
    teachingDepth: "advanced",
    primaryFocus: "Resting as awareness",
    uiMode: "minimal",
  },
  {
    phase: 7,
    name: "Subtle Practice",
    description: "Energetic and pranic awareness arises. Kriya unfolds naturally.",
    minVLevel: 6.5,
    minDaysActive: 365,
    minBreakthroughs: 18,
    teachingDepth: "subtle",
    primaryFocus: "Pranic body",
    uiMode: "minimal",
  },
  {
    phase: 8,
    name: "Integration",
    description: "Practice and life merge. Action arises without doer.",
    minVLevel: 7.5,
    minDaysActive: 540,
    minBreakthroughs: 25,
    teachingDepth: "subtle",
    primaryFocus: "Karma yoga in motion",
    uiMode: "minimal",
  },
  {
    phase: 9,
    name: "Devotion Mature",
    description: "Surrender deepens. Heart, mind, and presence are one movement.",
    minVLevel: 8.5,
    minDaysActive: 730,
    minBreakthroughs: 35,
    teachingDepth: "subtle",
    primaryFocus: "Bhakti as ground",
    uiMode: "silent",
  },
  {
    phase: 10,
    name: "Beyond",
    description: "The app becomes silent. The teacher within is enough.",
    minVLevel: 9.2,
    minDaysActive: 1000,
    minBreakthroughs: 50,
    teachingDepth: "silent",
    primaryFocus: "Just being",
    uiMode: "silent",
  },
];

export interface PhaseInput {
  vLevel: number;
  daysActive: number;
  breakthroughs: number;
}

/**
 * Determine current lifetime phase from user metrics.
 * Returns the highest phase whose thresholds are all met.
 */
export function computeLifetimePhase(input: PhaseInput): PhaseProfile {
  const eligible = LIFETIME_PHASES.filter(
    (p) =>
      input.vLevel >= p.minVLevel &&
      input.daysActive >= p.minDaysActive &&
      input.breakthroughs >= p.minBreakthroughs,
  );
  return eligible[eligible.length - 1] || LIFETIME_PHASES[0];
}

/**
 * Distance to next phase (0-1, where 1 = ready to transition).
 */
export function phaseProgress(input: PhaseInput): number {
  const current = computeLifetimePhase(input);
  if (current.phase >= 10) return 1;
  const next = LIFETIME_PHASES[current.phase]; // phase is 1-indexed → next is at index `phase`
  if (!next) return 1;

  const vProg = Math.min(1, (input.vLevel - current.minVLevel) / Math.max(0.01, next.minVLevel - current.minVLevel));
  const dProg = Math.min(1, (input.daysActive - current.minDaysActive) / Math.max(1, next.minDaysActive - current.minDaysActive));
  const bProg = Math.min(1, (input.breakthroughs - current.minBreakthroughs) / Math.max(1, next.minBreakthroughs - current.minBreakthroughs));

  return Math.max(0, Math.min(1, (vProg + dProg + bProg) / 3));
}

/**
 * Should the UI shift to silent/minimal mode?
 */
export function shouldUseSilentMode(phase: LifetimePhase): boolean {
  return phase >= 9;
}
