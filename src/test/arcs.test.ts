import { describe, expect, it } from "vitest";
import {
  ARCS,
  arcPercent,
  canCompleteSit,
  completeArcSit,
  createProgress,
  getArc,
  isArcComplete,
  nextSit,
  nextSitIndex,
} from "@/lib/arcs";

describe("arc catalog", () => {
  it("ships six arcs with five sits each", () => {
    expect(ARCS).toHaveLength(6);
    for (const arc of ARCS) {
      expect(arc.sits).toHaveLength(5);
      expect(new Set(arc.sits.map((s) => s.index))).toEqual(new Set([1, 2, 3, 4, 5]));
    }
  });

  it("keeps the observer arc cross-concept", () => {
    const observer = getArc("observer");
    expect(observer).toBeDefined();
    const concepts = observer!.sits.map((s) => s.concept);
    expect(concepts).toEqual([
      "observation",
      "observation",
      "observation",
      "self_inquiry",
      "neti_neti",
    ]);
  });

  it("covers all four paths at level 1", () => {
    const ids = ARCS.filter((a) => a.family === "path").map((a) => a.id);
    expect(ids).toEqual(["bhakti_1", "jnana_1", "karma_1", "raja_1"]);
  });
});

describe("arc runtime", () => {
  const arc = getArc("observer")!;

  it("starts at the first sit", () => {
    const progress = createProgress(arc.id);
    expect(nextSitIndex(arc, progress)).toBe(1);
    expect(nextSit(arc, progress)?.title).toBe(arc.sits[0].title);
  });

  it("advances in order and refuses skips", () => {
    const progress = createProgress(arc.id);
    expect(canCompleteSit(arc, progress, 3)).toBe(false);
    const afterOne = completeArcSit(arc, progress, 1);
    expect(afterOne.completed).toEqual([1]);
    expect(nextSitIndex(arc, afterOne)).toBe(2);
    expect(canCompleteSit(arc, afterOne, 3)).toBe(false);
    expect(canCompleteSit(arc, afterOne, 2)).toBe(true);
  });

  it("completes and reports percent", () => {
    let progress = createProgress(arc.id);
    for (const sit of arc.sits) progress = completeArcSit(arc, progress, sit.index);
    expect(isArcComplete(arc, progress)).toBe(true);
    expect(arcPercent(arc, progress)).toBe(100);
    expect(nextSitIndex(arc, progress)).toBeNull();
  });

  it("is idempotent for a repeated completion", () => {
    const once = completeArcSit(arc, createProgress(arc.id), 1);
    const twice = completeArcSit(arc, once, 1);
    expect(twice.completed).toEqual([1]);
  });
});
