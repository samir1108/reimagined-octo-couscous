import { describe, it, expect } from "vitest";
import {
  DEFAULT_SESSION_CONFIG,
  DEFAULT_EXTENDED_CONFIG,
} from "@/types/session-config";
import {
  deriveSessionPersonalization,
  familyForFocusType,
  filterExcludedPractices,
  isPersonalized,
  personalizationDirectives,
} from "../../supabase/functions/_shared/sessionConfig";

describe("sessionConfig personalization bridge", () => {
  it("returns null when nothing is provided", () => {
    expect(deriveSessionPersonalization(undefined)).toBeNull();
    expect(deriveSessionPersonalization(null)).toBeNull();
  });

  it("treats a default configuration as not personalized", () => {
    const derived = deriveSessionPersonalization(DEFAULT_EXTENDED_CONFIG);
    expect(derived).not.toBeNull();
    expect(derived?.signals).toEqual([]);
    expect(isPersonalized(derived)).toBe(false);
  });

  it("detects focus and guide customisation", () => {
    const derived = deriveSessionPersonalization({
      ...DEFAULT_EXTENDED_CONFIG,
      focusType: "bhakti",
      guideStyle: "direct",
      reflectionDepth: "deep",
    });
    expect(isPersonalized(derived)).toBe(true);
    expect(derived?.focusFamily).toBe("bhakti");
    expect(derived?.guideStyle).toBe("direct");
    expect(derived?.reflectionDepth).toBe("deep");

    const directives = personalizationDirectives(derived!).join("\n");
    expect(directives).toContain('FOCUS LOCK: the core practice of this sitting must be family "bhakti"');
    expect(directives).toContain("Guide style direct");
    expect(directives).toContain("Reflection depth deep");
  });

  it("maps life-domain focuses to no forced family", () => {
    expect(familyForFocusType("relationship")).toBeNull();
    expect(familyForFocusType("work")).toBeNull();
    expect(familyForFocusType("self_inquiry")).toBe("self_inquiry");
  });

  it("maps practice targets and filters excluded practice steps", () => {
    const derived = deriveSessionPersonalization({
      ...DEFAULT_SESSION_CONFIG,
      practiceLevelTargets: {
        observation: { practiceId: "observation", targetLevel: 4, priority: "high" },
      },
      excludedPracticeIds: ["tantra", "breath"],
    })!;

    expect(derived.practiceTargets).toEqual([
      { family: "observation", level: 4, priority: "high" },
    ]);
    expect(derived.excludedFamilies).toEqual(expect.arrayContaining(["tantra", "breath_awareness"]));

    const steps = [
      { kind: "practice", params: { family: "tantra" } },
      { kind: "practice", params: { family: "observation" } },
      { kind: "journal", params: {} },
    ];
    const kept = filterExcludedPractices(steps, derived);
    expect(kept).toHaveLength(2);
    expect(kept.some((step) => step.params?.family === "tantra")).toBe(false);
  });

  it("keeps a forced archetype and life priority signals", () => {
    const derived = deriveSessionPersonalization({
      ...DEFAULT_EXTENDED_CONFIG,
      forcedArchetype: "Devotional",
      domainWeights: { ...DEFAULT_EXTENDED_CONFIG.domainWeights, spirituality: 1 },
    })!;
    expect(derived.forcedArchetype).toBe("Devotional");
    expect(derived.priorityDomains[0]).toEqual({ id: "spirituality", weight: 1 });
    expect(derived.signals).toContain("forced-archetype");
  });
});
