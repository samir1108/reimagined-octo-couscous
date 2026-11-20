import { describe, expect, it } from "vitest";
import {
  generateLineAt,
  generateLines,
  lineCapacity,
  validateLines,
} from "@/lib/contentGen";

describe("content generator", () => {
  it("has a catalog capacity above 100k", () => {
    expect(lineCapacity()).toBeGreaterThanOrEqual(100_000);
  });

  it("generates a valid line at the far edge of the catalog", () => {
    const line = generateLineAt(99_999);
    expect(line.text.length).toBeGreaterThanOrEqual(20);
    expect(validateLines([line]).ok).toBe(true);
  });

  it("is deterministic", () => {
    expect(generateLineAt(12_345)).toEqual(generateLineAt(12_345));
  });

  it("generates unique, valid lines in bulk", () => {
    const lines = generateLines({ count: 1500 });
    expect(lines).toHaveLength(1500);
    expect(new Set(lines.map((line) => line.text)).size).toBe(1500);
    const validation = validateLines(lines);
    expect(validation.errors).toEqual([]);
    expect(validation.ok).toBe(true);
  });

  it("filters by concept and level", () => {
    const lines = generateLines({ concept: "observation", level: 2, count: 30 });
    expect(lines).toHaveLength(30);
    expect(lines.every((line) => line.concept === "observation")).toBe(true);
    expect(lines.every((line) => line.level === 2)).toBe(true);
  });

  it("covers every form", () => {
    const lines = generateLines({ count: 120 });
    const forms = new Set(lines.map((line) => line.form));
    expect(forms.size).toBe(6);
  });

  it("generates Hindi lines in Devanagari", () => {
    const lines = generateLines({ language: "hi", count: 40 });
    expect(lines.every((line) => line.language === "hi")).toBe(true);
    expect(lines.every((line) => /[\u0900-\u097F]/.test(line.text))).toBe(true);
    expect(validateLines(lines).ok).toBe(true);
  });
});
