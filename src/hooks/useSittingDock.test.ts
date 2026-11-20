import { describe, expect, it } from "vitest";
import { buildDockContext, DOCK_QUICK_PROMPTS, DOCK_ROLE_PHRASES, type DockStepLike } from "./useSittingDock";
import { FIRST_ELEVEN_SESSIONS } from "@/lib/onboarding/firstElevenSessions";
import { planSession } from "@/lib/onboarding/firstElevenEngine";

const session = FIRST_ELEVEN_SESSIONS[2]; // Desire and the More

/** Mirror of FirstElevenScreen's mapping from a planned step to a Dock step. */
function toDockStep(step: ReturnType<typeof planSession>[number]): DockStepLike {
  if (step.kind === "question") {
    return {
      kind: "question",
      label: step.question.title,
      subtitle: step.question.subtitle,
      rolePhrase: DOCK_ROLE_PHRASES[step.role] ?? "the question",
    };
  }
  if (step.kind === "silence") {
    return { kind: "silence", label: step.prompt, body: step.prompt, seconds: step.seconds };
  }
  if (step.kind === "breath") {
    return { kind: "breath", label: "the breath practice", pattern: step.pattern, rounds: step.rounds };
  }
  if (step.kind === "teaching") return { kind: "teaching", label: step.title, body: step.body };
  return { kind: "act", label: step.title, body: step.body };
}

describe("buildDockContext (Gate 3 context seeding)", () => {
  const plan = planSession(session, {
    askedIds: new Set<string>(),
    mapping: null,
    activeLoops: [],
    seed: "test-seed",
  });
  const questionStep = plan.find((s) => s.kind === "question");
  const teachingStep = plan.find((s) => s.kind === "teaching");

  it("includes the sitting, theme, and master voice", () => {
    const ctx = buildDockContext({ session, step: null, typedWords: [] });
    expect(ctx).toContain("SITTING 3 of 11");
    expect(ctx).toContain("Desire and the More");
    expect(ctx).toContain(session.master);
    expect(ctx).toContain("wise sibling");
  });

  it("seeds the current question step with its role and title", () => {
    expect(questionStep).toBeDefined();
    const ctx = buildDockContext({ session, step: toDockStep(questionStep!), typedWords: [] });
    if (questionStep!.kind === "question") {
      expect(ctx).toContain(questionStep!.question.title);
      expect(ctx).toMatch(/question|deeper|body|turning/);
    }
  });

  it("seeds teaching and silence beats distinctly", () => {
    expect(teachingStep).toBeDefined();
    const teachCtx = buildDockContext({ session, step: toDockStep(teachingStep!), typedWords: [] });
    expect(teachCtx).toContain("teaching");
    const silenceCtx = buildDockContext({
      session,
      step: { kind: "silence", label: "watch the pull", body: "watch the pull", seconds: 60 },
      typedWords: [],
    });
    expect(silenceCtx).toContain("silence");
    expect(silenceCtx).toContain("60-second");
    expect(silenceCtx).toContain("watch the pull");
  });

  it("carries journey labels so any journey can reuse the Dock", () => {
    const ctx = buildDockContext({
      session,
      step: null,
      typedWords: [],
      journeyLabel: "THE AWAKENING JOURNEY",
      stepLabel: "SESSION",
    });
    expect(ctx).toContain("THE AWAKENING JOURNEY · SESSION 3 of 11");
  });

  it("includes the user's typed words so far", () => {
    const ctx = buildDockContext({
      session,
      step: toDockStep(questionStep!),
      typedWords: ["I always reach for the phone", "it feels like drowning"],
    });
    expect(ctx).toContain("I always reach for the phone");
    expect(ctx).toContain("it feels like drowning");
  });

  it("notes when nothing has been written yet", () => {
    const ctx = buildDockContext({ session, step: null, typedWords: [] });
    expect(ctx).toContain("has not written anything yet");
  });

  it("offers quick prompts", () => {
    expect(DOCK_QUICK_PROMPTS.length).toBeGreaterThanOrEqual(3);
    for (const q of DOCK_QUICK_PROMPTS) expect(q.length).toBeGreaterThan(3);
  });
});

describe("dock keep flow → mapping answer", () => {
  it("kept lines become a single awareness answer joined by separators", () => {
    // Mirrors FirstElevenScreen.handleDockKeep
    const lines = ["the wanting is the point", "noticing it changes it"];
    const answer = {
      questionId: `s${String(session.n).padStart(2, "0")}_dock`,
      sessionId: session.id,
      value: lines.join(" · "),
      band: 6,
      dimension: "awareness",
    };
    expect(answer.questionId).toBe("s03_dock");
    expect(answer.value).toBe("the wanting is the point · noticing it changes it");
    expect(answer.dimension).toBe("awareness");
  });
});
