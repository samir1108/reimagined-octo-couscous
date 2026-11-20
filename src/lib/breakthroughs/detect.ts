/**
 * DEPRECATED — client-side keyword breakthrough scanner.
 *
 * The Sacred Karma System now verifies breakthroughs server-side via
 * the `verify-breakthrough` edge function (AI-judged, capped, cooldowns).
 * These functions are kept as no-ops so existing imports don't break.
 */
import type { BreakthroughType } from "@/data/breakthroughs";

interface AwardMutation {
  mutate: (params: {
    source: any;
    base?: number;
    weight?: number;
    metadata?: Record<string, any>;
    silent?: boolean;
  }) => void;
}

export function findBreakthroughs(_text: string): BreakthroughType[] {
  return [];
}

export function detectAndAwardBreakthroughs(
  _text: string,
  _award: AwardMutation,
  _context: string,
) {
  return [] as BreakthroughType[];
}
