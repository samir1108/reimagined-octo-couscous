import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import type {
  CompletedStepRecord,
  SessionPlan,
  SessionStep,
} from "./types";
import { getCompletionContract } from "./completionContracts";
import { logStepEvent } from "@/lib/telemetry/engineTelemetry";
import { supabase } from "@/lib/supabase";

interface ShellContextValue {
  sessionId: string;
  plan: SessionPlan;
  /** -1 = agenda card, 0..N-1 = step index, N = ready-to-complete */
  cursor: number;
  currentStep: SessionStep | null;
  isAgenda: boolean;
  isFinished: boolean;
  beginFromAgenda: () => void;
  goToNext: (payload?: Record<string, unknown>) => void;
  skipCurrent: (reason?: string) => void;
  completedSteps: CompletedStepRecord[];
  skippedSteps: CompletedStepRecord[];
  startedAtMs: number;
  paused: boolean;
  pauseSession: () => void;
  resumeSession: () => void;
  completedWidgetIndices: Set<number>;
  setCompletedWidgetIndices: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const Ctx = createContext<ShellContextValue | null>(null);

// ── Persistence helpers ─────────────────────────────────────────────────────
// Allow Home and other surfaces to read in-progress state without re-opening
// the session. Keyed by sessionId so multiple drafts can coexist safely.
const KEY = (id: string) => `session-shell:${id}`;

interface PersistedShape {
  cursor: number;
  completedSteps: CompletedStepRecord[];
  skippedSteps: CompletedStepRecord[];
  startedAtMs: number;
  totalSteps: number;
  intent?: string;
  updatedAt: number;
  completedWidgetIndices: number[];
}

export function readPersistedShell(sessionId: string): PersistedShape | null {
  try {
    const raw = localStorage.getItem(KEY(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedShape;
  } catch {
    return null;
  }
}

export function clearPersistedShell(sessionId: string) {
  try { localStorage.removeItem(KEY(sessionId)); } catch { /* ignore */ }
}

export function SessionShellProvider({
  sessionId,
  plan,
  children,
  startAtAgenda = false,
}: {
  sessionId: string;
  plan: SessionPlan;
  children: React.ReactNode;
  /**
   * Open on the agenda card first (cursor -1). Off by default — a session
   * starts straight into its first step, the practice itself, with no menu
   * to click through. Opt in per session where an agenda is wanted.
   */
  startAtAgenda?: boolean;
}) {
  // Hydrate from persisted state so a closed/resumed session picks up
  // right where it was left off — same cursor, same completed steps.
  const persisted = useMemo(() => readPersistedShell(sessionId), [sessionId]);

  // A resumed draft keeps its saved cursor; a fresh session opens on step 1.
  const [cursor, setCursor] = useState<number>(() => {
    if (persisted && persisted.cursor >= 0) return persisted.cursor;
    return startAtAgenda ? -1 : 0;
  });
  const [completedSteps, setCompletedSteps] = useState<CompletedStepRecord[]>(
    persisted?.completedSteps ?? [],
  );
  const [skippedSteps, setSkippedSteps] = useState<CompletedStepRecord[]>(
    persisted?.skippedSteps ?? [],
  );
  const [completedWidgetIndices, setCompletedWidgetIndices] = useState<Set<number>>(
    () => new Set(persisted?.completedWidgetIndices ?? []),
  );
  const [startedAtMs, setStartedAtMs] = useState<number>(persisted?.startedAtMs ?? Date.now());
  const [paused, setPaused] = useState(false);
  const stepStartRef = useRef<number>(Date.now());
  const hydratedRef = useRef(false);

  // Persist on every meaningful change.
  useEffect(() => {
    try {
      const payload: PersistedShape = {
        cursor,
        completedSteps,
        skippedSteps,
        startedAtMs,
        totalSteps: plan.steps.length,
        intent: plan.intent,
        updatedAt: Date.now(),
        completedWidgetIndices: Array.from(completedWidgetIndices),
      };
      localStorage.setItem(KEY(sessionId), JSON.stringify(payload));
    } catch { /* ignore quota errors */ }
  }, [sessionId, cursor, completedSteps, skippedSteps, plan.steps.length, plan.intent, startedAtMs, completedWidgetIndices]);

  // ── Cross-device checkpoint ────────────────────────────────────────────
  // localStorage covers the same device; session_states covers the rest. A
  // resumed draft on another device picks up at the same cursor.
  useEffect(() => {
    if (!persisted) {
      let cancelled = false;
      (async () => {
        try {
          const { data } = await supabase
            .from("session_states")
            .select("cursor_step_index, completed_steps, skipped_steps, started_at")
            .eq("session_id", sessionId)
            .maybeSingle();
          if (cancelled || !data) return;
          const row = data as {
            cursor_step_index?: number | null;
            completed_steps?: CompletedStepRecord[] | null;
            skipped_steps?: CompletedStepRecord[] | null;
            started_at?: string | null;
          };
          if (typeof row.cursor_step_index === "number" && row.cursor_step_index >= 0) {
            setCursor(row.cursor_step_index);
          }
          if (Array.isArray(row.completed_steps) && row.completed_steps.length > 0) {
            setCompletedSteps(row.completed_steps);
          }
          if (Array.isArray(row.skipped_steps) && row.skipped_steps.length > 0) {
            setSkippedSteps(row.skipped_steps);
          }
          if (row.started_at) {
            const t = new Date(row.started_at).getTime();
            if (Number.isFinite(t) && t > 0) setStartedAtMs(t);
          }
        } catch {
          /* offline — localStorage already covers this device */
        }
      })();
      return () => { cancelled = true; };
    }
    return undefined;
  }, [sessionId, persisted]);

  // Debounced write-through so a closed tab still leaves a resume point.
  useEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return undefined;
    }
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const { data: auth } = await supabase.auth.getUser();
          const userId = auth?.user?.id;
          if (!userId) return;
          await supabase.from("session_states").upsert(
            {
              session_id: sessionId,
              user_id: userId,
              cursor_step_index: cursor,
              completed_steps: completedSteps,
              skipped_steps: skippedSteps,
              started_at: new Date(startedAtMs).toISOString(),
              last_activity_at: new Date().toISOString(),
              metadata: { totalSteps: plan.steps.length, intent: plan.intent, paused },
            },
            { onConflict: "session_id" },
          );
        } catch {
          /* checkpoint is best-effort */
        }
      })();
    }, 800);
    return () => window.clearTimeout(timer);
  }, [sessionId, cursor, completedSteps, skippedSteps, startedAtMs, paused, plan.steps.length, plan.intent]);

  const pauseSession = useCallback(() => setPaused(true), []);
  const resumeSession = useCallback(() => setPaused(false), []);

  // Timing funnel: record every step the user actually saw, once per index.
  const lastShownRef = useRef<number | null>(null);
  useEffect(() => {
    const step = cursor >= 0 && cursor < plan.steps.length ? plan.steps[cursor] : null;
    if (!step || lastShownRef.current === cursor) return;
    lastShownRef.current = cursor;
    void logStepEvent({
      sessionId,
      stepIndex: cursor,
      kind: step.kind,
      title: step.title,
      action: "shown",
      atomRef: step.signalRef ?? null,
    });
  }, [cursor, plan.steps, sessionId]);

  const beginFromAgenda = useCallback(() => {
    stepStartRef.current = Date.now();
    setCursor((c) => (c < 0 ? 0 : c));
  }, []);

  const recordCurrent = useCallback(
    (payload?: Record<string, unknown>) => {
      const idx = cursor;
      if (idx < 0 || idx >= plan.steps.length) return;
      const step = plan.steps[idx];
      const durationSeconds = Math.round((Date.now() - stepStartRef.current) / 1000);
      // Content-response signals travel with the event so the learning loop can
      // see how much was written or re-read, not only that the step finished.
      const signals: Record<string, unknown> = {};
      const p = (payload ?? {}) as Record<string, unknown>;
      const explicitLength = typeof p.length === "number" ? p.length : undefined;
      const text = (p.data as { text?: unknown } | undefined)?.text;
      const chars = explicitLength ?? (typeof text === "string" ? text.length : undefined);
      if (typeof chars === "number") signals.chars = chars;
      if (typeof p.rereadCount === "number") signals.reread = p.rereadCount;
      if (step.est_minutes) signals.plannedSeconds = Math.round(step.est_minutes * 60);
      signals.seconds = durationSeconds;
      void logStepEvent({
        sessionId,
        stepIndex: idx,
        kind: step.kind,
        title: step.title,
        action: "completed",
        completed: true,
        durationSeconds,
        atomRef: step.signalRef ?? null,
        payload: signals,
      });
      setCompletedSteps((prev) => [
        ...prev,
        {
          kind: step.kind,
          stepIndex: idx,
          title: step.title,
          payload,
          durationSeconds,
        },
      ]);
    },
    [cursor, plan.steps, sessionId],
  );

  const recordSkip = useCallback((reason?: string) => {
    const idx = cursor;
    if (idx < 0 || idx >= plan.steps.length) return;
    const step = plan.steps[idx];
    const durationSeconds = Math.round((Date.now() - stepStartRef.current) / 1000);
    void logStepEvent({
      sessionId,
      stepIndex: idx,
      kind: step.kind,
      title: step.title,
      action: "skipped",
      skipped: true,
      durationSeconds,
      atomRef: step.signalRef ?? null,
      payload: reason ? { skipped: true, skipReason: reason } : { skipped: true },
    });
    setSkippedSteps((prev) => [
      ...prev,
      {
        kind: step.kind,
        stepIndex: idx,
        title: step.title,
        durationSeconds,
        payload: reason ? { skipped: true, skipReason: reason } : { skipped: true },
      },
    ]);
  }, [cursor, plan.steps, sessionId]);

  /**
   * Advance one step. The completion contract decides whether the step counts
   * as done: a step that fails its own rule is recorded as skipped rather than
   * completed, so tapping through cannot inflate quality or the learned signal.
   */
  const goToNext = useCallback(
    (payload?: Record<string, unknown>) => {
      const idx = cursor;
      if (idx >= 0 && idx < plan.steps.length) {
        const step = plan.steps[idx];
        const contract = getCompletionContract(step.kind);
        const effective = payload ?? (contract.getDefaultPayload() as Record<string, unknown>);
        let satisfied = true;
        try {
          satisfied = contract.validateCompletion(step, effective);
        } catch {
          satisfied = true;
        }
        if (satisfied) recordCurrent(effective);
        else recordSkip();
      }
      stepStartRef.current = Date.now();
      setCursor((c) => c + 1);
    },
    [cursor, plan.steps, recordCurrent, recordSkip],
  );

  const skipCurrent = useCallback((reason?: string) => {
    recordSkip(reason);
    stepStartRef.current = Date.now();
    setCursor((c) => c + 1);
  }, [recordSkip]);

  const value = useMemo<ShellContextValue>(() => {
    const isAgenda = cursor === -1;
    const isFinished = cursor >= plan.steps.length;
    const currentStep =
      cursor >= 0 && cursor < plan.steps.length ? plan.steps[cursor] : null;
    return {
      sessionId,
      plan,
      cursor,
      currentStep,
      isAgenda,
      isFinished,
      beginFromAgenda,
      goToNext,
      skipCurrent,
      completedSteps,
      skippedSteps,
      startedAtMs,
      paused,
      pauseSession,
      resumeSession,
      completedWidgetIndices,
      setCompletedWidgetIndices,
    };
  }, [
    cursor,
    plan,
    sessionId,
    beginFromAgenda,
    goToNext,
    skipCurrent,
    completedSteps,
    skippedSteps,
    startedAtMs,
    paused,
    pauseSession,
    resumeSession,
    completedWidgetIndices,
    setCompletedWidgetIndices,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSessionShell() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSessionShell must be used inside SessionShellProvider");
  return v;
}

/**
 * Same context, but returns null instead of throwing when rendered outside a
 * provider. Used by presentational shell components (e.g. StepFrame) that can
 * enrich themselves with the current step but must still render standalone.
 */
export function useOptionalSessionShell(): ShellContextValue | null {
  return useContext(Ctx);
}

