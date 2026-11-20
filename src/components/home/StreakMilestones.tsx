import { motion } from "framer-motion";
import { Flame, Award, Sparkles, TrendingUp, Target } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const MILESTONES = [
  { day: 3, label: "First rhythm", icon: Sparkles },
  { day: 7, label: "Week anchor", icon: Flame },
  { day: 21, label: "Arc begins", icon: Target },
  { day: 49, label: "Deepening", icon: TrendingUp },
  { day: 100, label: "Century", icon: Award },
  { day: 365, label: "Year cycle", icon: Award },
];

interface Props {
  streak: number;
  longestStreak: number;
  totalSessions: number;
  journeyDay: number;
}

export default function StreakMilestones({ streak, longestStreak, totalSessions, journeyDay }: Props) {
  const nextMilestone = MILESTONES.find((m) => m.day > streak);
  const achievedMilestones = MILESTONES.filter((m) => m.day <= streak);
  const progressToNext = nextMilestone
    ? Math.max(0, Math.min(1, streak / nextMilestone.day))
    : 1;
  const daysToNext = nextMilestone ? nextMilestone.day - streak : 0;

  const streakMessage = streak === 0
    ? "Every journey begins with one sitting."
    : streak === 1
    ? "Day one. The thread starts now."
    : streak < 7
    ? `${streak} days. Consistency compounds.`
    : streak < 21
    ? `${streak} days. The rhythm is forming.`
    : streak < 49
    ? `${streak} days. The arc deepens.`
    : streak < 100
    ? `${streak} days. Mastery is in the return.`
    : `${streak} days. A life woven with awareness.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
      aria-label="Practice streak & milestones"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-display tracking-[0.28em] uppercase text-primary/70 flex items-center gap-1.5">
          <Flame className="h-3 w-3" aria-hidden />
          Practice streak & milestones
        </p>
        <span className="text-[9px] font-display tracking-[0.16em] uppercase text-muted-foreground/45 tabular-nums">
          Longest: {longestStreak} · Total sittings: {totalSessions}
        </span>
      </div>

      {/* Streak fire */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className={`relative flex items-center justify-center h-16 w-16 rounded-full ${
            streak === 0
              ? "bg-muted/30"
              : streak < 7
              ? "bg-gradient-to-br from-amber-400/20 to-orange-400/20 border border-amber-400/30"
              : streak < 21
              ? "bg-gradient-to-br from-orange-400/30 to-red-400/30 border border-orange-400/40"
              : streak < 49
              ? "bg-gradient-to-br from-red-400/30 to-rose-400/30 border border-rose-400/40"
              : "bg-gradient-to-br from-rose-400/30 to-violet-400/30 border border-rose-400/40"
          }`}
        >
          {streak === 0 ? (
            <Flame className="h-7 w-7 text-muted-foreground/30" aria-hidden />
          ) : (
            <>
              <motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
                className="absolute text-2xl font-display font-bold tabular-nums"
                style={{ color: streak < 7 ? "hsl(30 90% 55%)" : streak < 21 ? "hsl(15 90% 55%)" : streak < 49 ? "hsl(0 80% 60%)" : "hsl(320 70% 60%)" }}
              >
                {streak}
              </motion.span>
              <Flame
                className={`absolute h-5 w-5 -bottom-1 -right-1 ${streak >= 21 ? "animate-pulse" : ""}`}
                style={{ color: streak < 7 ? "hsl(30 90% 55%)" : streak < 21 ? "hsl(15 90% 55%)" : "hsl(0 80% 60%)" }}
                aria-hidden
              />
            </>
          )}
        </motion.div>

        <div className="text-center">
          <p className="text-[10px] font-display tracking-[0.18em] uppercase text-muted-foreground/50">Current streak</p>
          <p className="text-[11px] leading-relaxed text-foreground/75 max-w-xs">{streakMessage}</p>
        </div>
      </div>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mt-5">
          <div className="flex items-center justify-between text-[9px] font-display tracking-[0.14em] uppercase text-muted-foreground/50 mb-1.5">
            <span>Next: {nextMilestone.label} at {nextMilestone.day} days</span>
            <span className="tabular-nums">{daysToNext} day{daysToNext === 1 ? "" : "s"} to go</span>
          </div>
          <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progressToNext * 100)}%` }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
        </div>
      )}

      {/* Achieved milestones */}
      {achievedMilestones.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5" role="list" aria-label="Achieved milestones">
          {achievedMilestones.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.span
                key={m.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.25 + i * 0.05 }}
                className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[9px] font-display tracking-[0.14em] uppercase text-amber-300/90"
                role="listitem"
              >
                <Icon className="h-2.5 w-2.5" aria-hidden />
                Day {m.day}
              </motion.span>
            );
          })}
        </div>
      )}

      {/* No-shame messaging */}
      {streak === 0 && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
          className="mt-4 text-center text-[11px] italic leading-relaxed text-muted-foreground/50"
        >
          No streak? No guilt. The path begins when you return.
        </motion.p>
      )}
    </motion.section>
  );
}