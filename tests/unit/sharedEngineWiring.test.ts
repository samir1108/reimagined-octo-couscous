import { describe, it, expect } from "vitest";
import { composeSession } from "@/supabase/_shared/composer";
import { detectBlockedChakra } from "@/supabase/_shared/chakraEngine";
import { buildPracticeMatrixSignal } from "@/supabase/_shared/practiceMatrix";
import { buildAdaptiveDecision } from "@/supabase/_shared/adaptive-engine";

/**
 * Guards the wiring fix: src/supabase/_shared/* used to be no-op stubs, so the
 * client orchestrator ran on empty signals (empty plans, null chakras). These
 * assertions fail if those files stop re-exporting the canonical engines.
 */
describe("shared engine wiring (client ↔ edge parity)", () => {
  it("composeSession returns a real multi-step plan", () => {
    const plan = composeSession({
      gate: "morning",
      energy: "medium",
      gapDays: 1,
      timeBudgetMin: 12,
      band: 3,
      activeLoops: ["VAL001"],
      practiceLevels: {},
      recentIngredientIds: [],
    });

    expect(plan.archetypeId).toBeTruthy();
    expect(Array.isArray(plan.slots)).toBe(true);
    expect(plan.slots.length).toBeGreaterThan(0);
    expect(plan.slots[0].ingredient.id).toBeTruthy();
    expect(plan.totalMinutes).toBeGreaterThan(0);
  });

  it("detectBlockedChakra always yields a primary chakra", () => {
    const signal = detectBlockedChakra({ weakestDimension: "emotion" });
    expect(signal.primary).toBeTruthy();
    expect(signal.primary.id).toBeTruthy();
    expect(typeof signal.promptBlock).toBe("string");
  });

  it("buildPracticeMatrixSignal exposes the stressed-domain summary", () => {
    const signal = buildPracticeMatrixSignal([]);
    expect(signal).toBeTruthy();
    expect("mostStressedDomain" in signal).toBe(true);
  });

  it("buildAdaptiveDecision returns a decision object", () => {
    const decision = buildAdaptiveDecision({
      userText: "I keep procrastinating",
      hour: 9,
      daysSinceLastSession: 1,
      sessionsToday: 0,
      totalSessionCount: 10,
      band: 3,
      surface: "home",
    });

    expect(decision).toBeTruthy();
    expect(typeof decision.entryContextType).toBe("string");
  });
});
