import { describe, expect, it } from "vitest";
import {
  buildDayPlan,
  defaultDayPlanConfig,
  normalizeDayPlanConfig,
  type DayPlanConfig,
} from "@/lib/dayPlan";

const at = (hour: number, minute = 0) => new Date(2026, 10, 14, hour, minute);

describe("defaultDayPlanConfig", () => {
  it("builds four blocks from wake and sleep times", () => {
    const config = defaultDayPlanConfig("06:00", "22:00");
    expect(config.blocks.map((block) => block.id)).toEqual(["morning", "midday", "evening", "night"]);
    expect(config.blocks[0].start).toBe("06:00");
    expect(config.blocks[3].start).toBe("22:00");
    expect(config.blocks[3].end).toBe("06:00");
  });

  it("falls back to sane windows for unusable times", () => {
    const config = defaultDayPlanConfig("23:00", "12:00");
    expect(config.blocks[0].start).toBe("06:30");
    expect(config.blocks[3].end).toBe("06:30");
  });
});

describe("normalizeDayPlanConfig", () => {
  it("drops invalid blocks and caps the count", () => {
    const raw = {
      blocks: [
        ...Array.from({ length: 30 }, (_, index) => ({
          id: `b${index}`,
          label: `Block ${index}`,
          start: "06:00",
          end: "07:00",
        })),
        { id: "bad", label: "Bad", start: "06:00", end: "06:00" },
      ],
      enabledKinds: [],
      density: "nonsense",
    };
    const config = normalizeDayPlanConfig(raw);
    expect(config.blocks).toHaveLength(24);
    expect(config.blocks.some((block) => block.id === "bad")).toBe(false);
    expect(config.enabledKinds.length).toBeGreaterThan(0);
    expect(config.density).toBe("standard");
  });
});

describe("buildDayPlan", () => {
  it("marks the matching block current and keeps gate completion", () => {
    const plan = buildDayPlan(
      defaultDayPlanConfig(),
      { gateDone: { morning_done: true } },
      at(10),
    );
    expect(plan.currentBlockId).toBe("morning");
    const morning = plan.blocks.find((block) => block.id === "morning");
    expect(morning?.items.find((item) => item.id === "gate-morning")?.status).toBe("done");
  });

  it("treats the wrapping night block as current after midnight", () => {
    const plan = buildDayPlan(defaultDayPlanConfig(), {}, at(2));
    expect(plan.currentBlockId).toBe("night");
    expect(plan.blocks.find((block) => block.id === "morning")?.isPast).toBe(false);
  });

  it("marks earlier blocks past later in the day", () => {
    const plan = buildDayPlan(defaultDayPlanConfig(), {}, at(15));
    expect(plan.currentBlockId).toBe("midday");
    expect(plan.blocks.find((block) => block.id === "morning")?.isPast).toBe(true);
    expect(plan.blocks.find((block) => block.id === "night")?.isPast).toBe(false);
  });

  it("places custom items in their block and respects weekly repeat", () => {
    const config: DayPlanConfig = {
      ...defaultDayPlanConfig(),
      customItems: [
        {
          id: "walk",
          blockId: "midday",
          title: "Walk",
          minutes: 20,
          repeat: "weekly",
          weekdays: [1],
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      ],
    };

    const monday = buildDayPlan(config, {}, new Date(2026, 10, 16, 15));
    const midday = monday.blocks.find((block) => block.id === "midday");
    expect(midday?.items.some((item) => item.id === "custom-walk")).toBe(true);

    const tuesday = buildDayPlan(config, {}, new Date(2026, 10, 17, 15));
    expect(tuesday.blocks.some((block) => block.items.some((item) => item.id === "custom-walk"))).toBe(false);
  });

  it("respects density limits without dropping sessions", () => {
    const plan = buildDayPlan(
      { ...defaultDayPlanConfig(), density: "minimal" },
      {
        practices: Array.from({ length: 8 }, (_, index) => ({
          id: `practice-${index}`,
          title: `Practice ${index}`,
        })),
      },
      at(10),
    );

    for (const block of plan.blocks) {
      expect(block.items.length).toBeLessThanOrEqual(2);
      expect(block.items.some((item) => item.kind === "session")).toBe(true);
    }
  });

  it("never drops sessions when the block limit is tight", () => {
    const config: DayPlanConfig = {
      ...defaultDayPlanConfig(),
      blocks: [{ id: "whole-day", label: "Whole day", start: "00:00", end: "23:59" }],
    };
    const plan = buildDayPlan(config, {}, at(10));
    expect(plan.blocks[0].items.filter((item) => item.kind === "session")).toHaveLength(4);
  });

  it("counts completed items into progress", () => {
    const plan = buildDayPlan(
      defaultDayPlanConfig(),
      { gateDone: { morning_done: true, midday_done: true } },
      at(15),
    );
    expect(plan.completedItems).toBeGreaterThanOrEqual(2);
    expect(plan.progress).toBeGreaterThan(0);
  });
});
