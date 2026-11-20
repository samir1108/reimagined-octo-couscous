import { describe, expect, it } from "vitest";
import {
  planSession,
  analyzeCapabilities,
  recommendNext,
  recommendPaths,
  personalOrder,
  buildReport,
  answerFromQuestion,
  emptyProgress,
  AWAKENING_SESSIONS,
  AWAKENING_TOTAL,
  AWAKENING_QUESTIONS,
  AWAKENING_QUESTION_COUNT,
  AWAKENING_CANONICAL_ORDER,
  CAPABILITY_IDS,
  type AwakeningProgress,
  type AwakeningAnswer,
} from "./index";
import type { Beat } from "./types";

const mkAnswer = (
  questionId: string,
  sessionId: string,
  beat: Beat,
  capabilities: Record<string, number>,
  loops?: string[],
  evidence: AwakeningAnswer["evidence"] = "self_reported",
  value: string | number = "x"
): AwakeningAnswer => ({ questionId, sessionId, beat, value, capabilities, loops, evidence });

const withAnswers = (answers: AwakeningAnswer[], completed: string[] = []): AwakeningProgress => ({
  ...emptyProgress(),
  completed_session_ids: completed,
  answers,
});

describe("The Awakening Journey — content", () => {
  it("has 11 sessions in canonical order", () => {
    expect(AWAKENING_TOTAL).toBe(11);
    expect(AWAKENING_SESSIONS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(AWAKENING_CANONICAL_ORDER).toHaveLength(11);
    expect(new Set(AWAKENING_CANONICAL_ORDER).size).toBe(11);
  });

  it("opens with the observer and closes with the integration session", () => {
    expect(AWAKENING_CANONICAL_ORDER[0]).toBe("meet_the_observer");
    expect(AWAKENING_CANONICAL_ORDER[10]).toBe("design_conscious_life");
  });

  it("every session has the full beat spine: arrival, observation, investigation x2, practice, application, reflection", () => {
    for (const s of AWAKENING_SESSIONS) {
      const beats = s.steps.map((st) => st.kind === "question" ? st.beat : st.kind);
      expect(beats).toEqual([
        "arrival",
        "observation",
        "investigation",
        "investigation",
        "practice",
        "experiment",
        "reflection",
      ]);
      expect(s.capabilities.length).toBeGreaterThan(0);
      expect(s.experiment.vowLabel.length).toBeGreaterThan(3);
      expect(s.practice.trains.length).toBeGreaterThan(0);
      expect(s.question.length).toBeGreaterThan(5);
      expect(s.carrySeed.length).toBeGreaterThan(5);
    }
  });

  it("every session has at least two bank questions for every question beat", () => {
    for (const s of AWAKENING_SESSIONS) {
      for (const beat of ["arrival", "observation", "investigation", "reflection"] as Beat[]) {
        const bank = AWAKENING_QUESTIONS.filter((q) => q.sessionId === s.id && q.beat === beat);
        expect(bank.length, `${s.id}/${beat}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every bank question belongs to a real session", () => {
    const ids = new Set(AWAKENING_SESSIONS.map((s) => s.id));
    for (const q of AWAKENING_QUESTIONS) {
      expect(ids.has(q.sessionId), q.id).toBe(true);
    }
  });

  it("has a question bank of 90+", () => {
    expect(AWAKENING_QUESTION_COUNT).toBeGreaterThanOrEqual(90);
  });

  it("every game referenced by a practice is a registered game id", () => {
    // ids verified against the games lab registry / public registry
    const KNOWN = new Set([
      "thought-watcher", "distraction-cost", "body-scanner", "mirror-realm",
      "council-of-three", "karma-coin", "bell-in-the-wind", "finish-line", "dharma-yuddha",
    ]);
    for (const s of AWAKENING_SESSIONS) {
      if (s.practice.gameId) expect(KNOWN.has(s.practice.gameId), `${s.id}:${s.practice.gameId}`).toBe(true);
    }
  });
});

describe("planSession (adaptive selection)", () => {
  const baseCtx = { askedIds: new Set<string>(), map: null, activeLoops: [] as string[], seed: "user-123" };

  it("fills every question slot without repeats and keeps practice + experiment beats", () => {
    for (const session of AWAKENING_SESSIONS) {
      const steps = planSession(session, baseCtx);
      expect(steps).toHaveLength(session.steps.length);
      const picked = new Set<string>();
      let questions = 0;
      for (const st of steps) {
        if (st.kind === "question") {
          questions++;
          expect(picked.has(st.question.id)).toBe(false);
          picked.add(st.question.id);
          expect(AWAKENING_QUESTIONS.some((q) => q.id === st.question.id)).toBe(true);
        }
        if (st.kind === "practice") expect(st.practice).toBe(session.practice);
        if (st.kind === "experiment") expect(st.experiment).toBe(session.experiment);
      }
      expect(questions).toBe(5);
    }
  });

  it("never re-asks a question already answered", () => {
    const session = AWAKENING_SESSIONS[1];
    const all = planSession(session, baseCtx);
    const askedIds = new Set(
      all.filter((s) => s.kind === "question").map((s) => (s as { question: { id: string } }).question.id)
    );
    const second = planSession(session, { ...baseCtx, askedIds });
    const secondPicked = second
      .filter((s) => s.kind === "question")
      .map((s) => (s as { question: { id: string } }).question.id);
    expect(secondPicked.length).toBeGreaterThan(0);
    for (const id of secondPicked) expect(askedIds.has(id)).toBe(false);
  });

  it("is deterministic for the same seed and differs across seeds", () => {
    const session = AWAKENING_SESSIONS[3];
    const a = planSession(session, baseCtx);
    const b = planSession(session, baseCtx);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    const other = planSession(session, { ...baseCtx, seed: "user-999" });
    expect(JSON.stringify(other)).not.toBe(JSON.stringify(a));
  });
});

describe("analyzeCapabilities (the honest map)", () => {
  it("starts neutral at 5 with zero evidence", () => {
    const map = analyzeCapabilities(emptyProgress());
    for (const c of CAPABILITY_IDS) {
      expect(map.scores[c]).toBe(5);
      expect(map.evidence[c]).toBe(0);
      expect(map.levels[c]).toBe("hypothesized");
    }
    expect(map.summaryLines[0]).toMatch(/Nothing is read yet/);
  });

  it("folds answers into capability scores with deeper beats weighing more", () => {
    // Same two conflicting answers; when the deeper beat carries the low score,
    // the map must read lower than when the deeper beat carries the high one.
    const deepBeatLow = withAnswers([
      mkAnswer("q1", "meet_the_observer", "arrival", { awareness: 9 }),
      mkAnswer("q2", "meet_the_observer", "reflection", { awareness: 3 }),
    ]);
    const deepBeatHigh = withAnswers([
      mkAnswer("q1", "meet_the_observer", "arrival", { awareness: 3 }),
      mkAnswer("q2", "meet_the_observer", "reflection", { awareness: 9 }),
    ]);
    expect(analyzeCapabilities(deepBeatLow).scores.awareness).toBeLessThan(
      analyzeCapabilities(deepBeatHigh).scores.awareness
    );
  });

  it("tracks evidence levels and promotes measured readings", () => {
    const reported = analyzeCapabilities(withAnswers([mkAnswer("q1", "train_your_attention", "practice", { attention: 8 })]));
    expect(reported.levels.attention).toBe("self_reported");
    const measured = analyzeCapabilities(
      withAnswers([mkAnswer("q1", "train_your_attention", "practice", { attention: 8 }, undefined, "measured")])
    );
    expect(measured.levels.attention).toBe("measured");
    expect(measured.summaryLines.join(" ")).toMatch(/measured evidence/);
  });

  it("identifies the weakest capability as the growth edge", () => {
    const map = analyzeCapabilities(
      withAnswers([
        mkAnswer("q1", "inner_world", "reflection", { emotional_regulation: 2 }),
        mkAnswer("q2", "meet_the_observer", "reflection", { awareness: 9 }),
      ])
    );
    expect(map.weakest).toBe("emotional_regulation");
    expect(map.strongest).toBe("awareness");
    expect(map.summaryLines.join(" ")).toMatch(/growth edge/i);
  });

  it("never frames the map as a measurement of the person", () => {
    const map = analyzeCapabilities(withAnswers([mkAnswer("q1", "meet_the_observer", "arrival", { awareness: 7 })]));
    expect(map.summaryLines.join(" ")).toMatch(/not a measurement of you/);
  });
});

describe("answerFromQuestion (signal extraction)", () => {
  it("maps a chosen option to its capability signals and loops", () => {
    const q = AWAKENING_QUESTIONS.find((x) => x.id === "aw01_investigation_a")!;
    const a = answerFromQuestion(q, "lost", "meet_the_observer");
    expect(a.capabilities.awareness).toBe(3);
    expect(a.loops).toContain("CTL003");
    expect(a.beat).toBe("investigation");
    expect(a.evidence).toBe("self_reported");
  });

  it("interpolates scale values between low and high", () => {
    const q = AWAKENING_QUESTIONS.find((x) => x.id === "aw01_investigation_c")!;
    expect(answerFromQuestion(q, 1, "meet_the_observer").capabilities.awareness).toBe(2);
    expect(answerFromQuestion(q, 5, "meet_the_observer").capabilities.awareness).toBe(9);
    const mid = answerFromQuestion(q, 3, "meet_the_observer").capabilities.awareness!;
    expect(mid).toBeGreaterThan(2);
    expect(mid).toBeLessThan(9);
  });

  it("ignores blank text answers", () => {
    const q = AWAKENING_QUESTIONS.find((x) => x.id === "aw01_arrival_b")!;
    expect(answerFromQuestion(q, "", "meet_the_observer").capabilities).toEqual({});
    expect(answerFromQuestion(q, "  ", "meet_the_observer").capabilities).toEqual({});
    expect(Object.keys(answerFromQuestion(q, "sleep badly", "meet_the_observer").capabilities).length).toBeGreaterThan(0);
  });
});

describe("recommendNext (explainable, non-linear)", () => {
  const map = () => analyzeCapabilities(emptyProgress());

  it("always recommends the observer session first", () => {
    const rec = recommendNext(emptyProgress(), map())!;
    expect(rec.sessionId).toBe("meet_the_observer");
    expect(rec.reason).toMatch(/depends on learning to watch/);
  });

  it("aims at the weakest capability once the map has signal", () => {
    const progress = withAnswers(
      [mkAnswer("q1", "inner_world", "reflection", { emotional_regulation: 2 })],
      ["meet_the_observer"]
    );
    const rec = recommendNext(progress, analyzeCapabilities(progress))!;
    expect(rec.sessionId).not.toBe("design_conscious_life");
    const session = AWAKENING_SESSIONS.find((s) => s.id === rec.sessionId)!;
    expect(rec.reason.length).toBeGreaterThan(20);
    expect(session.capabilities).toContain(rec.targets[0]);
  });

  it("only closes with the integration session after the other ten", () => {
    const ten = AWAKENING_CANONICAL_ORDER.filter((id) => id !== "design_conscious_life");
    const progress = withAnswers([], ten);
    const rec = recommendNext(progress, analyzeCapabilities(progress))!;
    expect(rec.sessionId).toBe("design_conscious_life");
    expect(rec.reason).toMatch(/brings them together/);
  });

  it("returns null when everything is complete", () => {
    const progress = withAnswers([], AWAKENING_CANONICAL_ORDER);
    expect(recommendNext(progress, analyzeCapabilities(progress))).toBeNull();
  });

  it("gives different users different middle orders", () => {
    const distracted = analyzeCapabilities(
      withAnswers([mkAnswer("q1", "train_your_attention", "reflection", { attention: 2 })])
    );
    const reactive = analyzeCapabilities(
      withAnswers([mkAnswer("q1", "space_before_reacting", "reflection", { emotional_regulation: 2 })])
    );
    const orderA = personalOrder(distracted).map((o) => o.id);
    const orderB = personalOrder(reactive).map((o) => o.id);
    expect(orderA[0]).toBe("meet_the_observer");
    expect(orderA[10]).toBe("design_conscious_life");
    expect(orderA).not.toEqual(orderB);
  });
});

describe("recommendPaths", () => {
  it("ranks paths by the user's weakest capability", () => {
    const map = analyzeCapabilities(
      withAnswers([mkAnswer("q1", "train_your_attention", "reflection", { attention: 2 })])
    );
    const paths = recommendPaths(map);
    expect(paths).toHaveLength(3);
    expect(paths[0].slug).toBe("attention-training");
    expect(paths[0].journeySlug).toBe("decondition-the-mind");
  });
});

describe("buildReport (the development report)", () => {
  const progress: AwakeningProgress = {
    ...emptyProgress(),
    completed_session_ids: AWAKENING_CANONICAL_ORDER,
    answers: [
      mkAnswer("q1", "meet_the_observer", "observation", { awareness: 7 }, undefined, "self_reported", "I noticed the noise"),
      mkAnswer("q2", "automatic_patterns", "investigation", { behavioral_patterns: 6 }, ["BHV007"]),
      mkAnswer("q3", "train_your_attention", "practice", { attention: 8 }, undefined, "measured"),
      mkAnswer("q4", "understand_your_karma", "reflection", { intention: 7 }, ["CTL003"]),
    ],
    vows: { meet_the_observer: "I'll pause and ask", automatic_patterns: "I'll catch three" },
    vow_results: { meet_the_observer: "kept", automatic_patterns: "partly" },
  };

  it("reports only what the user actually did", () => {
    const report = buildReport(progress, analyzeCapabilities(progress));
    expect(report.vows).toEqual({ kept: 1, partly: 1, notYet: 0, total: 2 });
    expect(report.practicesCompleted).toBe(11);
    expect(report.patternsIdentified.map((p) => p.id)).toContain("BHV007");
    expect(report.headline).toMatch(/4 of your own answers/);
    expect(report.sections.map((s) => s.id)).toEqual([
      "awareness", "patterns", "karma", "attention", "regulation", "discipline", "values",
    ]);
  });

  it("names strengths and growth edges without moralising", () => {
    const report = buildReport(progress, analyzeCapabilities(progress));
    expect(report.strengths.length).toBe(2);
    expect(report.growthEdges.length).toBe(2);
    const all = JSON.stringify(report).toLowerCase();
    expect(all).not.toMatch(/enlightened|superior|rank/);
  });

  it("recommends paths from the map", () => {
    const report = buildReport(progress, analyzeCapabilities(progress));
    expect(report.recommendedPaths.length).toBeGreaterThan(0);
    for (const p of report.recommendedPaths) expect(p.reason.length).toBeGreaterThan(10);
  });
});
