import { describe, expect, it } from "vitest";
import {
  generateRestLineAt,
  generateRestLines,
  REST_PROTOCOLS,
  restCapacity,
  validateRestLines,
} from "@/lib/restProtocol";

describe("rest protocol", () => {
  it("has a rest catalog above 10k", () => {
    expect(REST_PROTOCOLS.length).toBeGreaterThanOrEqual(12);
    expect(restCapacity()).toBeGreaterThanOrEqual(10_000);
  });

  it("never sells meditation to a sleeper", () => {
    const lines = generateRestLines({ count: 800 });
    expect(lines).toHaveLength(800);
    expect(lines.every((line) => !line.text.toLowerCase().includes("meditat"))).toBe(true);
    expect(validateRestLines(lines).errors).toEqual([]);
  });

  it("is deterministic and unique in bulk", () => {
    expect(generateRestLineAt(4321)).toEqual(generateRestLineAt(4321));
    const lines = generateRestLines({ count: 600, start: 100 });
    expect(new Set(lines.map((line) => line.text)).size).toBe(600);
  });

  it("filters by protocol", () => {
    const lines = generateRestLines({ protocolId: "panic", count: 25 });
    expect(lines.every((line) => line.protocolId === "panic")).toBe(true);
  });
});
