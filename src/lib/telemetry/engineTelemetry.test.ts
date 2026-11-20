import { describe, expect, it } from "vitest";
import { hashInput } from "./engineTelemetry";

describe("hashInput", () => {
  it("is stable regardless of key order", () => {
    expect(hashInput({ a: 1, b: 2 })).toBe(hashInput({ b: 2, a: 1 }));
  });

  it("changes when a value changes", () => {
    expect(hashInput({ gate: "morning" })).not.toBe(hashInput({ gate: "evening" }));
  });

  it("handles nested arrays and nulls", () => {
    expect(hashInput({ x: [1, null, "y"] })).toMatch(/^[0-9a-f]{8}$/);
  });

  it("distinguishes empty input", () => {
    expect(hashInput(undefined)).not.toBe(hashInput({}));
  });
});
