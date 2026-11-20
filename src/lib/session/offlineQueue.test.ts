import { beforeEach, describe, expect, it, vi } from "vitest";

const completeUnifiedSession = vi.fn(async () => ({ ok: true }));

vi.mock("@/lib/unifiedSessionCompletion", () => ({
  completeUnifiedSession: (...args: unknown[]) => completeUnifiedSession(...args),
}));

import {
  enqueueCompletion,
  flushCompletionQueue,
  pendingCompletionCount,
} from "./offlineQueue";

function item(sessionId: string) {
  return {
    sessionId,
    userId: "u1",
    plan: null,
    completedSteps: [],
    totalSeconds: 60,
    gate: "morning",
  };
}

describe("offline completion queue", () => {
  beforeEach(() => {
    localStorage.clear();
    completeUnifiedSession.mockClear();
    completeUnifiedSession.mockImplementation(async () => ({ ok: true }));
  });

  it("queues a completion and reports the count", () => {
    enqueueCompletion(item("s1"));
    expect(pendingCompletionCount()).toBe(1);
  });

  it("replaces an existing entry for the same session", () => {
    enqueueCompletion(item("s1"));
    enqueueCompletion(item("s1"));
    expect(pendingCompletionCount()).toBe(1);
  });

  it("flushes queued completions and clears them", async () => {
    enqueueCompletion(item("s1"));
    enqueueCompletion(item("s2"));
    const flushed = await flushCompletionQueue();
    expect(flushed).toBe(2);
    expect(pendingCompletionCount()).toBe(0);
    expect(completeUnifiedSession).toHaveBeenCalledTimes(2);
  });

  it("keeps entries whose completion did not land", async () => {
    completeUnifiedSession.mockImplementation(async () => ({ ok: false }));
    enqueueCompletion(item("s1"));
    const flushed = await flushCompletionQueue();
    expect(flushed).toBe(0);
    expect(pendingCompletionCount()).toBe(1);
  });

  it("keeps entries when the call throws", async () => {
    completeUnifiedSession.mockImplementation(async () => {
      throw new Error("offline");
    });
    enqueueCompletion(item("s1"));
    expect(await flushCompletionQueue()).toBe(0);
    expect(pendingCompletionCount()).toBe(1);
  });

  it("is a no-op when empty", async () => {
    expect(await flushCompletionQueue()).toBe(0);
    expect(completeUnifiedSession).not.toHaveBeenCalled();
  });
});
