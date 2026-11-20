import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureError,
  clearBufferedEvents,
  configureObservability,
  getBufferedEvents,
  scrubProps,
  setUser,
  track,
} from "@/lib/observability";

describe("observability", () => {
  beforeEach(() => {
    clearBufferedEvents();
    setUser(null);
    configureObservability({ debug: false, sink: undefined });
  });

  it("scrubs personally identifying fields recursively", () => {
    const cleaned = scrubProps({
      email: "a@b.com",
      nested: { phone: "+91 99999", ok: 1 },
      card: "4111",
      keep: "value",
    });

    expect(cleaned).toEqual({
      email: "[redacted]",
      nested: { phone: "[redacted]", ok: 1 },
      card: "[redacted]",
      keep: "value",
    });
  });

  it("records typed product events with the current user", () => {
    setUser("user-123");
    track("session_completed", { minutes: 10 });

    const [event] = getBufferedEvents();
    expect(event.type).toBe("event");
    expect(event.name).toBe("session_completed");
    expect(event.userId).toBe("user-123");
    expect(event.props).toEqual({ minutes: 10 });
  });

  it("captures errors with stack information", () => {
    captureError(new Error("boom"), { source: "test" });

    const [event] = getBufferedEvents();
    expect(event.type).toBe("error");
    expect(event.message).toBe("boom");
    expect(event.stack).toBeTruthy();
    expect(event.level).toBe("error");
  });

  it("caps the in-memory buffer", () => {
    configureObservability({ maxBuffer: 5 });
    for (let i = 0; i < 20; i += 1) track("app_open");

    expect(getBufferedEvents()).toHaveLength(5);
  });

  it("survives a throwing sink", () => {
    const sink = { capture: vi.fn(() => { throw new Error("sink down"); }) };
    configureObservability({ sink });

    expect(() => track("app_open")).not.toThrow();
    expect(sink.capture).toHaveBeenCalledOnce();
  });
});
