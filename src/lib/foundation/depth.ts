import type { FoundationDepth } from "./types";

export interface DepthProfile {
  depth: FoundationDepth;
  label: string;
  /** Minutes the engine will not exceed for the guided component. */
  guidedMaxMinutes: number;
  /** Whether a formal self-inquiry prompt is served. */
  inquiry: boolean;
  /** How much explanation accompanies the practice. */
  scaffolding: "high" | "medium" | "low" | "minimal";
  /** Vocabulary tier used by the composer. */
  register: "plain" | "descriptive" | "observational" | "philosophical";
}

export const DEPTH_PROFILES: Record<FoundationDepth, DepthProfile> = {
  0: {
    depth: 0,
    label: "Name it",
    guidedMaxMinutes: 5,
    inquiry: false,
    scaffolding: "high",
    register: "plain",
  },
  1: {
    depth: 1,
    label: "Describe it",
    guidedMaxMinutes: 10,
    inquiry: false,
    scaffolding: "medium",
    register: "descriptive",
  },
  2: {
    depth: 2,
    label: "Observe the observer",
    guidedMaxMinutes: 15,
    inquiry: true,
    scaffolding: "low",
    register: "observational",
  },
  3: {
    depth: 3,
    label: "Inquire into it",
    guidedMaxMinutes: 20,
    inquiry: true,
    scaffolding: "minimal",
    register: "philosophical",
  },
};

export const ADVANCED_INQUIRY_DAYS: ReadonlyArray<[number, number]> = [
  [58, 67],
  [81, 82],
];

export function depthFromBand(band: number): FoundationDepth {
  if (band <= 1) return 0;
  if (band === 2) return 1;
  if (band <= 4) return 2;
  return 3;
}

export function isAdvancedInquiryDay(day: number): boolean {
  return ADVANCED_INQUIRY_DAYS.some(([start, end]) => day >= start && day <= end);
}

/**
 * Safety first: an advanced inquiry day is never served at depth 2-3 while the
 * user is bypassing (skill far ahead of state, or low witness quality).
 */
export function safeDepth(
  depth: FoundationDepth,
  input: { day: number; bypassRisk: boolean }
): FoundationDepth {
  if (!isAdvancedInquiryDay(input.day) || !input.bypassRisk) return depth;
  return depth >= 2 ? 1 : depth;
}
