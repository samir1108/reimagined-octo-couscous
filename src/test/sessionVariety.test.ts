import { describe, expect, it } from "vitest";
import {
  dedupePlanSteps,
  fitPlanToBudget,
  normalizeContractStep,
  planSignature,
  validateContractPlan,
  type ContractPlan,
  type ContractStep,
} from "@/supabase/_shared/session-contract";
import { composeSession, type ComposerContext } from "@/supabase/_shared/composer";
import { resolveStepWidget } from "@/lib/session-shell/stepWidgets";

function step(overrides: Partial<ContractStep> = {}): ContractStep {
  return {
    kind: "breathwork",
    title: "Settle the breath",
    script: [
      "Sit or stand as you are and let the body take its full weight before anything is asked.",
      "Breathe in for four, out for six, for five rounds. Do not deepen it.",
      "If the mind argues, let it argue and keep the exhale slow and unforced.",
      "Stop when the breath feels slower than it did when you sat down.",
    ],
    durationSeconds: 180,
    params: { pattern: "4-4-6" },
    whyForYou: "Because your breath band is the weakest measured right now.",
    signalRef: "dim:body",
    ...overrides,
  } as ContractStep;
}

function plan(steps: ContractStep[]): ContractPlan {
  return { id: "p1", intent: "test", intro: "", steps };
}

describe("session contract variety", () => {
  it("keeps provenance params through normalization", () => {
    const normalized = normalizeContractStep({
      ...step(),
      params: {
        pattern: "4-4-6",
        ingredientId: "p:breath-446-3m",
        slotRole: "settle",
        archetypeId: "opening",
        plannedMinutes: 3,
        widgetId: "box_breath",
        junk: "drop me",
      },
    });
    expect(normalized.params?.ingredientId).toBe("p:breath-446-3m");
    expect(normalized.params?.slotRole).toBe("settle");
    expect(normalized.params?.archetypeId).toBe("opening");
    expect(normalized.params?.plannedMinutes).toBe(3);
    expect(normalized.params?.widgetId).toBe("box_breath");
    expect(normalized.params?.junk).toBeUndefined();
  });

  it("drops a step the user would experience twice", () => {
    const duplicate = step();
    const other = step({
      kind: "journal",
      title: "Name one true thing",
      script: [
        "Write without stopping and without editing anything at all.",
        "Answer the question in front of you in plain, unadorned words.",
        "If you do not know, write that you do not know and keep going.",
        "Name one thing you would not normally say out loud today.",
      ],
      params: { questions: ["What is here?"] },
      durationSeconds: 120,
      signalRef: "closure",
    });
    const deduped = dedupePlanSteps(plan([step({ title: "Settle the breath" }), duplicate, other]));
    expect(deduped.steps).toHaveLength(2);
    expect(deduped.steps.map((s) => s.kind)).toEqual(["breathwork", "journal"]);
  });

  it("keeps two same-kind steps only when their content differs", () => {
    const writeOpen = step({
      kind: "journal",
      title: "Write the open",
      params: { questions: ["What is here?"] },
    });
    const writeClose = step({
      kind: "journal",
      title: "Write the close",
      script: [
        "Write the sentence you will carry out of this sitting.",
        "Do not summarise the sitting and do not write a report on it.",
        "Say what is true now, even if it is small or inconvenient.",
        "Stop while the sentence is still alive rather than explaining it.",
      ],
      params: { questions: ["What remains?"] },
    });
    const third = step({
      kind: "journal",
      title: "Write again",
      script: [
        "Write a third page for no one at all, slowly.",
        "Let the pen move before you decide what this is about.",
        "Do not edit, do not correct spelling, do not reread.",
        "Stop when the hand wants to stop, not when it runs out.",
      ],
      params: { questions: ["Again?"] },
    });
    const deduped = dedupePlanSteps(plan([writeOpen, writeClose, third]));
    expect(deduped.steps).toHaveLength(2);
  });

  it("fits a too-long plan back inside its budget", () => {
    const steps = [
      step({ kind: "witness", title: "Watch one", durationSeconds: 1200, params: { durationSeconds: 1200 } }),
      step({ kind: "practice", title: "Stay with it", durationSeconds: 1200, params: { family: "body", exercise: "Scan" } }),
      step({ kind: "journal", title: "Write it", durationSeconds: 480, params: { questions: ["What?"] } }),
      step({ kind: "reflection", title: "Close it", durationSeconds: 180, params: {} }),
    ];
    const fitted = fitPlanToBudget(plan(steps), 8);
    const total = fitted.steps.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
    expect(total).toBeLessThanOrEqual(8 * 60 * 1.05);
    expect(fitted.steps.length).toBeGreaterThanOrEqual(2);
  });

  it("validates a deduped plan and scores its variety", () => {
    const close = step({
      kind: "reflection",
      title: "Close it",
      script: [
        "Sit with the question before you write anything down.",
        "One honest sentence is enough here. Do not perform insight.",
        "Say what is actually true right now, even if it is unflattering.",
        "Close the sentence and leave it alone. Do not fix it.",
      ],
      params: {},
      signalRef: "closure",
    });
    const raw = plan([step(), step(), close]);
    const checked = validateContractPlan(raw, { budgetMin: 8 });
    expect(checked.plan.steps.length).toBe(2);
    expect(checked.quality.breakdown.variety).toBe(1);
  });
});

function ctx(recent: string[], salt = ""): ComposerContext {
  return {
    gate: "morning",
    energy: "medium",
    gapDays: 0,
    timeBudgetMin: 8,
    band: 2,
    activeLoops: ["ATT001"],
    practiceLevels: { breath: 1 },
    recentIngredientIds: recent,
    seed: `user-1:morning:5:2:${salt}`,
  };
}

describe("local composer does not repeat the same sitting", () => {
  it("changes the step signature once the served ingredients are known", () => {
    const first = composeSession(ctx([]));
    const served = first.slots.map((s) => s.ingredient.id);
    const second = composeSession(ctx(served, served.sort().join(",")));
    expect(planSignature({ intent: "", intro: "", steps: first.slots.map((s) => ({
      kind: s.ingredient.stepKind, title: s.ingredient.label,
    })) })).not.toBe(
      planSignature({ intent: "", intro: "", steps: second.slots.map((s) => ({
        kind: s.ingredient.stepKind, title: s.ingredient.label,
      })) }),
    );
  });

  it("maps the bank's practice families to real widgets", () => {
    const breath = resolveStepWidget({
      kind: "practice",
      title: "Standing breath",
      est_minutes: 3,
      params: { family: "breath", exercise: "Follow the exhale" },
    });
    expect(breath?.definition.id).toBe("coherent_breath");

    const body = resolveStepWidget({
      kind: "practice",
      title: "Body scan",
      est_minutes: 5,
      params: { family: "body", exercise: "Head to toe" },
    });
    expect(body?.definition.id).toBe("body_scan_full");

    const inquiry = resolveStepWidget({
      kind: "practice",
      title: "Ask who",
      est_minutes: 5,
      params: { family: "self-inquiry", exercise: "Who is aware?" },
    });
    expect(inquiry?.definition.id).toBe("neti_neti");
  });
});
