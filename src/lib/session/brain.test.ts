import { describe, expect, it, vi, afterEach } from "vitest";
import { resolveBrainPolicy } from "./brain";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function setMode(mode: string) {
  vi.stubEnv("VITE_AI_BRAIN_MODE", mode);
}

describe("resolveBrainPolicy", () => {
  it("never allows paid AI when depth is local", () => {
    setMode("cloud");
    expect(resolveBrainPolicy("local")).toMatchObject({ allowPaidAI: false });
  });

  it("defaults to hybrid and does not spend credits", () => {
    vi.stubEnv("VITE_AI_BRAIN_MODE", "");
    const policy = resolveBrainPolicy();
    expect(policy.mode).toBe("hybrid");
    expect(policy.allowPaidAI).toBe(false);
  });

  it("allows paid AI in hybrid only on an explicit deep request", () => {
    setMode("hybrid");
    expect(resolveBrainPolicy().allowPaidAI).toBe(false);
    expect(resolveBrainPolicy("deep").allowPaidAI).toBe(true);
  });

  it("forces the local brain when offline", () => {
    setMode("cloud");
    vi.stubGlobal("navigator", { onLine: false });
    const policy = resolveBrainPolicy("deep");
    expect(policy.mode).toBe("local");
    expect(policy.allowPaidAI).toBe(false);
  });

  it("allows paid AI in cloud mode", () => {
    setMode("cloud");
    expect(resolveBrainPolicy().allowPaidAI).toBe(true);
  });

  it("ignores unknown mode values", () => {
    setMode("turbo");
    expect(resolveBrainPolicy().mode).toBe("hybrid");
  });
});
