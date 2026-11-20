import { completeUnifiedSession } from "@/lib/unifiedSessionCompletion";
import type { CompletedStepRecord, SessionPlan } from "@/lib/session-shell/types";

/**
 * Sittings that finished on a dead connection. The completion payload is small
 * and idempotent (`completeUnifiedSession` exits early when the session is
 * already completed), so a bounded local queue is enough — no IndexedDB.
 */

const KEY = "sat-yug:offline-completions:v1";
const MAX = 20;

export interface QueuedCompletion {
  sessionId: string;
  userId: string;
  plan: SessionPlan | null;
  completedSteps: CompletedStepRecord[];
  skippedSteps?: CompletedStepRecord[];
  totalSeconds: number;
  gate: string;
  spineId?: string | null;
  queuedAt: number;
}

function read(): QueuedCompletion[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as QueuedCompletion[]) : [];
  } catch {
    return [];
  }
}

function write(items: QueuedCompletion[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(-MAX)));
  } catch {
    /* quota — dropping a queued completion is better than breaking the app */
  }
}

export function enqueueCompletion(item: Omit<QueuedCompletion, "queuedAt">): void {
  const items = read().filter((q) => q.sessionId !== item.sessionId);
  items.push({ ...item, queuedAt: Date.now() });
  write(items);
}

export function pendingCompletionCount(): number {
  return read().length;
}

/** Replay queued completions. Returns how many landed. */
export async function flushCompletionQueue(): Promise<number> {
  const items = read();
  if (items.length === 0) return 0;

  const remaining: QueuedCompletion[] = [];
  let flushed = 0;

  for (const item of items) {
    try {
      const result = await completeUnifiedSession({
        userId: item.userId,
        sessionId: item.sessionId,
        plan: item.plan,
        completedSteps: item.completedSteps,
        skippedSteps: item.skippedSteps,
        totalSeconds: item.totalSeconds,
        gate: item.gate,
        spineId: item.spineId ?? null,
      });
      if (result.ok) flushed++;
      else remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }

  write(remaining);
  return flushed;
}
