import { localDateKey } from "@/lib/localDate";

export type ActivityKind =
  | "session"
  | "practice"
  | "journal"
  | "circle"
  | "task"
  | "wisdom"
  | "custom";

export type DayDensity = "minimal" | "standard" | "full";

export type DayItemStatus = "done" | "now" | "upcoming" | "missed";

export interface DayBlockConfig {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface CustomDayItem {
  id: string;
  blockId: string;
  title: string;
  minutes: number;
  repeat: "daily" | "weekly";
  weekdays?: number[];
  createdAt: string;
}

export interface DayPlanConfig {
  version: 1;
  blocks: DayBlockConfig[];
  enabledKinds: ActivityKind[];
  density: DayDensity;
  customItems: CustomDayItem[];
  updatedAt: string;
}

export type DayItemAction =
  | { type: "session"; slot?: string }
  | { type: "practice" }
  | { type: "journal" }
  | { type: "circle"; circleId?: string }
  | { type: "task" }
  | { type: "wisdom" }
  | { type: "custom"; customId: string };

export interface DayPlanItem {
  id: string;
  kind: ActivityKind;
  title: string;
  subtitle?: string;
  minutes?: number;
  emoji?: string;
  slot?: string;
  done: boolean;
  status: DayItemStatus;
  action?: DayItemAction;
}

export interface DayPlanBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  startMin: number;
  endMin: number;
  isCurrent: boolean;
  isPast: boolean;
  items: DayPlanItem[];
  completedCount: number;
}

/**
 * A rhythm item that can be sat immediately. The session shell is opened with
 * this payload so the tapped card becomes the opening step of the sitting.
 */
export interface DayItemStartRequest {
  itemId: string;
  title: string;
  subtitle?: string;
  kind: ActivityKind;
  slot?: string;
  minutes: number;
  intent: string;
}

const DEFAULT_ITEM_MINUTES = 10;

const ITEM_INTENT: Record<ActivityKind, string> = {
  session: "Open the sitting with this guided gate sitting and run it now.",
  practice: "Open the sitting with today's practice pack step and run it now.",
  journal: "Open the sitting with this reflection step; let the user write and close the loop.",
  circle: "Open the sitting with this witness circle step; sit with others.",
  wisdom: "Open the sitting with this reading step; give one idea to carry.",
  task: "Take this off-app cue into the day.",
  custom: "Open the sitting with this custom rhythm step and run it now.",
};

/** Rhythm items the user can enter immediately (everything except manual ticks). */
export function dayItemStartRequest(item: DayPlanItem): DayItemStartRequest | null {
  if (item.kind === "task" || item.kind === "custom") return null;
  const minutes = Math.min(90, Math.max(3, Math.round(item.minutes ?? DEFAULT_ITEM_MINUTES)));
  return {
    itemId: item.id,
    title: item.title,
    subtitle: item.subtitle,
    kind: item.kind,
    slot: item.slot,
    minutes,
    intent: [
      `Start now: "${item.title}"${item.subtitle ? ` — ${item.subtitle}` : ""}.`,
      ITEM_INTENT[item.kind],
      item.slot ? `Gate: ${item.slot}.` : null,
      `Time budget: ${minutes} minutes.`,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export interface DayPlan {
  date: string;
  nowMinute: number;
  currentBlockId: string | null;
  blocks: DayPlanBlock[];
  totalItems: number;
  completedItems: number;
  progress: number;
}

export interface DayPlanSignals {
  gateDone?: Record<string, boolean>;
  practices?: Array<{
    id: string;
    title: string;
    minutes?: number;
    offAppCue?: string | null;
    emoji?: string;
  }>;
  completedPracticeIds?: string[];
  circles?: Array<{
    id: string;
    name: string;
    nextSessionAt: string | null;
    isMember: boolean;
  }>;
  doneItemIds?: string[];
  themeTitle?: string;
}

export const MAX_DAY_BLOCKS = 24;

export const DAY_KINDS: ActivityKind[] = [
  "session",
  "practice",
  "task",
  "journal",
  "circle",
  "wisdom",
  "custom",
];

export const DEFAULT_ENABLED_KINDS: ActivityKind[] = [
  "session",
  "practice",
  "task",
  "journal",
  "circle",
];

export const DAY_KIND_LABELS: Record<ActivityKind, string> = {
  session: "Guided session",
  practice: "Practice",
  journal: "Journal",
  circle: "Circle",
  task: "Off-app task",
  wisdom: "Wisdom",
  custom: "Custom",
};

export const DENSITY_LIMITS: Record<DayDensity, number> = {
  minimal: 2,
  standard: 4,
  full: 6,
};

const KIND_PRIORITY: ActivityKind[] = [
  "session",
  "custom",
  "task",
  "practice",
  "journal",
  "circle",
  "wisdom",
];

const GATE_SLOTS: Array<{ slot: string; label: string; midMinute: number; emoji: string }> = [
  { slot: "morning", label: "Morning sitting", midMinute: 8 * 60 + 30, emoji: "🌅" },
  { slot: "midday", label: "Midday pause", midMinute: 14 * 60 + 30, emoji: "☀️" },
  { slot: "evening", label: "Evening integration", midMinute: 19 * 60, emoji: "🌆" },
  { slot: "night", label: "Night wind-down", midMinute: 23 * 60, emoji: "🌙" },
];

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function minutesFromHHMM(value?: string | null): number | null {
  if (!value || !HHMM.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function hhmmFromMinutes(total: number): string {
  const normalized = ((Math.round(total) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatBlockTime(value: string): string {
  const minutes = minutesFromHHMM(value);
  if (minutes === null) return value;
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function blockContains(startMin: number, endMin: number, minute: number): boolean {
  if (startMin === endMin) return false;
  if (startMin < endMin) return minute >= startMin && minute < endMin;
  return minute >= startMin || minute < endMin;
}

export function defaultDayBlocks(wakeTime?: string | null, sleepTime?: string | null): DayBlockConfig[] {
  const rawWake = minutesFromHHMM(wakeTime);
  const rawSleep = minutesFromHHMM(sleepTime);

  const wake = rawWake !== null && rawWake >= 4 * 60 && rawWake < 12 * 60 ? rawWake : 6 * 60 + 30;
  const rawNightStart =
    rawSleep !== null && (rawSleep > 21 * 60 || rawSleep < 4 * 60) ? rawSleep : 22 * 60 + 30;
  const nightStart = Math.min(Math.max(rawNightStart, 21 * 60 + 30), 23 * 60 + 59);

  return [
    { id: "morning", label: "Morning", start: hhmmFromMinutes(wake), end: "12:00" },
    { id: "midday", label: "Midday", start: "12:00", end: "17:00" },
    { id: "evening", label: "Evening", start: "17:00", end: hhmmFromMinutes(nightStart) },
    { id: "night", label: "Night", start: hhmmFromMinutes(nightStart), end: hhmmFromMinutes(wake) },
  ];
}

export function defaultDayPlanConfig(wakeTime?: string | null, sleepTime?: string | null): DayPlanConfig {
  return {
    version: 1,
    blocks: defaultDayBlocks(wakeTime, sleepTime),
    enabledKinds: [...DEFAULT_ENABLED_KINDS],
    density: "standard",
    customItems: [],
    updatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseBlock(raw: unknown, index: number): DayBlockConfig | null {
  if (!isRecord(raw)) return null;
  const start = typeof raw.start === "string" && HHMM.test(raw.start) ? raw.start : null;
  const end = typeof raw.end === "string" && HHMM.test(raw.end) ? raw.end : null;
  if (!start || !end || start === end) return null;
  const label = typeof raw.label === "string" && raw.label.trim() ? raw.label.trim().slice(0, 32) : `Block ${index + 1}`;
  const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `block-${index + 1}`;
  return { id, label, start, end };
}

function parseCustomItem(raw: unknown): CustomDayItem | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.title !== "string" || !raw.title.trim()) return null;
  if (typeof raw.blockId !== "string" || !raw.blockId.trim()) return null;
  const minutesRaw = typeof raw.minutes === "number" ? raw.minutes : Number(raw.minutes);
  const minutes = Number.isFinite(minutesRaw) ? Math.min(240, Math.max(1, Math.round(minutesRaw))) : 10;
  const repeat = raw.repeat === "weekly" ? "weekly" : "daily";
  const weekdays = Array.isArray(raw.weekdays)
    ? raw.weekdays.filter((d): d is number => typeof d === "number" && d >= 0 && d <= 6)
    : undefined;
  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : `c_${Date.now().toString(36)}`,
    blockId: raw.blockId.trim(),
    title: raw.title.trim().slice(0, 64),
    minutes,
    repeat,
    weekdays,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

export function normalizeDayPlanConfig(raw: unknown): DayPlanConfig {
  if (!isRecord(raw)) return defaultDayPlanConfig();

  const rawBlocks = Array.isArray(raw.blocks) ? raw.blocks : [];
  const blocks: DayBlockConfig[] = [];
  const seen = new Set<string>();
  for (const candidate of rawBlocks.slice(0, MAX_DAY_BLOCKS)) {
    const block = parseBlock(candidate, blocks.length);
    if (!block) continue;
    if (seen.has(block.id)) block.id = `${block.id}-${blocks.length + 1}`;
    seen.add(block.id);
    blocks.push(block);
  }

  const enabledKinds = Array.isArray(raw.enabledKinds)
    ? DAY_KINDS.filter((kind) => (raw.enabledKinds as unknown[]).includes(kind))
    : [...DEFAULT_ENABLED_KINDS];

  const density: DayDensity =
    raw.density === "minimal" || raw.density === "full" || raw.density === "standard" ? raw.density : "standard";

  const customItems: CustomDayItem[] = [];
  if (Array.isArray(raw.customItems)) {
    for (const candidate of raw.customItems.slice(0, 60)) {
      const item = parseCustomItem(candidate);
      if (!item) continue;
      if (!blocks.some((b) => b.id === item.blockId)) continue;
      customItems.push(item);
    }
  }

  return {
    version: 1,
    blocks: blocks.length ? blocks : defaultDayBlocks(),
    enabledKinds: enabledKinds.length ? enabledKinds : [...DEFAULT_ENABLED_KINDS],
    density,
    customItems,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
  };
}

function minutesOfIso(value: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function nearestBlock(blocks: DayPlanBlock[], minute: number): DayPlanBlock | null {
  if (!blocks.length) return null;
  let best = blocks[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    const distance = Math.min(
      Math.abs(block.startMin - minute),
      Math.abs(block.endMin - minute),
      Math.abs((block.startMin + block.endMin) / 2 - minute),
    );
    if (distance < bestDistance) {
      best = block;
      bestDistance = distance;
    }
  }
  return best;
}

export function buildDayPlan(
  config: DayPlanConfig,
  signals: DayPlanSignals = {},
  now: Date = new Date(),
): DayPlan {
  const normalized = normalizeDayPlanConfig(config);
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  const enabled = new Set(normalized.enabledKinds);
  const doneIds = new Set(signals.doneItemIds ?? []);
  const completedPractices = new Set(signals.completedPracticeIds ?? []);
  const limit = DENSITY_LIMITS[normalized.density];

  const blocks: DayPlanBlock[] = normalized.blocks.map((block) => {
    const startMin = minutesFromHHMM(block.start) ?? 0;
    const endMin = minutesFromHHMM(block.end) ?? 0;
    return {
      id: block.id,
      label: block.label,
      start: block.start,
      end: block.end,
      startMin,
      endMin,
      isCurrent: blockContains(startMin, endMin, nowMinute),
      isPast: false,
      items: [],
      completedCount: 0,
    };
  });

  const currentIndex = blocks.findIndex((block) => block.isCurrent);
  const currentBlock = currentIndex >= 0 ? blocks[currentIndex] : null;
  const afterMidnight = Boolean(
    currentBlock && currentBlock.startMin > currentBlock.endMin && nowMinute < currentBlock.endMin,
  );

  blocks.forEach((block, index) => {
    if (block.isCurrent || afterMidnight) {
      block.isPast = false;
      return;
    }
    if (currentIndex >= 0) {
      block.isPast = index < currentIndex;
      return;
    }
    if (block.startMin < block.endMin) {
      block.isPast = block.endMin <= nowMinute;
      return;
    }
    block.isPast = nowMinute >= block.endMin && nowMinute < block.startMin;
  });

  const pushItem = (item: DayPlanItem, target: DayPlanBlock | null) => {
    if (!target) return;
    target.items.push(item);
  };

  const blockForMinute = (minute: number) =>
    blocks.find((block) => blockContains(block.startMin, block.endMin, minute)) ?? nearestBlock(blocks, minute);

  if (enabled.has("session")) {
    for (const gate of GATE_SLOTS) {
      const target = blockForMinute(gate.midMinute);
      const done = signals.gateDone?.[`${gate.slot}_done`] === true;
      pushItem(
        {
          id: `gate-${gate.slot}`,
          kind: "session",
          title: gate.label,
          subtitle: "Guided sitting",
          emoji: gate.emoji,
          slot: gate.slot,
          done,
          status: done ? "done" : "upcoming",
          action: { type: "session", slot: gate.slot },
        },
        target,
      );
    }
  }

  const practices = signals.practices ?? [];
  practices.forEach((practice, index) => {
    const isTask = Boolean(practice.offAppCue) && enabled.has("task");
    const kind: ActivityKind = isTask ? "task" : "practice";
    if (!enabled.has(kind)) return;
    const target = blocks.length ? blocks[index % blocks.length] : null;
    const id = `practice-${practice.id}`;
    const done = completedPractices.has(practice.id) || doneIds.has(id);
    pushItem(
      {
        id,
        kind,
        title: practice.title,
        subtitle: isTask ? practice.offAppCue ?? "Take it into the day" : "Today's practice pack",
        minutes: practice.minutes,
        emoji: practice.emoji,
        done,
        status: done ? "done" : "upcoming",
        action: isTask ? { type: "task" } : { type: "practice" },
      },
      target,
    );
  });

  if (enabled.has("journal")) {
    const id = "journal-evening";
    const done = doneIds.has(id);
    pushItem(
      {
        id,
        kind: "journal",
        title: "Evening reflection",
        subtitle: "Close the day in words",
        minutes: 5,
        done,
        status: done ? "done" : "upcoming",
        action: { type: "journal" },
      },
      blockForMinute(19 * 60),
    );
  }

  if (enabled.has("circle")) {
    const memberCircles = (signals.circles ?? []).filter((circle) => circle.isMember);
    if (memberCircles.length) {
      for (const circle of memberCircles.slice(0, 2)) {
        const id = `circle-${circle.id}`;
        const done = doneIds.has(id);
        const minute = minutesOfIso(circle.nextSessionAt) ?? 19 * 60;
        pushItem(
          {
            id,
            kind: "circle",
            title: circle.name,
            subtitle: circle.nextSessionAt ? "Circle sitting" : "Witness circle",
            done,
            status: done ? "done" : "upcoming",
            action: { type: "circle", circleId: circle.id },
          },
          blockForMinute(minute),
        );
      }
    } else {
      const id = "circle-explore";
      const done = doneIds.has(id);
      pushItem(
        {
          id,
          kind: "circle",
          title: "Sit with others",
          subtitle: "Explore witness circles",
          done,
          status: done ? "done" : "upcoming",
          action: { type: "circle" },
        },
        blockForMinute(19 * 60),
      );
    }
  }

  if (enabled.has("wisdom")) {
    const id = "wisdom";
    const done = doneIds.has(id);
    const theme = signals.themeTitle?.trim();
    pushItem(
      {
        id,
        kind: "wisdom",
        title: theme ? `Contemplate: ${theme}` : "A reading for the day",
        subtitle: "One idea to carry",
        done,
        status: done ? "done" : "upcoming",
        action: { type: "wisdom" },
      },
      blockForMinute(14 * 60 + 30),
    );
  }

  const weekday = now.getDay();
  for (const custom of normalized.customItems) {
    if (custom.repeat === "weekly" && custom.weekdays?.length && !custom.weekdays.includes(weekday)) continue;
    const target = blocks.find((block) => block.id === custom.blockId) ?? null;
    if (!target) continue;
    const id = `custom-${custom.id}`;
    const done = doneIds.has(id);
    pushItem(
      {
        id,
        kind: "custom",
        title: custom.title,
        subtitle: custom.repeat === "weekly" ? "Weekly" : "Daily",
        minutes: custom.minutes,
        done,
        status: done ? "done" : "upcoming",
        action: { type: "custom", customId: custom.id },
      },
      target,
    );
  }

  for (const block of blocks) {
    block.items.sort((a, b) => KIND_PRIORITY.indexOf(a.kind) - KIND_PRIORITY.indexOf(b.kind));
    if (block.items.length > limit) {
      const guaranteed = block.items.filter((item) => item.kind === "session" || item.kind === "custom");
      const rest = block.items
        .filter((item) => item.kind !== "session" && item.kind !== "custom")
        .slice(0, Math.max(0, limit - guaranteed.length));
      block.items = [...guaranteed, ...rest].sort(
        (a, b) => KIND_PRIORITY.indexOf(a.kind) - KIND_PRIORITY.indexOf(b.kind),
      );
    }
    block.items = block.items.map((item) => {
      if (item.done) return { ...item, status: "done" as const };
      if (block.isCurrent) return { ...item, status: "now" as const };
      if (block.isPast) return { ...item, status: "missed" as const };
      return { ...item, status: "upcoming" as const };
    });
    block.completedCount = block.items.filter((item) => item.done).length;
  }

  const totalItems = blocks.reduce((sum, block) => sum + block.items.length, 0);
  const completedItems = blocks.reduce((sum, block) => sum + block.completedCount, 0);

  return {
    date: localDateKey(now),
    nowMinute,
    currentBlockId: currentIndex >= 0 ? blocks[currentIndex].id : null,
    blocks,
    totalItems,
    completedItems,
    progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
  };
}

export function nextDayBlockConfig(existing: DayBlockConfig[]): DayBlockConfig | null {
  if (existing.length >= MAX_DAY_BLOCKS) return null;
  const last = existing[existing.length - 1];
  const lastEnd = minutesFromHHMM(last?.end) ?? 9 * 60;
  const start = hhmmFromMinutes(lastEnd);
  const end = hhmmFromMinutes(lastEnd + 60);
  return {
    id: `block-${Date.now().toString(36)}`,
    label: `Block ${existing.length + 1}`,
    start,
    end,
  };
}
