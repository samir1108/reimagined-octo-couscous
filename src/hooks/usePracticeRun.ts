/**
 * usePracticeRun — telemetry recorder (NO-OP).
 *
 * The `practice_runs` table was dropped in Phase 3 Wave 1 of the F1 cleanup.
 * This hook is kept as a no-op shim so the practice flow API stays stable;
 * all calls return null / resolve quietly. Telemetry now lives in `sessions`
 * (will be wired in Wave 2 once the type-enum lands).
 */
import { useCallback, useRef } from "react";
import type { Practice } from "@/lib/sutra/practices";
import type { SessionBlock } from "@/lib/sutra/orchestrator";

export type PracticeQuality = "shallow" | "present" | "deep";
export type Mood = "tired" | "stressed" | "neutral" | "calm" | "energised";

export interface StartArgs {
  recipeId?: string | null;
  primaryPractice: Practice;
  blocks: SessionBlock[];
  plannedDurationSec: number;
  moodBefore?: Mood | null;
  timeSlot?: "morning" | "midday" | "evening" | "night";
}

export interface CompleteArgs {
  actualDurationSec: number;
  completionPct: number;
  moodAfter?: Mood | null;
  quality?: PracticeQuality | null;
  note?: string | null;
}

export function usePracticeRun() {
  const runIdRef = useRef<string | null>(null);

  const start = useCallback(async (_args: StartArgs): Promise<string | null> => {
    return null;
  }, []);

  const pause   = useCallback(async () => { /* no-op */ }, []);
  const skip    = useCallback(async () => { /* no-op */ }, []);
  const extend  = useCallback(async () => { /* no-op */ }, []);
  const complete = useCallback(async (_args: CompleteArgs) => {
    runIdRef.current = null;
  }, []);
  const abort = useCallback(async (_args: { actualDurationSec: number; completionPct: number }) => {
    runIdRef.current = null;
  }, []);

  return { start, pause, skip, extend, complete, abort };
}
