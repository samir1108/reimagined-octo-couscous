import { describe, expect, it } from "vitest";
import { MANIFESTS } from "@/data/sensorialPractices";
import type { SensorialManifest } from "@/data/sensorialPractices/types";
import { getPracticesForDimension } from "./personalizedPractices";

function manifest(key: string, title: string): SensorialManifest {
  return {
    key,
    title,
    guruId: "test-guide",
    practiceMatch: title,
    backdropImage: "",
    sensors: {},
    totalMinutes: 5,
    steps: [],
    closing: "",
  };
}

describe("getPracticesForDimension", () => {
  const practices = [
    manifest("breath:anapanasati", "Breath awareness"),
    manifest("heart:tonglen", "Compassion practice"),
    manifest("mind:neti-neti", "Self-inquiry"),
  ];

  it("matches guided practices to the selected dimension", () => {
    expect(getPracticesForDimension("body", practices).map((item) => item.key))
      .toEqual(["breath:anapanasati"]);
    expect(getPracticesForDimension("emotion", practices).map((item) => item.key))
      .toEqual(["heart:tonglen"]);
    expect(getPracticesForDimension("thought", practices).map((item) => item.key))
      .toEqual(["mind:neti-neti"]);
  });

  it("returns no practices for an unknown dimension", () => {
    expect(getPracticesForDimension("unknown", practices)).toEqual([]);
  });

  it.each(["thought", "emotion", "body", "awareness"])(
    "finds real guided practices for %s",
    (dimension) => {
      expect(getPracticesForDimension(dimension, MANIFESTS).length).toBeGreaterThan(0);
    },
  );
});
