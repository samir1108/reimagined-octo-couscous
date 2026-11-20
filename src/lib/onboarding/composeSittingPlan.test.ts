import { describe, expect, it } from "vitest";
import { composeSittingPlan } from "./composeSittingPlan";
import { FIRST_ELEVEN_SESSIONS } from "./firstElevenSessions";
import { planSession } from "./firstElevenEngine";
import { toAnswer } from "./sittingRecorder";
import type { CompletedStepRecord } from "@/lib/session-shell/types";
import type { SEAnswer } from "./firstElevenTypes";

const session = FIRST_ELEVEN_SESSIONS[0]; // The Stolen Mind
const planned = planSession(session, {
  askedIds: new Set<string>(),
  mapping: null,
  activeLoops: [],
  seed: "plan-test",
});
const plan = composeSittingPlan({ session, plannedSteps: planned });

describe("composeSittingPlan — sittings become normal session plans", () => {
  it("keeps the same number of steps as the planned sitting", () => {
    expect(plan.steps).toHaveLength(session.steps.length);
  });

  it("maps beats to canonical shell kinds", () => {
    const kinds = plan.steps.map((s) => s.kind);
    expect(kinds).toContain("wisdom-read"); // teaching
    expect(kinds).toContain("reflection");  // choice question
    expect(kinds).toContain("witness");     // silence
    expect(kinds).toContain("micro-act");   // vow
    expect(kinds).not.toContain(undefined);
  });

  it("teaching carries master + quote into prompt and params", () => {
    const teaching = plan.steps.find((s) => s.kind === "wisdom-read")!;
    expect(teaching.title).toBe("The most valuable thing you own");
    expect(teaching.prompt).toContain("Not your money");
    expect((teaching.params as { master?: string }).master).toBe("Krishnamurti");
    expect((teaching.params as { quote?: { source: string } }).quote?.source).toBe("attributed");
  });

  it("choice questions carry options and per-option band signals", () => {
    const reflection = plan.steps.find((s) => s.kind === "reflection")!;
    const params = reflection.params as {
      options: { id: string; label: string }[];
      feOptionBands: Record<string, number>;
      feQuestionId: string;
      feSessionId: string;
    };
    expect(params.options.length).toBeGreaterThanOrEqual(3);
    expect(Object.keys(params.feOptionBands).length).toBe(params.options.length);
    expect(params.feQuestionId).toMatch(/^s01_/);
    expect(params.feSessionId).toBe("stolen_mind");
  });

  it("scale questions interpolate bands in params", () => {
    // Compose directly with a scale step (the adaptive selector may pick
    // either body candidate, so the composer is tested on its own terms).
    const scaleStep = {
      kind: "question" as const,
      role: "body" as const,
      question: {
        id: "s04_body_a",
        sessionId: "fear_engine",
        role: "body" as const,
        kind: "scale" as const,
        title: "How clearly can you feel fear as sensation?",
        minLabel: "All story",
        maxLabel: "At the door",
        lowBand: 1,
        highBand: 9,
        dimension: "body" as const,
        loops: ["BOD005"],
      },
    };
    const fearPlan = composeSittingPlan({ session: FIRST_ELEVEN_SESSIONS[3], plannedSteps: [scaleStep] });
    const step = fearPlan.steps[0];
    expect(step.kind).toBe("reflection");
    expect((step.params as { feLowBand: number }).feLowBand).toBe(1);
    expect((step.params as { feHighBand: number }).feHighBand).toBe(9);
    expect((step.params as { options: unknown[] }).options).toHaveLength(5);
    expect(step.prompt).toContain("All story → At the door");
  });

  it("silence becomes a timed witness with its speak-into", () => {
    const witness = plan.steps.find((s) => s.kind === "witness")!;
    expect((witness.params as { durationSeconds: number }).durationSeconds).toBe(60);
    expect((witness.params as { speakInto?: string }).speakInto).toContain("one line");
    expect(witness.prompt).toContain("Sit. Don't move.");
  });

  it("breath becomes breathwork with a computed duration", () => {
    const desire = FIRST_ELEVEN_SESSIONS[2]; // has the 4·4·6 breath beat
    const desirePlan = composeSittingPlan({
      session: desire,
      plannedSteps: planSession(desire, {
        askedIds: new Set<string>(),
        mapping: null,
        activeLoops: [],
        seed: "plan-test",
      }),
    });
    const breath = desirePlan.steps.find((s) => s.kind === "breathwork");
    expect(breath).toBeDefined();
    expect((breath!.params as { durationSeconds: number }).durationSeconds).toBe(14 * 6);
  });

  it("act becomes micro-act carrying the vow", () => {
    const act = plan.steps.find((s) => s.kind === "micro-act")!;
    expect((act.params as { vowLabel: string }).vowLabel).toBe("I'll take one hour back");
    expect(act.prompt).toContain("face down in another room");
  });

  it("plan metadata names the sitting", () => {
    expect(plan.intent).toContain("Sitting 1");
    expect(plan.intent).toContain("The Stolen Mind");
    expect(plan._meta?.composedBy).toBe("first-eleven");
    expect(plan._meta?.whyThisSession).toContain("last private property");
  });
});

describe("toAnswer — shell payloads become mapping answers", () => {
  const stepByTitle = (title: string) =>
    plan.steps.find((s) => s.title === title) as { title: string; params: Record<string, unknown> };

  it("converts a choice payload with its option band", () => {
    const reflectionStep = plan.steps.find((s) => s.kind === "reflection")!;
    const params = reflectionStep.params as {
      options: { id: string; label: string }[];
      feOptionBands: Record<string, number>;
      feOptionLoops: Record<string, string[]>;
      feQuestionId: string;
      feSessionId: string;
    };
    const optionId = params.options[0].id;
    const record: CompletedStepRecord = {
      kind: "reflection",
      title: reflectionStep.title,
      payload: { option: optionId, label: params.options[0].label },
    };
    const answer = toAnswer(record, plan.steps) as SEAnswer;
    expect(answer).not.toBeNull();
    expect(answer.questionId).toBe(params.feQuestionId);
    expect(answer.sessionId).toBe("stolen_mind");
    expect(answer.band).toBe(params.feOptionBands[optionId]);
    expect(Array.isArray(answer.loops)).toBe(true);
  });

  it("converts a scale payload by interpolation", () => {
    const record: CompletedStepRecord = {
      kind: "reflection",
      title: "scale q",
      payload: { option: "3", label: "3" },
    };
    const answer = toAnswer(record, [
      {
        title: "scale q",
        params: {
          feQuestionId: "s01_body_a",
          feSessionId: "stolen_mind",
          feLowBand: 1,
          feHighBand: 9,
          feDimension: "body",
        },
      },
    ])!;
    expect(answer.band).toBe(5);
    expect(answer.dimension).toBe("body");
  });

  it("converts a journal payload only when a line was written", () => {
    const planStep = {
      title: "j",
      params: { feQuestionId: "s01_mirror_a", feSessionId: "stolen_mind", feBand: 3, feDimension: "emotion" },
    };
    expect(toAnswer({ kind: "journal", title: "j", payload: { text: "  " } }, [planStep])).toBeNull();
    const answer = toAnswer({ kind: "journal", title: "j", payload: { text: "my phone" } }, [planStep])!;
    expect(answer.value).toBe("my phone");
    expect(answer.band).toBe(3);
  });

  it("converts a witness one-liner, skipping empty silences", () => {
    const planStep = { title: "s", params: { feSessionId: "stolen_mind", feQuestionId: "s01_silence" } };
    expect(toAnswer({ kind: "witness", title: "s", payload: {} }, [planStep])).toBeNull();
    const answer = toAnswer({ kind: "witness", title: "s", payload: { thoughts: "a tight chest" } }, [planStep])!;
    expect(answer.dimension).toBe("body");
    expect(answer.value).toBe("a tight chest");
  });

  it("converts a micro-act into its vow answer", () => {
    const actStep = stepByTitle("One hour, face down");
    const answer = toAnswer({ kind: "micro-act", title: "One hour, face down", payload: {} }, [actStep])!;
    expect(answer.value).toBe("I'll take one hour back");
    expect(answer.band).toBe(8);
    expect(answer.dimension).toBe("awareness");
  });

  it("ignores teaching beats (no answer content)", () => {
    const teachingStep = plan.steps.find((s) => s.kind === "wisdom-read")!;
    expect(toAnswer({ kind: "wisdom-read", title: teachingStep.title, payload: {} }, plan.steps)).toBeNull();
  });
});
