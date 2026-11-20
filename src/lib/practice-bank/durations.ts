/**
 * Duration ladder for the orb practice bank.
 *
 * The bank has to cover the full range a body can actually sit for:
 * one breath (1s) through a twelve-hour vigil (43,200s). The slots are dense
 * where humans make decisions (seconds to minutes) and sparse where they don't
 * (multi-hour stretches), so a UI slider can walk the whole range in one axis.
 */

export const MAX_PRACTICE_SECONDS = 12 * 60 * 60;

export type DurationBandId = "impulse" | "drop" | "short" | "sitting" | "deep" | "long" | "marathon";

export interface DurationBand {
  id: DurationBandId;
  label: string;
  hint: string;
  maxSeconds: number;
}

export const DURATION_BANDS: readonly DurationBand[] = [
  { id: "impulse", label: "Impulse", hint: "One breath to ten seconds", maxSeconds: 10 },
  { id: "drop", label: "Drop", hint: "Ten seconds to one minute", maxSeconds: 60 },
  { id: "short", label: "Short", hint: "One to five minutes", maxSeconds: 5 * 60 },
  { id: "sitting", label: "Sitting", hint: "Five to thirty minutes", maxSeconds: 30 * 60 },
  { id: "deep", label: "Deep", hint: "Thirty minutes to two hours", maxSeconds: 2 * 60 * 60 },
  { id: "long", label: "Long", hint: "Two to six hours", maxSeconds: 6 * 60 * 60 },
  { id: "marathon", label: "Marathon", hint: "Six to twelve hours", maxSeconds: MAX_PRACTICE_SECONDS },
];

export function durationBandFor(seconds: number): DurationBandId {
  const safe = Math.max(1, Math.min(MAX_PRACTICE_SECONDS, Math.round(seconds)));
  for (const band of DURATION_BANDS) {
    if (safe <= band.maxSeconds) return band.id;
  }
  return "marathon";
}

export function durationBandLabel(id: DurationBandId): string {
  return DURATION_BANDS.find((band) => band.id === id)?.label ?? "Practice";
}

/** Human clock: 1s, 45s, 4m, 1h 30m, 12h. */
export function formatPracticeDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  if (safe < 60) return `${safe}s`;
  const minutes = Math.floor(safe / 60);
  const restSeconds = safe % 60;
  if (minutes < 60) return restSeconds ? `${minutes}m ${restSeconds}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes ? `${hours}h ${restMinutes}m` : `${hours}h`;
}

export interface DurationSlot {
  seconds: number;
  label: string;
  band: DurationBandId;
}

const SLOT_SECONDS: readonly number[] = [
  1, 2, 3, 5, 8, 10,
  12, 15, 20, 25, 30, 40, 45, 50, 60,
  75, 90, 120, 150, 180, 210, 240, 300, 360, 420, 480, 540, 600,
  720, 900, 1200, 1500, 1800, 2100, 2400, 2700, 3000, 3600,
  4500, 5400, 6300, 7200, 8100, 9000, 10800, 12600, 14400,
  18000, 21600, 25200, 28800, 32400, 36000, 39600, 43200,
];

export const DURATION_SLOTS: readonly DurationSlot[] = SLOT_SECONDS.map((seconds) => ({
  seconds,
  label: formatPracticeDuration(seconds),
  band: durationBandFor(seconds),
}));

/** Index of the slot closest to a raw second count — used by sliders and metrics. */
export function nearestDurationSlot(seconds: number): number {
  let best = 0;
  let bestDistance = Infinity;
  DURATION_SLOTS.forEach((slot, index) => {
    const distance = Math.abs(slot.seconds - seconds);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

export function durationAtIndex(index: number): DurationSlot {
  const safe = Math.max(0, Math.min(DURATION_SLOTS.length - 1, Math.round(index)));
  return DURATION_SLOTS[safe];
}
