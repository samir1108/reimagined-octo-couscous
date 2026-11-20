import { FOUNDATION_TOTAL_DAYS } from "./curriculum";
import { ADAPTIVE_PATHS } from "./paths";
import type { AdaptivePath } from "./types";

export interface FoundationHandoff {
  complete: boolean;
  title: string;
  why: string;
  next: Array<{ program: string; minutes: string }>;
}

const NEXT_BY_PATH: Record<AdaptivePath, Array<{ program: string; minutes: string }>> = {
  observer: [
    { program: "Witness L5 · Pure Witness", minutes: "20 min" },
    { program: "Yoga Nidra Path", minutes: "25 min" },
    { program: "Single-Pointed Mind", minutes: "15 min" },
  ],
  inquirer: [
    { program: "Self-Inquiry L3 · Ramana", minutes: "20 min" },
    { program: "Neti Neti Path", minutes: "15 min" },
    { program: "Ashtavakra Gita Path", minutes: "20 min" },
  ],
  integrator: [
    { program: "Karma Yoga", minutes: "15 min" },
    { program: "Loop Liberation", minutes: "20 min" },
    { program: "Presence at Work", minutes: "10 min" },
  ],
  devotional: [
    { program: "Bhakti Flow", minutes: "15 min" },
    { program: "Mantra Japa Deep", minutes: "20 min" },
    { program: "Sufi Heart Path", minutes: "20 min" },
  ],
};

export function getFoundationHandoff(
  day: number,
  path: AdaptivePath
): FoundationHandoff {
  const complete = day >= FOUNDATION_TOTAL_DAYS;
  return {
    complete,
    title: complete
      ? "The foundation is complete. Now the practice becomes yours."
      : `Day ${Math.max(1, day)} of ${FOUNDATION_TOTAL_DAYS}`,
    why: complete
      ? `Your strongest door was the ${ADAPTIVE_PATHS[path].label}. These three deepen it without restarting the foundation.`
      : "The 118 days build the instrument. Everything after this tunes it.",
    next: NEXT_BY_PATH[path],
  };
}
