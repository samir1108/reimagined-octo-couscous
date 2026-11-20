import { describe, expect, it } from "vitest";

import {
  GUIDE_FALLBACK_SPOKEN,
  GUIDE_INTRO,
  GUIDE_INTRO_WELCOME,
  GUIDE_TOPICS,
  GUIDE_TOUR,
  GUIDE_WELCOME,
  getGuideTopic,
  looksLikeQuestion,
  matchTopic,
  normalize,
  parseCommand,
  rankTopics,
} from "@/lib/app-guide";

describe("app guide topics", () => {
  it("ships the concepts users actually ask about", () => {
    const ids = GUIDE_TOPICS.map((topic) => topic.id);
    for (const required of [
      "sessions",
      "loops",
      "v-level",
      "h-level",
      "life-domains",
      "yoga",
      "orb",
    ]) {
      expect(ids).toContain(required);
    }
  });

  it("has unique ids", () => {
    const ids = GUIDE_TOPICS.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every spoken beat voice-safe", () => {
    for (const topic of GUIDE_TOPICS) {
      expect(topic.spoken.length).toBeGreaterThan(0);
      for (const beat of topic.spoken) {
        expect(beat.trim().length).toBeGreaterThan(12);
        expect(beat.length).toBeLessThan(320);
        expect(beat).not.toMatch(/[*_`#<>[\]]/);
        expect(beat).not.toMatch(/https?:\/\//);
      }
    }
  });

  it("keeps follow-ups and actions resolvable", () => {
    for (const topic of GUIDE_TOPICS) {
      for (const id of topic.followUps) {
        expect(getGuideTopic(id), `${topic.id} -> ${id}`).toBeDefined();
      }
      if (topic.action) {
        expect(topic.action.to.startsWith("/")).toBe(true);
        expect(topic.action.label.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the tour to real topics and greets in voice-safe prose", () => {
    expect(GUIDE_TOUR.length).toBeGreaterThan(8);
    for (const id of GUIDE_TOUR) {
      expect(getGuideTopic(id)).toBeDefined();
    }
    expect(GUIDE_WELCOME.spoken.length).toBeGreaterThan(1);
    expect(GUIDE_FALLBACK_SPOKEN.length).toBeLessThan(320);
  });

  it("keeps the first-run intro to three real stops", () => {
    expect(GUIDE_INTRO).toEqual(["loops", "life-domains", "yoga"]);
    for (const id of GUIDE_INTRO) {
      expect(getGuideTopic(id)).toBeDefined();
    }
    expect(GUIDE_INTRO_WELCOME.spoken.length).toBeGreaterThan(0);
    expect(GUIDE_INTRO_WELCOME.spoken.join(" ").length).toBeLessThan(420);
  });
});

describe("app guide matching", () => {
  it("normalizes punctuation, case and diacritics", () => {
    expect(normalize("V-Level?!")).toBe("v level");
    expect(normalize("  Loops   kya hai  ")).toBe("loops kya hai");
  });

  it.each([
    ["what is a session", "sessions"],
    ["session kya hai", "sessions"],
    ["loops kya hai", "loops"],
    ["what is a loop", "loops"],
    ["sanskar kya hota hai", "samskara"],
    ["v level kaise calculate hota hai", "v-level"],
    ["v-level kya hai", "v-level"],
    ["h level kya hai", "h-level"],
    ["what are the twelve capacities", "h-level"],
    ["life domain matlab kya", "life-domains"],
    ["yoga kya hai", "yoga"],
    ["eight limbs of patanjali", "yoga"],
    ["orb kaise use kare", "orb"],
    ["journal kya hai", "journal"],
    ["streak miss ho gaya", "rhythm"],
    ["witness gap", "witness"],
  ])("matches %j to %s", (query, expected) => {
    const match = matchTopic(query);
    expect(match?.topic.id).toBe(expected);
    expect(match?.confident).toBe(true);
  });

  it("refuses to guess on unrelated questions", () => {
    const match = matchTopic("how do i cook pasta al dente");
    expect(match?.confident ?? false).toBe(false);
  });

  it("ranks the closest topics for a soft match", () => {
    const ranked = rankTopics("level", undefined, 3);
    expect(ranked.length).toBeGreaterThan(0);
    expect(["v-level", "h-level"]).toContain(ranked[0].topic.id);
  });
});

describe("app guide commands", () => {
  it.each([
    ["next", "next"],
    ["next topic", "next"],
    ["agla", "next"],
    ["aage", "next"],
    ["ruko", "stop"],
    ["stop the voice", "stop"],
    ["phir se", "repeat"],
    ["say that again", "repeat"],
    ["shuru karo", "tour"],
    ["peeche", "previous"],
  ] as const)("parses %j as %s", (text, expected) => {
    expect(parseCommand(text)).toBe(expected);
  });

  it("does not steal long questions", () => {
    expect(parseCommand("what is the difference between v level and h level")).toBeNull();
  });

  it("recognizes questions in both languages", () => {
    expect(looksLikeQuestion("what is a session?")).toBe(true);
    expect(looksLikeQuestion("loop kya hai")).toBe(true);
    expect(looksLikeQuestion("tell me about yoga")).toBe(true);
    expect(looksLikeQuestion("ok")).toBe(false);
  });
});
