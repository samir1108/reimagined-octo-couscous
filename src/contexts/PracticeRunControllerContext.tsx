/**
 * PracticeRunControllerContext
 * ────────────────────────────
 * Bridges the active `practice_runs` row across components:
 *   • PracticeLaunchSheet — calls beginRun() to register a new run
 *   • SpiralStepBanner / RunMoreMenu — calls pause/skip/extend/finish/abort
 *   • Mood-after dialog — closes the run with telemetry
 *
 * Wraps usePracticeRun so all surfaces see the same active run.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { usePracticeRun, type StartArgs, type CompleteArgs, type Mood, type PracticeQuality } from "@/hooks/usePracticeRun";

interface ActiveRunSummary {
  runId: string;
  startedAt: number;
  plannedDurationSec: number;
  primaryPractice: string;
}

interface API {
  active: ActiveRunSummary | null;
  beginRun: (args: StartArgs) => Promise<string | null>;
  pause: () => Promise<void>;
  skip: () => Promise<void>;
  extend: () => Promise<void>;
  finish: (args: { moodAfter?: Mood | null; quality?: PracticeQuality | null; note?: string | null }) => Promise<void>;
  abort: () => Promise<void>;
  /** Open the full-controls sheet from anywhere. */
  moreOpen: boolean;
  setMoreOpen: (v: boolean) => void;
  /** Open the mood-after sheet (called when spiral ends naturally). */
  moodAfterOpen: boolean;
  setMoodAfterOpen: (v: boolean) => void;
}

const Ctx = createContext<API | null>(null);

export function PracticeRunControllerProvider({ children }: { children: ReactNode }) {
  const recorder = usePracticeRun();
  const [active, setActive] = useState<ActiveRunSummary | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moodAfterOpen, setMoodAfterOpen] = useState(false);
  const startedAtRef = useRef<number>(0);

  const beginRun = useCallback(async (args: StartArgs) => {
    const id = await recorder.start(args);
    if (id) {
      startedAtRef.current = Date.now();
      setActive({
        runId: id,
        startedAt: startedAtRef.current,
        plannedDurationSec: args.plannedDurationSec,
        primaryPractice: args.primaryPractice,
      });
    }
    return id;
  }, [recorder]);

  const elapsedSec = useCallback(() => {
    if (!active) return 0;
    return Math.round((Date.now() - active.startedAt) / 1000);
  }, [active]);

  const completionPct = useCallback(() => {
    if (!active) return 0;
    return Math.min(100, Math.round((elapsedSec() / Math.max(1, active.plannedDurationSec)) * 100));
  }, [active, elapsedSec]);

  const pause   = useCallback(async () => { await recorder.pause(); }, [recorder]);
  const skip    = useCallback(async () => { await recorder.skip();  }, [recorder]);
  const extend  = useCallback(async () => { await recorder.extend(); }, [recorder]);

  const finish = useCallback(async (args: { moodAfter?: Mood | null; quality?: PracticeQuality | null; note?: string | null }) => {
    if (!active) return;
    await recorder.complete({
      actualDurationSec: elapsedSec(),
      completionPct: completionPct(),
      moodAfter: args.moodAfter ?? null,
      quality: args.quality ?? null,
      note: args.note ?? null,
    });
    setActive(null);
    setMoreOpen(false);
    setMoodAfterOpen(false);
  }, [active, recorder, elapsedSec, completionPct]);

  const abort = useCallback(async () => {
    if (!active) return;
    await recorder.abort({
      actualDurationSec: elapsedSec(),
      completionPct: completionPct(),
    });
    setActive(null);
    setMoreOpen(false);
  }, [active, recorder, elapsedSec, completionPct]);

  const value = useMemo<API>(() => ({
    active,
    beginRun,
    pause, skip, extend, finish, abort,
    moreOpen, setMoreOpen,
    moodAfterOpen, setMoodAfterOpen,
  }), [active, beginRun, pause, skip, extend, finish, abort, moreOpen, moodAfterOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePracticeRunController(): API {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePracticeRunController must be inside <PracticeRunControllerProvider>");
  return ctx;
}
