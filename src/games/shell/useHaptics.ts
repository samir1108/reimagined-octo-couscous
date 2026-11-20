// useHaptics — choreographed vibration patterns.
// Silent no-op on devices without vibration (desktop, iOS Safari).
import { useCallback } from "react";

const PATTERNS = {
  tap: [10],
  bell: [8, 40, 12, 60, 18],
  heartbeat: [40, 100, 60, 600],
  exhale: [25, 80, 35, 80, 50, 80, 80],   // long, descending — "release"
  inhale: [80, 50, 35, 50, 25],            // short, ascending — "rise"
  success: [12, 30, 24, 30, 40],
  warn: [40, 80, 40],
  drop: [120],
  heavy: [60, 40, 90],
} as const;

export type HapticPattern = keyof typeof PATTERNS;

export function useHaptics() {
  const buzz = useCallback((pattern: HapticPattern | number[]) => {
    try {
      const nav = navigator as any;
      if (!nav?.vibrate) return;
      const p = Array.isArray(pattern) ? pattern : PATTERNS[pattern];
      nav.vibrate(p as any);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    try {
      (navigator as any)?.vibrate?.(0);
    } catch {}
  }, []);

  return { buzz, stop };
}
