/**
 * Goals catalog
 * ─────────────
 * The 12 user-facing goals offered during onboarding & in Settings.
 * Each goal carries a `weights` map that the engine uses to bias practice
 * recipes, themes, and AI guidance.
 *
 * weights: practice slug → multiplier (1.0 = neutral, >1 = favor, <1 = down-weight)
 */
export interface GoalDef {
  id: string;
  label: string;
  emoji: string;
  description: string;
  weights: Record<string, number>;
}

export const GOAL_CATALOG: GoalDef[] = [
  {
    id: "inner_peace",
    label: "Inner peace",
    emoji: "🕊️",
    description: "Settle the storm inside.",
    weights: { breath: 1.6, witness: 1.5, pranayama: 1.3 },
  },
  {
    id: "stress_relief",
    label: "Stress relief",
    emoji: "🌊",
    description: "Release tension fast.",
    weights: { breath: 1.7, pranayama: 1.5, body_scan: 1.4 },
  },
  {
    id: "focus_clarity",
    label: "Focus & clarity",
    emoji: "🎯",
    description: "Cut through mental fog.",
    weights: { witness: 1.5, observe: 1.4, kriya: 1.2 },
  },
  {
    id: "emotional_healing",
    label: "Emotional healing",
    emoji: "💗",
    description: "Meet old pain with care.",
    weights: { inquiry: 1.6, journal: 1.5, witness: 1.3 },
  },
  {
    id: "self_realization",
    label: "Self-realization",
    emoji: "🪔",
    description: "Know who you really are.",
    weights: { inquiry: 1.8, kriya: 1.5, witness: 1.4 },
  },
  {
    id: "better_sleep",
    label: "Better sleep",
    emoji: "🌙",
    description: "Rest deeply, wake clear.",
    weights: { yoga_nidra: 1.8, breath: 1.4, body_scan: 1.3 },
  },
  {
    id: "spiritual_awakening",
    label: "Spiritual awakening",
    emoji: "✨",
    description: "Open to the deeper.",
    weights: { kriya: 1.7, pranayama: 1.5, inquiry: 1.4 },
  },
  {
    id: "relationship_harmony",
    label: "Relationship harmony",
    emoji: "🤝",
    description: "Show up with presence.",
    weights: { inquiry: 1.5, journal: 1.4, witness: 1.3 },
  },
  {
    id: "discipline",
    label: "Discipline",
    emoji: "⚔️",
    description: "Build daily strength.",
    weights: { kriya: 1.5, observe: 1.4, breath: 1.2 },
  },
  {
    id: "creative_flow",
    label: "Creative flow",
    emoji: "🎨",
    description: "Open the channel.",
    weights: { witness: 1.4, journal: 1.5, breath: 1.2 },
  },
  {
    id: "presence",
    label: "Presence",
    emoji: "👁️",
    description: "Live in the now.",
    weights: { witness: 1.7, observe: 1.5, breath: 1.2 },
  },
  {
    id: "purpose",
    label: "Purpose",
    emoji: "🧭",
    description: "Find your direction.",
    weights: { inquiry: 1.6, journal: 1.5, kriya: 1.2 },
  },
];

export function findGoal(id: string): GoalDef | undefined {
  return GOAL_CATALOG.find((g) => g.id === id);
}
