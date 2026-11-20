/**
 * TodaysAgenda — the day's shape, read from the real systems.
 *
 * One glanceable rhythm card: what today holds, what is already kept, and
 * what is calling now. Every row is backed by an existing source of truth —
 * sessions (the sitting), today_practice_packs + the theme's recommended
 * practice (the practice), observation_tasks (the weave), daily_tasks (the
 * karma action), and the theme's evening_close (the day's last question).
 *
 * Statuses are honest and gentle: done · now · open. Nothing is ever
 * "missed" — the agenda bends to the day, not the reverse.
 */
import { motion } from "framer-motion";
import {
  Check,
  Sunrise,
  Sun,
  Sunset,
  MoonStar,
  Wind,
  Footprints,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { getCurrentGate, getGateDef, type GateId } from "@/lib/consciousness/dailyGates";
import { useTodayPracticePack } from "@/hooks/useTodayPractice";
import { useThemeOfDay } from "@/hooks/useThemeOfDay";
import type { Session, ObservationTask, DailyTask } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The small theme models occasionally emit "undefined"/"null" — never speak it. */
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

const GATE_ICONS: Record<GateId, typeof Sun> = {
  morning: Sunrise,
  midday: Sun,
  evening: Sunset,
  night: MoonStar,
};

type AgendaStatus = "done" | "now" | "open";

interface AgendaRow {
  key: string;
  icon: LucideIcon;
  label: string;
  desc: string;
  status: AgendaStatus;
}

interface Props {
  sessions: Session[];
  observationTasks: ObservationTask[];
  dailyTasks: DailyTask[];
}

export default function TodaysAgenda({ sessions, observationTasks, dailyTasks }: Props) {
  const gate = getCurrentGate(new Date().getHours());
  const gateDef = getGateDef(gate);
  const GateGlyph = GATE_ICONS[gate];

  const { data: pack } = useTodayPracticePack();
  const { data: themeData } = useThemeOfDay();
  const theme = themeData?.theme;

  const completedToday = sessions.filter((s) => s.status === "completed").length;
  const completedSlots = new Set(
    sessions.filter((s) => s.status === "completed").map((s) => s.time_slot),
  );

  const activeTask = observationTasks.find((t) => t.status === "active") ?? null;
  const wovenTask = observationTasks.find((t) => t.status === "completed") ?? null;

  const pendingTask = dailyTasks.find((t) => t.status === "pending") ?? null;
  const doneTaskCount = dailyTasks.filter((t) => t.status === "completed").length;

  const practiceRec = theme?.recommended_practice ?? undefined;
  const practiceTitle =
    cleanText(pack?.practices?.[0]?.title) || cleanText(practiceRec?.title);
  const hasPractice = !!(pack || practiceRec);
  const practiceDone = pack?.is_completed === true;

  const eveningClose = cleanText(theme?.evening_close);

  const rows: AgendaRow[] = [];

  // 1 — The sitting: the orb, the theme, the day's core act.
  rows.push({
    key: "sitting",
    icon: GateGlyph,
    label: "Sitting with the theme",
    desc:
      completedToday > 0
        ? completedToday === 1
          ? "One sitting kept today"
          : `${completedToday} sittings kept today`
        : "Hold the orb when you are ready",
    status: completedToday > 0 ? "done" : "now",
  });

  // 2 — The practice: the woven pack, or the theme's recommended practice.
  if (hasPractice) {
    rows.push({
      key: "practice",
      icon: Wind,
      label: "The practice",
      desc: practiceDone
        ? cleanText(practiceTitle) || "Held today"
        : cleanText(practiceTitle) || "A short practice is calling",
      status: practiceDone ? "done" : gate === "midday" ? "now" : "open",
    });
  }

  // 3 — The weave: awareness carried into life.
  if (activeTask || wovenTask) {
    const t = activeTask ?? wovenTask;
    rows.push({
      key: "weave",
      icon: Footprints,
      label: "The weave",
      desc: cleanText(t?.title) || "Notice one moment fully",
      status: activeTask ? "open" : "done",
    });
  }

  // 4 — The karma action: today's one kept deed.
  if (dailyTasks.length > 0) {
    rows.push({
      key: "karma",
      icon: Flame,
      label: "The karma action",
      desc: pendingTask
        ? cleanText(pendingTask.title) || "One small act, kept"
        : doneTaskCount > 0
          ? "Kept. Nothing more is owed."
          : "Karma gathers as you act",
      status: pendingTask ? "open" : doneTaskCount > 0 ? "done" : "open",
    });
  }

  // 5 — The day's last question: the evening close, when the theme carries one.
  if (eveningClose) {
    const eveningDone = completedSlots.has("evening");
    rows.push({
      key: "evening-close",
      icon: MoonStar,
      label: "The evening close",
      desc: eveningClose,
      status: eveningDone ? "done" : gate === "evening" || gate === "night" ? "now" : "open",
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
      aria-label="Today's agenda"
      className="w-full max-w-md mx-auto rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      {/* Header — the day's shape + the open gate */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/55">
          Today's agenda
        </p>
        <p
          className="flex items-center gap-1.5 text-[9px] font-display tracking-[0.18em] uppercase"
          style={{ color: `hsl(${gateDef.accentColor} / 0.8)` }}
        >
          <GateGlyph className="h-3 w-3" aria-hidden />
          {gateDef.label} · {gateDef.theme}
        </p>
      </div>

      {/* The rows */}
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => {
          const Glyph = row.icon;
          const isNow = row.status === "now";
          return (
            <li key={row.key} className="flex items-start gap-3">
              {/* Status glyph */}
              <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center">
                {row.status === "done" ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.08]">
                    <Check className="h-2.5 w-2.5 text-emerald-300/80" aria-hidden />
                  </span>
                ) : isNow ? (
                  <motion.span
                    aria-hidden
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.85, 1, 0.85] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="h-2 w-2 rounded-full"
                    style={{ background: `hsl(${gateDef.accentColor})` }}
                  />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full border border-border/40" aria-hidden />
                )}
              </span>

              {/* Label + description */}
              <div className="min-w-0 flex-1 text-left">
                <p
                  className={`flex items-center gap-1.5 text-[11.5px] font-display leading-tight ${
                    isNow ? "text-foreground/90" : row.status === "done" ? "text-foreground/55" : "text-foreground/75"
                  }`}
                >
                  <Glyph
                    className={`h-3 w-3 flex-shrink-0 ${
                      isNow ? "" : row.status === "done" ? "text-muted-foreground/45" : "text-muted-foreground/55"
                    }`}
                    style={isNow ? { color: `hsl(${gateDef.accentColor})` } : undefined}
                    aria-hidden
                  />
                  {row.label}
                  {isNow && (
                    <span
                      className="text-[8px] font-display tracking-[0.2em] uppercase"
                      style={{ color: `hsl(${gateDef.accentColor} / 0.9)` }}
                    >
                      · now
                    </span>
                  )}
                </p>
                <p
                  className={`mt-0.5 truncate pl-[18px] text-[10.5px] leading-snug ${
                    row.status === "done" ? "text-muted-foreground/45" : "text-muted-foreground/60"
                  }`}
                >
                  {row.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* The honest footer — an invitation, never a debt */}
      <p className="mt-3 border-t border-border/30 pt-2.5 text-center text-[9.5px] text-muted-foreground/40">
        An invitation, not a debt — the day bends to you, not the reverse.
      </p>
    </motion.section>
  );
}
