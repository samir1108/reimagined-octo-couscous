import { describe, expect, it } from "vitest";
import { analyzeFirstEleven, SPIRAL_BANDS, spiralBandLabel, loopName } from "./firstElevenEngine";
import { FIRST_ELEVEN_SESSIONS } from "./firstElevenSessions";
import type { FirstElevenProgress, SEAnswer } from "./firstElevenTypes";
import { ARCHETYPES } from "@/data/onboarding/archetypes";

const mkProgress = (answers: SEAnswer[], completed: number[]): FirstElevenProgress => ({
  current_session: Math.min(11, completed.length + 1),
  completed_sessions: completed,
  answers,
  carry_seeds: {},
  skipped: false,
  completed_at: completed.length >= 11 ? new Date().toISOString() : null,
  updated_at: new Date().toISOString(),
});

/** A full run: every sitting answered with one mid-band awareness answer. */
function fullRun(band: number, dimension: SEAnswer["dimension"] = "awareness") {
  const answers: SEAnswer[] = FIRST_ELEVEN_SESSIONS.map((s) => ({
    questionId: `${s.id}_mirror`,
    sessionId: s.id,
    value: "x",
    band,
    dimension,
  }));
  return mkProgress(answers, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
}

describe("The Mirror mapping payload", () => {
  it("produces a renderable payload after all eleven sittings", () => {
    const m = analyzeFirstEleven({ progress: fullRun(6) });
    expect(m.readyForJourneys).toBe(true);
    expect(m.bandMicro).toMatch(/^\d\.\d$/);
    expect(SPIRAL_BANDS.some((b) => b.name === m.bandLabel)).toBe(true);
    expect(m.summaryLines.length).toBeGreaterThanOrEqual(2);
    expect(m.summaryLines.every((l) => typeof l === "string" && l.length > 10)).toBe(true);
  });

  it("has all four dimensions at 0-10", () => {
    const m = analyzeFirstEleven({ progress: fullRun(5, "emotion") });
    for (const v of Object.values(m.dimensions)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
    // only emotion was ever answered; others default to the neutral 3
    expect(m.dimensions.emotion).toBeGreaterThan(3);
    expect(m.dimensions.body).toBe(3);
  });

  it("lists loops with catalog names for display", () => {
    const answers: SEAnswer[] = FIRST_ELEVEN_SESSIONS.slice(0, 4).map((s) => ({
      questionId: `${s.id}_l`,
      sessionId: s.id,
      value: "a",
      band: 3,
      dimension: "emotion",
      loops: ["VAL025", "HAB001"],
    }));
    const m = analyzeFirstEleven({ progress: mkProgress(answers, [1, 2, 3, 4]) });
    expect(m.loops.map((l) => l.id)).toEqual(["VAL025", "HAB001"]);
    expect(loopName("VAL025")).toBe("Comparison");
    for (const l of m.loops) expect(loopName(l.id)).not.toBe(l.id);
  });

  it("maps band hints to real archetypes the Mirror can name", () => {
    for (const band of [0.5, 2, 3.2, 4.8, 6.1, 7.2, 8.3, 9.2, 9.8]) {
      const m = analyzeFirstEleven({ progress: fullRun(band) });
      const slug = m.archetypeHint;
      expect(ARCHETYPES.some((a) => a.slug === slug), `${band} → ${slug}`).toBe(true);
    }
  });

  it("is not ready for journeys until eleven are complete", () => {
    const ten = mkProgress(
      FIRST_ELEVEN_SESSIONS.slice(0, 10).map((s) => ({
        questionId: `${s.id}_q`, sessionId: s.id, value: "x", band: 6, dimension: "awareness" as const,
      })),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    );
    expect(analyzeFirstEleven({ progress: ten }).readyForJourneys).toBe(false);
  });

  it("spiral labels cover 0-10 with no gaps", () => {
    for (let b = 0; b <= 10; b++) {
      expect(SPIRAL_BANDS.some((x) => x.band === b && x.name.length > 0)).toBe(true);
      expect(spiralBandLabel(b)).toBe(SPIRAL_BANDS[b].name);
    }
  });
});
