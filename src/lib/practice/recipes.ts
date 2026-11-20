/**
 * Practice Recipes — curated mixes of practices sized by available time.
 * Each recipe declares an ordered list of (practice, share) pairs that the
 * composer will scale to fit the user's chosen duration.
 */
import type { Practice } from "@/lib/sutra/practices";

export interface RecipeStep {
  practice: Practice;
  /** Relative share of total time (sums roughly to 1). */
  share: number;
}

export interface PracticeRecipe {
  id: string;
  label: string;
  description: string;
  emoji: string;
  /** Time slots this recipe fits best. */
  slots: Array<"morning" | "midday" | "evening" | "night" | "any">;
  /** Minimum duration in seconds (don't surface for shorter sessions). */
  minDurationSec: number;
  steps: RecipeStep[];
}

export const RECIPES: PracticeRecipe[] = [
  {
    id: "morning_awakening",
    label: "Morning Awakening",
    description: "Breath → Body → Inquiry. Wake the system gently.",
    emoji: "🌅",
    slots: ["morning"],
    minDurationSec: 300,
    steps: [
      { practice: "breath", share: 0.35 },
      { practice: "body",   share: 0.35 },
      { practice: "inquiry", share: 0.30 },
    ],
  },
  {
    id: "deep_inquiry",
    label: "Deep Inquiry",
    description: "Witness → Self-Inquiry → Journal. Sit with the question.",
    emoji: "🔍",
    slots: ["midday", "evening", "any"],
    minDurationSec: 600,
    steps: [
      { practice: "witness", share: 0.30 },
      { practice: "inquiry", share: 0.50 },
      { practice: "observe", share: 0.20 },
    ],
  },
  {
    id: "heart_opening",
    label: "Heart Opening",
    description: "Breath → Bhakti → Karma. Soften and serve.",
    emoji: "🪔",
    slots: ["evening", "any"],
    minDurationSec: 480,
    steps: [
      { practice: "breath", share: 0.25 },
      { practice: "bhakti", share: 0.50 },
      { practice: "karma",  share: 0.25 },
    ],
  },
  {
    id: "kriya_purification",
    label: "Kriya Purification",
    description: "Body → Kriya → Witness. Cleanse and rest.",
    emoji: "💧",
    slots: ["morning", "midday"],
    minDurationSec: 900,
    steps: [
      { practice: "body",    share: 0.20 },
      { practice: "kriya",   share: 0.55 },
      { practice: "witness", share: 0.25 },
    ],
  },
  {
    id: "evening_release",
    label: "Evening Release",
    description: "Body → Breath → Witness. Let the day fall away.",
    emoji: "🌙",
    slots: ["evening", "night"],
    minDurationSec: 300,
    steps: [
      { practice: "body",    share: 0.30 },
      { practice: "breath",  share: 0.35 },
      { practice: "witness", share: 0.35 },
    ],
  },
  {
    id: "micro_pause",
    label: "Micro Pause",
    description: "One breath. One witness. 60 seconds of presence.",
    emoji: "⚡",
    slots: ["any"],
    minDurationSec: 60,
    steps: [
      { practice: "breath",  share: 0.5 },
      { practice: "witness", share: 0.5 },
    ],
  },
];

export function getRecipesForSlot(
  slot: "morning" | "midday" | "evening" | "night",
  durationSec: number,
): PracticeRecipe[] {
  return RECIPES.filter(
    (r) =>
      (r.slots.includes(slot) || r.slots.includes("any")) &&
      r.minDurationSec <= durationSec,
  );
}

export function getRecipeById(id: string): PracticeRecipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
