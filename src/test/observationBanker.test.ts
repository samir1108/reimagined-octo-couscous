import { describe, expect, it } from "vitest";
import { validateContractPlan, type ContractPlan } from "@/supabase/_shared/session-contract";
import { buildObservationBankerPlan } from "@/lib/practice/banker";

describe("observation banker", () => {
  for (const budget of [3, 5, 8, 12]) {
    it(`clears the gate at ${budget} minutes`, () => {
      const plan = buildObservationBankerPlan({ budgetMin: budget, gate: "morning", level: 2, sessionNumber: 42 });
      const checked = validateContractPlan(plan as unknown as ContractPlan, { budgetMin: budget });
      expect(checked.errors).toEqual([]);
      expect(checked.quality.score).toBeGreaterThanOrEqual(0.85);
    });
  }
});
