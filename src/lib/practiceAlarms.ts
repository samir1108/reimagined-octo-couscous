/**
 * practiceAlarms — client-side scheduler for Foundation Course "set N alarms"
 * style practices. We replace the instruction "Set 3 alarms during your day"
 * with an in-app scheduler that fires:
 *   • a native browser Notification (when permission is granted), AND
 *   • an in-app modal (when the app/tab is open).
 *
 * Persistence is local-only (localStorage), keyed by user + day, so the
 * schedule survives reloads but never leaves the device.
 */

export interface PracticeAlarm {
  /** ISO timestamp when this ping should fire */
  at: string;
  /** Has the user acknowledged / completed this ping */
  done: boolean;
  /** What the user noticed (optional, captured in modal) */
  noticed?: string;
}

export interface PracticeAlarmSchedule {
  userId: string;
  dayKey: string; // e.g. "2026-05-02:day-3"
  windowStart: string; // "09:00"
  windowEnd: string; // "21:00"
  alarms: PracticeAlarm[];
  createdAt: string;
}

const STORAGE_KEY = "hope-app.practice-alarms.v1";

// ─── Detection ─────────────────────────────────────────────

const ALARM_RE = /(\d+)\s*(alarm|check-?in|ping|reminder)/i;

/** Detects how many timed pings a practice instruction asks for. Returns 0 if none. */
export function detectCheckInCount(text: string | undefined): number {
  if (!text) return 0;
  const m = text.match(ALARM_RE);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(n, 8); // cap for sanity
}

// ─── Storage ───────────────────────────────────────────────

function loadAll(): Record<string, PracticeAlarmSchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(map: Record<string, PracticeAlarmSchedule>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // localStorage full / unavailable — silently degrade
  }
}

const keyOf = (userId: string, dayKey: string) => `${userId}::${dayKey}`;

export function getSchedule(
  userId: string,
  dayKey: string
): PracticeAlarmSchedule | null {
  const all = loadAll();
  return all[keyOf(userId, dayKey)] ?? null;
}

export function clearSchedule(userId: string, dayKey: string) {
  const all = loadAll();
  delete all[keyOf(userId, dayKey)];
  saveAll(all);
}

/** Spread N alarms evenly between windowStart and windowEnd, starting from "now if later". */
export function createSchedule(opts: {
  userId: string;
  dayKey: string;
  count: number;
  windowStart?: string; // "HH:mm"
  windowEnd?: string;
}): PracticeAlarmSchedule {
  const count = Math.max(1, Math.min(8, opts.count));
  const windowStart = opts.windowStart ?? "09:00";
  const windowEnd = opts.windowEnd ?? "21:00";

  const now = new Date();
  const [sh, sm] = windowStart.split(":").map(Number);
  const [eh, em] = windowEnd.split(":").map(Number);
  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  // If we're already past windowStart, push start to "now + 5 min"
  const earliest = new Date(Math.max(start.getTime(), now.getTime() + 5 * 60_000));

  // If earliest is after end, just stack everything in the next 60 min
  let from = earliest.getTime();
  let to = end.getTime();
  if (to <= from) {
    from = now.getTime() + 5 * 60_000;
    to = from + 60 * 60_000;
  }

  const span = to - from;
  const step = count === 1 ? 0 : span / (count - 1);

  const alarms: PracticeAlarm[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? from + span / 2 : from + step * i;
    alarms.push({ at: new Date(t).toISOString(), done: false });
  }

  const schedule: PracticeAlarmSchedule = {
    userId: opts.userId,
    dayKey: opts.dayKey,
    windowStart,
    windowEnd,
    alarms,
    createdAt: new Date().toISOString(),
  };

  const all = loadAll();
  all[keyOf(opts.userId, opts.dayKey)] = schedule;
  saveAll(all);
  return schedule;
}

export function markAlarmDone(
  userId: string,
  dayKey: string,
  index: number,
  noticed?: string
): PracticeAlarmSchedule | null {
  const all = loadAll();
  const k = keyOf(userId, dayKey);
  const sch = all[k];
  if (!sch || !sch.alarms[index]) return null;
  sch.alarms[index] = { ...sch.alarms[index], done: true, noticed };
  all[k] = sch;
  saveAll(all);
  return sch;
}

/** Returns the index of the next un-done alarm whose time is ≤ now, else -1. */
export function getDueAlarmIndex(sch: PracticeAlarmSchedule | null): number {
  if (!sch) return -1;
  const now = Date.now();
  for (let i = 0; i < sch.alarms.length; i++) {
    const a = sch.alarms[i];
    if (!a.done && new Date(a.at).getTime() <= now) return i;
  }
  return -1;
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
