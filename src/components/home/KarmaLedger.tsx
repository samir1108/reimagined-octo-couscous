/**
 * KarmaLedger — awareness, carried into action.
 *
 * Two honest lines beneath the orb:
 *   1. The ledger: real karma points from `user_karma` (award_karma RPC),
 *      with the quiet distance to the next breakthrough.
 *   2. Today's karma action: the backend-written `daily_tasks` row for today.
 *      Kept state only ever comes from the persisted record — completion is
 *      written to `daily_tasks.status` and karma is awarded through the
 *      existing award_karma pipeline. No task → nothing is owed.
 */
import { motion } from "framer-motion";
import { Flame, Check } from "lucide-react";
import { useKarma, useAwardKarma } from "@/hooks/useKarma";
import { useCompleteDailyTask } from "@/hooks/useTasks";
import { toast } from "@/hooks/use-toast";
import { playSoundEffect } from "@/lib/soundEffects";
import { hapticBreakthrough } from "@/lib/haptics";
import type { DailyTask } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

const KARMA_THRESHOLDS = [300, 1000, 2500, 5000];

export default function KarmaLedger({ dailyTasks }: { dailyTasks: DailyTask[] }) {
  const { data: karma } = useKarma();
  const awardKarma = useAwardKarma();
  const completeTask = useCompleteDailyTask();

  const points = karma?.points ?? 0;
  const nextThreshold = karma?.next_threshold ?? null;

  // Progress toward the next breakthrough — a hairline, not a scoreboard.
  const prevThreshold = nextThreshold
    ? [...KARMA_THRESHOLDS].reverse().find((t) => t < nextThreshold) ?? 0
    : 0;
  const span = nextThreshold ? nextThreshold - prevThreshold : 1;
  const progress = nextThreshold
    ? Math.max(0, Math.min(1, (points - prevThreshold) / span))
    : 1;

  // Today's karma action — the first task the backend still owes the day.
  const pendingTask = dailyTasks.find((t) => t.status === "pending") ?? null;
  const doneCount = dailyTasks.filter((t) => t.status === "completed").length;

  const keepTask = (task: DailyTask) => {
    if (completeTask.isPending) return;
    hapticBreakthrough();
    playSoundEffect("threshold");
    completeTask.mutate(task.id, {
      onSuccess: () => {
        awardKarma.mutate({
          source: "daily_task",
          weight: 1.0,
          metadata: { taskId: task.id },
          silent: true,
        });
        toast({ title: "Karma kept", description: "The day carries the shape you gave it." });
      },
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
      aria-label="Karma"
      className="w-full max-w-md mx-auto rounded-2xl border border-border/30 bg-card/40 px-4 py-3"
    >
      {/* The ledger */}
      <div className="flex items-center justify-center gap-2">
        <Flame className="h-3 w-3 text-primary/80" aria-hidden />
        <span className="text-[9px] font-display tracking-[0.3em] uppercase text-muted-foreground/60">
          Karma
        </span>
        <span className="text-[13px] font-display font-semibold text-foreground/90 tabular-nums leading-none">
          {points.toLocaleString()}
        </span>
        {nextThreshold && (
          <span className="text-[9px] text-muted-foreground/45 tabular-nums">
            · {Math.max(0, nextThreshold - points)} to next
          </span>
        )}
      </div>

      {/* Hairline progress toward the next breakthrough */}
      <div className="mx-auto mt-2 h-px w-40 overflow-hidden rounded-full bg-muted/40">
        <div
          className="h-full rounded-full bg-primary/60 transition-[width] duration-700"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* Today's karma action — persisted, or honestly empty */}
      <div className="mt-2.5 min-h-[20px] text-center">
        {pendingTask ? (
          <div className="flex items-center justify-center gap-2">
            <p className="min-w-0 truncate text-[11px] text-foreground/70">
              {pendingTask.title}
            </p>
            <button
              type="button"
              onClick={() => keepTask(pendingTask)}
              disabled={completeTask.isPending}
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[8px] font-display tracking-[0.2em] uppercase text-primary/90 hover:bg-primary/20 transition-colors disabled:opacity-60"
            >
              {completeTask.isPending ? (
                <motion.span
                  aria-hidden
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  className="h-2.5 w-2.5 rounded-full border border-primary/30 border-t-primary/80"
                />
              ) : (
                <Check className="h-2.5 w-2.5" aria-hidden />
              )}
              Keep
            </button>
          </div>
        ) : doneCount > 0 ? (
          <p className="text-[10px] text-muted-foreground/50">
            {doneCount === 1 ? "Kept." : `${doneCount} kept today.`} Nothing more is owed.
          </p>
        ) : (
          <p className="text-[10px] text-muted-foreground/40">
            Karma gathers as you act — nothing is owed today.
          </p>
        )}
      </div>
    </motion.section>
  );
}
