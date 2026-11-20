import { describe, expect, it } from "vitest";
import { getLadderProgress } from "./initiationLadder";

describe("getLadderProgress", () => {
  it("measures progress from completed sittings toward the next milestone", () => {
    expect(getLadderProgress(0)).toEqual({
      completed: 0,
      nextMilestone: { count: 1, name: "The Recognition" },
      progress: 0,
    });
    expect(getLadderProgress(4)).toEqual({
      completed: 4,
      nextMilestone: { count: 7, name: "The First Ceremony" },
      progress: 0.5,
    });
  });

  it("starts a new interval when a milestone is reached", () => {
    expect(getLadderProgress(7)).toEqual({
      completed: 7,
      nextMilestone: { count: 10, name: "The First Loop Death" },
      progress: 0,
    });
  });

  it("caps progress after the final named milestone", () => {
    expect(getLadderProgress(500)).toEqual({
      completed: 500,
      nextMilestone: null,
      progress: 1,
    });
  });
});
