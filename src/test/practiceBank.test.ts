import { describe, expect, it } from "vitest";
import {
  DURATION_SLOTS,
  MAX_PRACTICE_SECONDS,
  PRACTICE_BANK_SIZE,
  PRACTICE_BANK_STATS,
  PRACTICE_WORLDS,
  buildOrbPractice,
  countPractices,
  durationBandFor,
  formatPracticeDuration,
  isDeepgramSttSupported,
  isSttSupported,
  listPractices,
  listenOnce,
  nearestDurationSlot,
  pickPractice,
  practiceId,
  practiceMatchesQuery,
  practiceSpecAtIndex,
  practiceSpecToIndex,
  recommendOrbPractice,
  videoForPractice,
} from "@/lib/practice-bank";

describe("practice bank", () => {
  it("holds at least 100,000 practices", () => {
    expect(PRACTICE_BANK_SIZE).toBeGreaterThanOrEqual(100_000);
    expect(PRACTICE_BANK_STATS.atoms).toBeGreaterThan(100);
  });

  it("spans one second to twelve hours", () => {
    expect(DURATION_SLOTS[0].seconds).toBe(1);
    expect(DURATION_SLOTS[DURATION_SLOTS.length - 1].seconds).toBe(MAX_PRACTICE_SECONDS);
    expect(MAX_PRACTICE_SECONDS).toBe(43_200);
    expect(durationBandFor(1)).toBe("impulse");
    expect(durationBandFor(43_200)).toBe("marathon");
  });

  it("round-trips index and spec", () => {
    for (const index of [0, 1, 55, 999, 123_456, PRACTICE_BANK_SIZE - 1]) {
      const spec = practiceSpecAtIndex(index);
      const encoded = practiceSpecToIndex(spec);
      expect(practiceSpecAtIndex(encoded).atomId).toBe(spec.atomId);
      expect(practiceSpecAtIndex(encoded).durationSec).toBe(spec.durationSec);
      expect(practiceSpecAtIndex(encoded).modeId).toBe(spec.modeId);
      expect(practiceSpecAtIndex(encoded).worldId).toBe(spec.worldId);
      expect(practiceSpecAtIndex(encoded).level).toBe(spec.level);
    }
  });

  it("produces unique ids across a large sample", () => {
    const ids = new Set<string>();
    for (let index = 0; index < 5000; index += 1) {
      const spec = practiceSpecAtIndex(index * 101);
      ids.add(practiceId(spec));
    }
    expect(ids.size).toBe(5000);
  });

  it("filters by duration and mode", () => {
    const spec = pickPractice({ durationSec: 60, modeId: "inquiry", level: 3 }, "test-seed");
    expect(spec.durationSec).toBe(60);
    expect(spec.modeId).toBe("inquiry");
    expect(spec.level).toBe(3);
    expect(practiceMatchesQuery(spec, { durationSec: 60 })).toBe(true);
    expect(countPractices({ durationSec: 60, modeId: "inquiry" })).toBeGreaterThan(0);
  });

  it("lists without duplicates", () => {
    const results = listPractices({ band: "drop" }, { limit: 10, seed: 7 });
    expect(results).toHaveLength(10);
    expect(new Set(results.map(practiceId)).size).toBe(10);
    for (const spec of results) {
      expect(durationBandFor(spec.durationSec)).toBe("drop");
    }
  });
});

describe("orb script", () => {
  it("covers the full duration for every band", () => {
    const indexes = [0, ...DURATION_SLOTS.map((slot) => DURATION_SLOTS.indexOf(slot) * 3_333)];
    const seen = new Set<string>();
    for (const index of indexes) {
      const practice = buildOrbPractice(index);
      seen.add(practice.band);
      expect(practice.beats[0].atSec).toBe(0);
      expect(practice.beats[practice.beats.length - 1].atSec).toBeLessThan(practice.durationSec);
      const total = practice.beats.reduce((sum, beat) => sum + beat.seconds, 0);
      expect(total).toBe(practice.durationSec);
      for (let i = 1; i < practice.beats.length; i += 1) {
        expect(practice.beats[i].atSec).toBeGreaterThanOrEqual(practice.beats[i - 1].atSec);
      }
    }
    expect(seen.size).toBeGreaterThanOrEqual(6);
  });

  it("keeps a twelve-hour sitting sparse", () => {
    const spec = pickPractice({ maxDurationSec: MAX_PRACTICE_SECONDS, minDurationSec: MAX_PRACTICE_SECONDS }, 9);
    const practice = buildOrbPractice(spec);
    expect(practice.durationSec).toBe(MAX_PRACTICE_SECONDS);
    expect(practice.beats.length).toBeLessThan(200);
    const spoken = practice.beats.filter((beat) => beat.speak).length;
    expect(spoken).toBeLessThan(120);
  });

  it("stays silent in silent mode", () => {
    const spec = pickPractice({ durationSec: 300, modeId: "silent" }, 3);
    const practice = buildOrbPractice(spec);
    expect(practice.speaks).toBe(false);
    expect(practice.beats.every((beat) => beat.speak === null)).toBe(true);
  });

  it("marks voice-inquiry beats for listening", () => {
    const spec = pickPractice({ durationSec: 1800, modeId: "inquiry" }, 4);
    const practice = buildOrbPractice(spec);
    expect(practice.listens).toBe(true);
    expect(practice.beats.some((beat) => Boolean(beat.listenPrompt))).toBe(true);
  });

  it("formats durations readably", () => {
    expect(formatPracticeDuration(1)).toBe("1s");
    expect(formatPracticeDuration(90)).toBe("1m 30s");
    expect(formatPracticeDuration(3600)).toBe("1h");
    expect(formatPracticeDuration(43200)).toBe("12h");
    expect(nearestDurationSlot(43_000)).toBe(DURATION_SLOTS.length - 1);
  });
});

describe("orb recommendation", () => {
  it("returns a real practice for each time slot", () => {
    for (const slot of ["morning", "midday", "evening", "night"] as const) {
      const spec = recommendOrbPractice({ slot, energy: "medium", mood: "neutral" }, 600, slot);
      const practice = buildOrbPractice(spec);
      expect(practice.durationSec).toBe(600);
      expect(practice.beats.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic for the same metrics and seed", () => {
    const a = recommendOrbPractice({ slot: "night", energy: "low", mood: "tense" }, 300, "stable");
    const b = recommendOrbPractice({ slot: "night", energy: "low", mood: "tense" }, 300, "stable");
    expect(practiceId(a)).toBe(practiceId(b));
  });
});

describe("media layers", () => {
  it("maps every bience world to a film loop", () => {
    for (const world of PRACTICE_WORLDS) {
      const spec = pickPractice({ worldId: world.id, durationSec: 300 }, world.id);
      const practice = buildOrbPractice(spec);
      const media = videoForPractice(practice);
      expect(media.url).toMatch(/^(https?:|\/)/);
      expect(media.label.length).toBeGreaterThan(0);
    }
  });

  it("prefers a mode-specific film over the world film", () => {
    const body = buildOrbPractice(pickPractice({ modeId: "body", durationSec: 600 }, 1));
    const inquiry = buildOrbPractice(pickPractice({ modeId: "inquiry", durationSec: 600 }, 2));
    expect(videoForPractice(body).url).not.toBe(videoForPractice(inquiry).url);
  });
});

describe("speech bridge", () => {
  it("degrades quietly when speech recognition is absent", async () => {
    expect(isSttSupported()).toBe(false);
    expect(isDeepgramSttSupported()).toBe(false);
    const handle = listenOnce({ timeoutMs: 10 });
    await expect(handle.result).resolves.toBeNull();
  });
});
