import { describe, expect, it } from "vitest";
import { getCurrentGateForSchedule } from "./dailyGates";

describe("getCurrentGateForSchedule", () => {
  const dateAt = (hours: number, minutes = 0) => new Date(2025, 0, 1, hours, minutes);

  it("divides the waking day into gates relative to the saved schedule", () => {
    expect(getCurrentGateForSchedule(dateAt(7, 30), "07:00", "23:00")).toBe("morning");
    expect(getCurrentGateForSchedule(dateAt(12), "07:00", "23:00")).toBe("midday");
    expect(getCurrentGateForSchedule(dateAt(18), "07:00", "23:00")).toBe("evening");
    expect(getCurrentGateForSchedule(dateAt(21), "07:00", "23:00")).toBe("night");
  });

  it("keeps overnight hours in the night gate, including schedules crossing midnight", () => {
    expect(getCurrentGateForSchedule(dateAt(2), "07:00", "23:00")).toBe("night");
    expect(getCurrentGateForSchedule(dateAt(1), "10:00", "02:00")).toBe("night");
  });

  it("falls back to the existing clock-based gates for invalid schedules", () => {
    expect(getCurrentGateForSchedule(dateAt(13), "invalid", "22:30")).toBe("midday");
    expect(getCurrentGateForSchedule(dateAt(22), "06:30", "06:30")).toBe("night");
  });
});
