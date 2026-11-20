import { describe, expect, it } from "vitest";
import { buildStepScript } from "@/supabase/_shared/stepScript";

const kinds = [
  "breathwork",
  "witness",
  "practice",
  "inquiry",
  "journal",
  "reflection",
  "wisdom-read",
  "micro-act",
  "guide-chat",
  "temple-chat",
  "mantra",
  "loving_kindness",
];

function chars(lines: string[]): number {
  return lines.join(" ").length;
}

describe("buildStepScript", () => {
  it("gives every kind at least 300 characters of instruction", () => {
    for (const kind of kinds) {
      const script = buildStepScript({
        kind,
        label: "Test",
        body: "A short line.",
        minutes: 4,
      });
      expect(chars(script), kind).toBeGreaterThanOrEqual(300);
    }
  });

  it("always has a minimum of three lines", () => {
    for (const kind of kinds) {
      const script = buildStepScript({ kind, label: "Test", minutes: 2 });
      expect(script.length, kind).toBeGreaterThanOrEqual(3);
    }
  });

  it("prepends the chakra opening line", () => {
    const script = buildStepScript({
      kind: "breathwork",
      label: "Heart opening",
      minutes: 2,
      openingPractice: "Hand on heart. Three breaths into the chest.",
    });
    expect(script[0]).toContain("Hand on heart");
  });

  it("names the active loop lightly", () => {
    const script = buildStepScript({
      kind: "practice",
      label: "Witness Sit",
      minutes: 5,
      loopName: "Overthinking",
    });
    expect(script.join(" ")).toContain("Overthinking");
  });

  it("falls back for unknown kinds", () => {
    const script = buildStepScript({ kind: "mystery", label: "Unknown", minutes: 3 });
    expect(script.length).toBeGreaterThanOrEqual(3);
    expect(chars(script)).toBeGreaterThanOrEqual(300);
  });
});
