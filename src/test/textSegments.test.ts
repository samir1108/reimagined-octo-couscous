import { describe, expect, it } from "vitest";
import { needsSegmentation, segmentText, SEGMENT_MAX, SEGMENT_TARGET } from "@/lib/textSegments";

describe("segmentText", () => {
  it("leaves short strings untouched", () => {
    expect(segmentText("Start practice")).toEqual(["Start practice"]);
    expect(segmentText("")).toEqual([""]);
  });

  it("keeps every character of the original when splitting", () => {
    const sentence = "Breathe in slowly, hold for a moment, and release with a long exhale. ";
    const text = sentence.repeat(Math.ceil(SEGMENT_TARGET / sentence.length) + 4).trim();
    expect(needsSegmentation(text)).toBe(true);

    const pieces = segmentText(text);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.join("")).toBe(text);
    for (const piece of pieces) {
      expect(piece.length).toBeLessThanOrEqual(SEGMENT_MAX);
    }
  });

  it("prefers sentence boundaries", () => {
    const one = `${"a".repeat(SEGMENT_TARGET - 10)}. `;
    const two = `${"b".repeat(SEGMENT_TARGET - 10)}. `;
    const pieces = segmentText(one + two);
    expect(pieces.length).toBe(2);
    expect(pieces[0]).toBe(one);
    expect(pieces[1]).toBe(two);
  });

  it("splits blank-line separated paragraphs", () => {
    const para = `${"word ".repeat(400)}`.trim();
    const text = `${para}\n\n${para}`;
    const pieces = segmentText(text);
    expect(pieces.length).toBeGreaterThan(1);
    expect(pieces.join("")).toBe(text);
  });

  it("hard-splits a single pathological sentence", () => {
    const text = "x".repeat(SEGMENT_TARGET * 3);
    const pieces = segmentText(text);
    expect(pieces.length).toBe(3);
    expect(pieces.join("")).toBe(text);
  });
});
