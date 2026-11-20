import { describe, expect, it } from "vitest";
import {
  planSession,
  analyzeFirstEleven,
  spiralBandLabel,
} from "./firstElevenEngine";
import { FIRST_ELEVEN_SESSIONS, FIRST_ELEVEN_TOTAL } from "./firstElevenSessions";
import { FIRST_ELEVEN_QUESTIONS, FIRST_ELEVEN_QUESTION_COUNT } from "./firstElevenQuestions";
import type { SEAnswer } from "./firstElevenTypes";

describe("The First Eleven content", () => {
  it("has 11 sittings numbered 1-11", () => {
    expect(FIRST_ELEVEN_TOTAL).toBe(11);
    expect(FIRST_ELEVEN_SESSIONS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it("has a question bank of 100+", () => {
    expect(FIRST_ELEVEN_QUESTION_COUNT).toBeGreaterThanOrEqual(100);
  });

  it("every sitting has a question step for each role and a bank for it", () => {
    for (const session of FIRST_ELEVEN_SESSIONS) {
      const questionSteps = session.steps.filter((s) => s.kind === "question");
      expect(questionSteps.length).toBeGreaterThanOrEqual(5);
      for (const step of questionSteps) {
        if (step.kind !== "question") continue;
        const bank = FIRST_ELEVEN_QUESTIONS.filter(
          (q) => q.sessionId === session.id && q.role === step.role
        );
        expect(bank.length, `${session.id}/${step.role}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every bank question belongs to a real sitting", () => {
    const ids = new Set(FIRST_ELEVEN_SESSIONS.map((s) => s.id));
    for (const q of FIRST_ELEVEN_QUESTIONS) {
      expect(ids.has(q.sessionId), q.id).toBe(true);
    }
  });
});

describe("planSession (adaptive selection)", () => {
  const baseCtx = {
    askedIds: new Set<string>(),
    mapping: null,
    activeLoops: [] as string[],
    seed: "user-123",
  };

  it("fills every question slot without repeats and keeps non-question beats", () => {
    const session = FIRST_ELEVEN_SESSIONS[0];
    const steps = planSession(session, baseCtx);
    expect(steps).toHaveLength(session.steps.length);
    const questions = steps.filter((s) => s.kind === "question");
    expect(questions.length).toBe(session.steps.filter((s) => s.kind === "question").length);
    const picked = new Set<string>();
    for (const s of questions) {
      if (s.kind !== "question") continue;
      expect(picked.has(s.question.id)).toBe(false);
      picked.add(s.question.id);
      expect(FIRST_ELEVEN_QUESTIONS.some((q) => q.id === s.question.id)).toBe(true);
    }
    // teaching beats survive untouched
    expect(steps[0].kind).toBe("teaching");
  });

  it("never re-asks a question already answered", () => {
    const session = FIRST_ELEVEN_SESSIONS[1];
    const all = planSession(session, baseCtx);
    const askedIds = new Set(
      all.filter((s) => s.kind === "question").map((s) => (s as { question: { id: string } }).question.id)
    );
    const second = planSession(session, { ...baseCtx, askedIds });
    const secondPicked = second
      .filter((s) => s.kind === "question")
      .map((s) => (s as { question: { id: string } }).question.id);
    for (const id of secondPicked) {
      expect(askedIds.has(id)).toBe(false);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = planSession(FIRST_ELEVEN_SESSIONS[3], baseCtx);
    const b = planSession(FIRST_ELEVEN_SESSIONS[3], baseCtx);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("analyzeFirstEleven (mapping)", () => {
  const mkProgress = (answers: SEAnswer[], completed: number[]) => ({
    current_session: Math.min(11, completed.length + 1),
    completed_sessions: completed,
    answers,
    carry_seeds: {},
    skipped: false,
    completed_at: null,
    updated_at: new Date().toISOString(),
  });

  const mkAnswer = (questionId: string, sessionId: string, band: number): SEAnswer => ({
    questionId,
    sessionId,
    value: "x",
    band,
    dimension: "awareness",
  });

  it("returns a default mapping with no answers", () => {
    const m = analyzeFirstEleven({ progress: mkProgress([], []) });
    expect(m.band).toBeGreaterThan(0);
    expect(m.dimensions.awareness).toBe(3);
    expect(m.readyForJourneys).toBe(false);
  });

  it("weights later sittings more heavily", () => {
    const early = mkProgress([mkAnswer("a", "stolen_mind", 2)], [1]);
    const late = mkProgress([mkAnswer("a", "who_is_asking", 9)], [11]);
    const mEarly = analyzeFirstEleven({ progress: early });
    const mLate = analyzeFirstEleven({ progress: late });
    expect(mLate.band).toBeGreaterThan(mEarly.band);
  });

  it("counts loops and reports readiness after all eleven", () => {
    const answers: SEAnswer[] = [
      { questionId: "q1", sessionId: "stolen_mind", value: "a", band: 6, dimension: "body", loops: ["BHV007"] },
      { questionId: "q2", sessionId: "stolen_mind", value: "b", band: 7, dimension: "body", loops: ["BHV007"] },
    ];
    const m = analyzeFirstEleven({ progress: mkProgress(answers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) });
    expect(m.loops[0]?.id).toBe("BHV007");
    expect(m.readyForJourneys).toBe(true);
    expect(m.summaryLines.length).toBeGreaterThan(2);
  });

  it("maps band micro-levels to spiral labels", () => {
    expect(spiralBandLabel(0.4)).toBe("Survival");
    expect(spiralBandLabel(3.2)).toBe("Achievement");
    expect(spiralBandLabel(9.4)).toBe("Unity");
    expect(spiralBandLabel(9.6)).toBe("Source");
  });

  it("blends light-six and foundation seeds", () => {
    const m = analyzeFirstEleven({
      progress: mkProgress([mkAnswer("s01_open_a", "stolen_mind", 8)], [1]),
      conditioning: {
        answers: { a: 2, b: 2, c: 2, d: 2, e: 2, f: 2 },
        avgBand: 2,
        headline: "x",
      },
      foundationAnswers: { mood: 6, energy: 6 },
    });
    // two low seeds (0.6 + 1.0) pull the single 8.0 answer (weight 1.09) down
    expect(m.band).toBeGreaterThan(2);
    expect(m.band).toBeLessThan(8);
  });
});
