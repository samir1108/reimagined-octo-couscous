/**
 * TodayMission — the day as four gates: Morning · Midday · Evening · Night.
 *
 * Each tile is the mission for that window. Tapping a tile takes the user into
 * that slot's practice; a completed gate is credited as karma and shows as a
 * record. Completion itself is never set here — it is recorded by the practice
 * surfaces (`user_daily_gates`) once the session is actually done.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Cloud, Moon, Sun, Sunset } from "lucide-react";
import { useDailyGates } from "@/hooks/useSpiritualDNA";
import { getCurrentTimeSlot, type TimeSlot } from "@/lib/timeSlots";

const SLOTS: {
  slot: TimeSlot;
  label: string;
  window: string;
  icon: React.ElementType;
  karma: number;
}[] = [
  { slot: "morning", label: "Morning", window: "5 – 12", icon: Sun, karma: 15 },
  { slot: "midday", label: "Midday", window: "12 – 5", icon: Cloud, karma: 12 },
  { slot: "evening", label: "Evening", window: "5 – 9", icon: Sunset, karma: 18 },
  { slot: "night", label: "Night", window: "9 – 5", icon: Moon, karma: 12 },
];

interface TodayMissionProps {
  onSlot: (slot: TimeSlot) => void;
  onOpenRecords?: () => void;
}

export default function TodayMission({ onSlot, onOpenRecords }: TodayMissionProps) {
  const reducedMotion = useReducedMotion();
  const { data: gates } = useDailyGates();
  const current = getCurrentTimeSlot();

  const isDone = (slot: TimeSlot) => Boolean(gates?.[`${slot}_done`]);
  const completed = SLOTS.filter((s) => isDone(s.slot)).length;
  const credits = SLOTS.reduce((sum, s) => sum + (isDone(s.slot) ? s.karma : 0), 0);
  const progress = Math.round((completed / SLOTS.length) * 100);

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="glass-1 premium-panel-hover w-full rounded-2xl p-4 sm:p-5"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/75">
            Today's Mission
          </p>
          <p className="font-display text-sm font-medium text-foreground/90 mt-0.5 truncate">
            {completed === 0
              ? "Four gates. One day."
              : completed === SLOTS.length
                ? "All gates complete"
                : `${SLOTS.length - completed} ${SLOTS.length - completed === 1 ? "gate" : "gates"} left today`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary tabular-nums">
            {completed}/{SLOTS.length} · +{credits} karma
          </span>
          {onOpenRecords && (
            <button
              onClick={onOpenRecords}
              className="rounded-full p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors"
              aria-label="Open practice records"
              title="Records"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SLOTS.map((s, i) => {
          const done = isDone(s.slot);
          const isNow = current === s.slot;
          const Icon = s.icon;

          return (
            <motion.button
              key={s.slot}
              onClick={() => onSlot(s.slot)}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -2 }}
              className={`group relative flex flex-col items-center gap-1 rounded-xl border px-1.5 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                done
                  ? "border-primary/30 bg-[linear-gradient(160deg,hsl(var(--primary)/0.16),hsl(var(--primary)/0.05))] shadow-[inset_0_1px_0_hsl(var(--gold-50)/0.12)]"
                  : isNow
                    ? "border-primary/45 bg-primary/[0.07] shadow-[0_0_18px_hsl(var(--primary)/0.12)]"
                    : "border-border/30 bg-card/30 hover:border-primary/25 hover:bg-primary/[0.05]"
              }`}
              aria-label={`${s.label} gate${done ? " — complete" : isNow ? " — now" : ""}`}
            >
              {isNow && !done && (
                <span className="absolute -top-1 right-1.5 flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
              )}
              <Icon
                className={`h-4 w-4 transition-colors ${
                  done ? "text-primary" : isNow ? "text-primary/80" : "text-muted-foreground/50 group-hover:text-foreground/70"
                }`}
              />
              <span
                className={`text-[10px] font-display font-medium truncate ${
                  done ? "text-primary" : isNow ? "text-foreground" : "text-muted-foreground/70"
                }`}
              >
                {s.label}
              </span>
              <span className="text-[9px] text-muted-foreground/45 tabular-nums">{s.window}</span>
              <span
                className={`mt-0.5 inline-flex items-center gap-0.5 text-[9px] tabular-nums ${
                  done ? "text-primary/80" : "text-muted-foreground/40"
                }`}
              >
                {done ? (
                  <>
                    <Check className="h-2.5 w-2.5" /> +{s.karma}
                  </>
                ) : (
                  <>+{s.karma}</>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-3.5 flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-muted/40 overflow-hidden border border-border/30">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--primary)))] shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums">
          {progress}%
        </span>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground/40">
        Gates are credited once the practice is completed — or hold the orb any time for a free session.
      </p>
    </motion.section>
  );
}
