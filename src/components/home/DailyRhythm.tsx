import { motion, useReducedMotion } from "framer-motion";
import { Sunrise, Sun, Moon, Star, CheckCircle, Clock } from "lucide-react";
import { getGateDef, type TimeSlot } from "@/lib/consciousness/dailyGates";
import { AnimatedPath } from "@/components/animation/AnimatedPath";
import { Reveal } from "@/components/animation/Reveal";
import type { DailyTheme } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

const SLOTS: Array<{ slot: TimeSlot; label: string; icon: React.ElementType; accent: string }> = [
  { slot: "morning", label: "Morning", icon: Sunrise, accent: "hsl(30 90% 55%)" },
  { slot: "midday", label: "Midday", icon: Sun, accent: "hsl(45 95% 55%)" },
  { slot: "evening", label: "Evening", icon: Moon, accent: "hsl(220 70% 55%)" },
  { slot: "night", label: "Night", icon: Star, accent: "hsl(280 60% 55%)" },
];

const SLOT_GUIDANCE_KEYS: Record<TimeSlot, string[]> = {
  morning: ["today_intention", "today_priority", "approach_today"],
  midday: ["one_small_win", "mind_check", "body_check"],
  evening: ["evening_reflection", "capture_moment", "emotional_check"],
  night: ["end_with_gratitude", "question_to_carry", "pause_reset"],
};

const SLOT_HOURS: Record<TimeSlot, [number, number]> = {
  morning: [5, 12],
  midday: [12, 17],
  evening: [17, 21],
  night: [21, 29],
};

function pointAtHour(hour: number, radius: number) {
  const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
  return { x: 56 + Math.cos(angle) * radius, y: 56 + Math.sin(angle) * radius };
}

function arcForHours(startHour: number, endHour: number, radius: number) {
  const start = pointAtHour(startHour, radius);
  const end = pointAtHour(endHour, radius);
  const largeArc = endHour - startHour > 12 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

interface Props {
  theme: Pick<DailyTheme, "guidance"> | null | undefined;
  sessions: Array<{
    time_slot: TimeSlot;
    status: string;
  }>;
  currentSlot: TimeSlot;
}

export default function DailyRhythm({ theme, sessions, currentSlot }: Props) {
  const reduceMotion = useReducedMotion();
  const guidance = theme?.guidance || {};

  const completedSlots = new Set(sessions
    .filter((s) => s.status === "completed")
    .map((s) => s.time_slot));
  const currentDate = new Date();
  const currentHour = currentDate.getHours() + currentDate.getMinutes() / 60;
  const currentPoint = pointAtHour(currentHour, 46);
  const currentGate = SLOTS.find(({ slot }) => slot === currentSlot) ?? SLOTS[0];

  const getSlotGuidance = (slot: TimeSlot): string | null => {
    for (const key of SLOT_GUIDANCE_KEYS[slot]) {
      const val = guidance[key];
      if (val) {
        if (Array.isArray(val)) return val[0];
        if (typeof val === "string") return val;
      }
    }
    return null;
  };

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: EASE, delay: reduceMotion ? 0 : 0.18 }}
      aria-label="Daily rhythm"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
        <Clock className="h-3 w-3" aria-hidden />
        Daily rhythm
      </p>

      <Reveal className="mt-4">
        <div className="flex items-center gap-4 rounded-xl border border-border/25 bg-background/25 px-3 py-2.5">
          <svg
            viewBox="0 0 112 112"
            className="h-[92px] w-[92px] shrink-0"
            role="img"
            aria-label={`24-hour rhythm. Current gate: ${currentGate.label}. ${completedSlots.size} of 4 gates completed.`}
          >
            <circle cx="56" cy="56" r="46" fill="none" stroke="hsl(var(--border) / 0.45)" strokeWidth="1" />
            {SLOTS.map(({ slot, accent }) => {
              const isCompleted = completedSlots.has(slot);
              const isCurrent = currentSlot === slot;
              return (
                <AnimatedPath
                  key={slot}
                  d={arcForHours(...SLOT_HOURS[slot], 46)}
                  fill="none"
                  stroke={isCompleted ? "hsl(145 55% 48%)" : accent}
                  strokeWidth={isCurrent ? 5 : 3.5}
                  strokeLinecap="round"
                  duration={0.75}
                />
              );
            })}
            <circle cx="56" cy="56" r="34" fill="hsl(var(--background) / 0.45)" />
            <text x="56" y="53" textAnchor="middle" className="fill-foreground" fontSize="16" fontWeight="600">
              24
            </text>
            <text x="56" y="67" textAnchor="middle" className="fill-muted-foreground" fontSize="7" letterSpacing="1.5">
              HOURS
            </text>
            <circle cx={currentPoint.x} cy={currentPoint.y} r="3.1" fill="hsl(var(--foreground))" stroke="hsl(var(--background))" strokeWidth="1.5" />
          </svg>
          <div className="min-w-0">
            <p className="text-[9px] font-display tracking-[0.2em] uppercase text-muted-foreground/55">
              The day, in rhythm
            </p>
            <p className="mt-1 text-sm font-medium text-foreground/90">
              {currentGate.label} · {getGateDef(currentSlot).theme}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/65">
              {completedSlots.size} of 4 gates completed. The marker shows your local time.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {SLOTS.map(({ slot, label, accent }) => (
                <span key={slot} className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/55">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="list">
        {SLOTS.map(({ slot, label, icon: Icon, accent }, i) => {
          const isCurrent = slot === currentSlot;
          const isCompleted = completedSlots.has(slot);
          const gateDef = getGateDef(slot);
          const guidanceText = getSlotGuidance(slot);

          return (
            <motion.article
              key={slot}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE, delay: reduceMotion ? 0 : 0.15 + i * 0.05 }}
              className={`relative rounded-xl p-3 transition-all ${
                isCurrent
                  ? "ring-2 ring-primary/50 bg-primary/5"
                  : isCompleted
                  ? "bg-emerald-400/[0.05] border border-emerald-400/20"
                  : "bg-card/50 border border-border/30"
              }`}
              role="listitem"
              aria-current={isCurrent ? "time" : undefined}
            >
              {isCurrent && (
                <motion.div
                  initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-display tracking-[0.14em] uppercase text-primary/80"
                >
                  <span className={`relative h-1.5 w-1.5 rounded-full bg-primary ${reduceMotion ? "" : "animate-pulse"}`} />
                  Now
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-muted-foreground/50"
                  }`}
                  aria-hidden
                />
                <span className={`text-[10px] font-display tracking-[0.14em] uppercase ${
                  isCurrent ? "text-primary" : "text-muted-foreground/60"
                }`}>
                  {label}
                </span>
              </div>

              <div className="h-px w-full bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${accent}20, ${accent}80, ${accent}20)` }} />

              {isCompleted && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-emerald-400" aria-hidden />
                  <span className="text-[9px] font-display tracking-[0.12em] uppercase text-emerald-300/80">
                    Complete
                  </span>
                </div>
              )}

              {guidanceText && !isCompleted && (
                <p className="mt-2 text-[10.5px] leading-[1.5] text-foreground/60 line-clamp-2">
                  {guidanceText}
                </p>
              )}

              {isCurrent && !guidanceText && (
                <p className="mt-2 text-[10.5px] italic text-muted-foreground/50">
                  {gateDef.theme}
                </p>
              )}
            </motion.article>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] italic leading-relaxed text-muted-foreground/50">
        Each gate holds its own wisdom. Meet it there.
      </p>
    </motion.section>
  );
}