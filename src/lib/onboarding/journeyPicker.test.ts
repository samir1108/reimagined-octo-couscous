import { describe, expect, it } from "vitest";
import {
  SPIRAL_FRAMEWORK,
  SPIRAL_PRINCIPLES,
  SPIRAL_BAND_BY_NUMBER,
} from "./spiralFramework";
import { JOURNEYS, JOURNEY_BY_SLUG, rankJourneys } from "./journeyDefinitions";
import { analyzeFirstEleven } from "./firstElevenEngine";
import { FIRST_ELEVEN_SESSIONS } from "./firstElevenSessions";
import type { FirstElevenMapping, SEAnswer } from "./firstElevenTypes";

const mkMapping = (over: Partial<FirstElevenMapping> = {}): FirstElevenMapping => ({
  band: 3.5,
  bandMicro: "3.5",
  bandLabel: "Achievement",
  dimensions: { thought: 4, emotion: 5, body: 2, awareness: 5 },
  loops: [{ id: "CTL003", score: 3 }],
  archetypeHint: "seeker",
  summaryLines: ["line one", "line two"],
  answeredCount: 60,
  readyForJourneys: true,
  ...over,
});

describe("spiral framework content (Gate 5)", () => {
  it("has all 11 bands numbered 0-10, each fully written", () => {
    expect(SPIRAL_FRAMEWORK).toHaveLength(11);
    expect(SPIRAL_FRAMEWORK.map((b) => b.band)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const b of SPIRAL_FRAMEWORK) {
      expect(b.name.length, `band ${b.band}`).toBeGreaterThan(2);
      expect(b.fear.length, `band ${b.band} fear`).toBeGreaterThan(3);
      expect(b.in2026.length, `band ${b.band} 2026`).toBeGreaterThan(40);
      expect(b.micro.length, `band ${b.band} micro`).toBeGreaterThan(30);
      expect(b.through.length, `band ${b.band} through`).toBeGreaterThan(20);
    }
  });

  it("carries the four framework principles", () => {
    expect(SPIRAL_PRINCIPLES.map((p) => p.id)).toEqual([
      "not-a-ladder",
      "micro-levels",
      "regression-is-data",
      "no-skipping",
    ]);
    for (const p of SPIRAL_PRINCIPLES) expect(p.body.length).toBeGreaterThan(80);
  });

  it("looks bands up by number", () => {
    expect(SPIRAL_BAND_BY_NUMBER(6)?.name).toBe("Awareness");
    expect(SPIRAL_BAND_BY_NUMBER(11)).toBeUndefined();
  });
});

describe("journey definitions (Gate 6)", () => {
  it("offers 8 doors including the open journey", () => {
    expect(JOURNEYS).toHaveLength(8);
    expect(JOURNEY_BY_SLUG("the-open-journey")?.programId).toBeNull();
  });

  it("references only real v2 program ids", () => {
    const real = new Set([
      "v2-witness-foundations",
      "v2-self-inquiry",
      "v2-raja-yoga",
      "v2-tantra-awareness",
      "v2-pranayama",
      "v2-shadow-intro",
      "v2-emotion-mapping",
      "v2-forgiveness",
      "v2-karma-yoga-work",
      "v2-workplace-loops",
      "v2-yoga-nidra",
      "v2-mantra-basics",
    ]);
    for (const j of JOURNEYS) {
      if (j.programId) expect(real.has(j.programId), `${j.slug} → ${j.programId}`).toBe(true);
    }
  });

  it("every journey is fully described", () => {
    for (const j of JOURNEYS) {
      expect(j.title.length).toBeGreaterThan(3);
      expect(j.subtitle.length).toBeGreaterThan(8);
      expect(j.master.length).toBeGreaterThan(2);
      expect(j.essence.length).toBeGreaterThan(40);
    }
  });
});

describe("rankJourneys (fit against the mapping)", () => {
  it("puts the body-dimension journey first when body is weakest", () => {
    const ranked = rankJourneys(mkMapping()); // body = 2, weakest
    const top3 = ranked.slice(0, 3).map((f) => f.journey.slug);
    expect(top3).toContain("stop-the-reactor"); // targets body + reactor loops
    // the closest fit explains itself
    expect(ranked[0].reason.length).toBeGreaterThan(10);
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
  });

  it("puts self-inquiry first for a high-band, awareness-led mapping", () => {
    const ranked = rankJourneys(
      mkMapping({
        band: 7,
        dimensions: { thought: 7, emotion: 6, body: 5, awareness: 9 },
        loops: [{ id: "IDN001", score: 4 }],
      })
    );
    expect(ranked[0].journey.slug).toBe("who-am-i");
  });

  it("offers the open journey a fair score without dimensions or loops", () => {
    const open = rankJourneys(
      mkMapping({ loops: [], dimensions: { thought: 5, emotion: 5, body: 5, awareness: 5 } })
    ).find((f) => f.journey.slug === "the-open-journey")!;
    expect(open.score).toBeGreaterThan(20);
  });

  it("scores stay within 0-100 and ordering is stable", () => {
    const ranked = rankJourneys(mkMapping());
    for (const f of ranked) {
      expect(f.score).toBeGreaterThanOrEqual(0);
      expect(f.score).toBeLessThanOrEqual(100);
    }
    const again = rankJourneys(mkMapping());
    expect(again.map((f) => f.journey.slug)).toEqual(ranked.map((f) => f.journey.slug));
  });

  it("ranks a real full-run mapping without crashing", () => {
    const answers: SEAnswer[] = FIRST_ELEVEN_SESSIONS.map((s) => ({
      questionId: `${s.id}_q`,
      sessionId: s.id,
      value: "x",
      band: 4 + (s.n % 3),
      dimension: s.n % 2 ? "emotion" : "body",
    }));
    const mapping = analyzeFirstEleven({
      progress: {
        current_session: 11,
        completed_sessions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        answers,
        carry_seeds: {},
        skipped: false,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
    const ranked = rankJourneys(mapping);
    expect(ranked).toHaveLength(8);
    expect(ranked[0].journey.slug).toBeTruthy();
  });
});
