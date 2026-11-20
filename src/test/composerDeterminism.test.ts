import { describe, expect, it } from "vitest";
import { composeSession, selectArchetype, type ComposerContext } from "@/supabase/_shared/composer";

function base(overrides: Partial<ComposerContext> = {}): ComposerContext {
  return {
    gate: "morning",
    energy: "medium",
    gapDays: 0,
    timeBudgetMin: 12,
    band: 2,
    activeLoops: ["ATT001"],
    practiceLevels: { breath: 1 },
    recentIngredientIds: [],
    seed: "u1:morning:12:2",
    ...overrides,
  };
}

describe("composer determinism", () => {
  it("produces an identical plan for the same seed and context", () => {
    const a = composeSession(base());
    const b = composeSession(base());
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is deterministic without an explicit seed", () => {
    const ctx = base({ seed: undefined });
    expect(JSON.stringify(composeSession(ctx))).toBe(JSON.stringify(composeSession(ctx)));
  });

  it("changes when the context changes", () => {
    const a = composeSession(base({ seed: undefined }));
    const b = composeSession(base({ seed: undefined, activeLoops: ["VAL003"], band: 5 }));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("selectArchetype is deterministic", () => {
    const ctx = base({ seed: undefined });
    expect(selectArchetype(ctx).archetype.id).toBe(selectArchetype(ctx).archetype.id);
  });

  it("always returns at least one slot with minutes", () => {
    const plan = composeSession(base());
    expect(plan.slots.length).toBeGreaterThan(0);
    expect(plan.slots.every((s) => s.minutes >= 1)).toBe(true);
  });
});
