/**
 * LifeExperiment — the practice, carried into the day.
 *
 * Today's real-life experiment is the backend-written `observation_tasks` row
 * for today (status `active`). Completion is persisted through the existing
 * `useCompleteObservationTask` mutation (status + reflection + completed_at,
 * then the complete-task edge function chains the next task) and karma is
 * awarded through the same `award_karma` pipeline the Practice tab uses.
 * Skipping is allowed and leaves no trace — no guilt, no streak debt.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Footprints } from "lucide-react";
import { useCompleteObservationTask } from "@/hooks/useTasks";
import { useAwardKarma } from "@/hooks/useKarma";
import { toast } from "@/hooks/use-toast";
import { playSoundEffect } from "@/lib/soundEffects";
import { hapticBreakthrough } from "@/lib/haptics";
import type { ObservationTask } from "@/types/database";

const EASE = [0.16, 1, 0.3, 1] as const;

/** The small theme models occasionally emit "undefined"/"null" — never speak it. */
const JUNK_TEXT = /^(undefined|null|n\/?a|none|nan)$/i;

function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  const s = v.trim();
  return s && !JUNK_TEXT.test(s) ? s : "";
}

export default function LifeExperiment({ tasks }: { tasks: ObservationTask[] }) {
  const completeTask = useCompleteObservationTask();
  const awardKarma = useAwardKarma();
  const [reflecting, setReflecting] = useState(false);
  const [reflection, setReflection] = useState("");
  const [skipped, setSkipped] = useState(false);

  const activeTask = tasks.find((t) => t.status === "active") ?? null;
  const completedTask = tasks.find((t) => t.status === "completed") ?? null;

  const submit = () => {
    if (!activeTask || completeTask.isPending) return;
    const note = reflection.trim();
    completeTask.mutate(
      { taskId: activeTask.id, reflection: note },
      {
        onSuccess: () => {
          hapticBreakthrough();
          playSoundEffect("success");
          awardKarma.mutate({
            source: "observation_task",
            weight: 1.2,
            metadata: { taskId: activeTask.id },
            silent: true,
          });
          toast({ title: "Woven into the chain", description: "Awareness, carried into life." });
          setReflection("");
          setReflecting(false);
        },
      },
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
      aria-label="Take it into life"
      className="w-full rounded-2xl border border-border/30 bg-card/40 px-5 py-4"
    >
      <p className="text-[9px] font-display tracking-[0.28em] uppercase text-muted-foreground/55">
        Take it into life
      </p>

      {/* Persisted completion */}
      {!activeTask && completedTask && (
        <div className="mt-2">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-2.5 py-1 text-[9px] font-display tracking-[0.18em] uppercase text-emerald-200/80">
            <Check className="h-2.5 w-2.5" aria-hidden />
            Carried into life
          </p>
          {cleanText(completedTask.title) && (
            <p className="mt-1.5 text-[12px] text-foreground/55 leading-snug">
              {cleanText(completedTask.title)}
            </p>
          )}
        </div>
      )}

      {/* No task — honest empty state */}
      {!activeTask && !completedTask && (
        <p className="mt-1.5 text-[12px] leading-relaxed text-foreground/55">
          {skipped
            ? "It will still be here when the moment finds you."
            : "The next experiment arrives with your next sitting. Awareness needs no assignment to be practiced."}
        </p>
      )}

      {/* The experiment */}
      {activeTask && (
        <>
          <p className="mt-1.5 text-[13px] leading-snug text-foreground/85">
            {cleanText(activeTask.title) || "Notice one moment fully"}
          </p>
          {cleanText(activeTask.description) && (
            <p className="mt-1 text-[11px] leading-[1.6] text-muted-foreground/70 line-clamp-2">
              {cleanText(activeTask.description)}
            </p>
          )}
          {typeof activeTask.chain_order === "number" && (
            <p className="mt-1.5 text-[9px] font-display tracking-[0.16em] uppercase text-muted-foreground/40">
              Chain · link {Math.max(1, activeTask.chain_order + 1)}
            </p>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {reflecting ? (
              <motion.div
                key="reflect"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mt-3"
              >
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={2}
                  placeholder="What did you notice?"
                  aria-label="What did you notice?"
                  className="w-full resize-none rounded-xl border border-border/30 bg-card/40 px-3 py-2 text-[12px] text-foreground/85 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40"
                />
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setReflecting(false)}
                    className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/45 hover:text-foreground/70 transition-colors"
                  >
                    Not yet
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={completeTask.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[9px] font-display tracking-[0.2em] uppercase text-primary hover:bg-primary/20 transition-colors disabled:opacity-60"
                  >
                    {completeTask.isPending ? (
                      <motion.span
                        aria-hidden
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                        className="h-2.5 w-2.5 rounded-full border border-primary/30 border-t-primary/80"
                      />
                    ) : (
                      <Check className="h-3 w-3" aria-hidden />
                    )}
                    Witness it
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mt-3 flex items-center justify-between"
              >
                <button
                  type="button"
                  onClick={() => setSkipped(true)}
                  className="text-[9px] font-display tracking-[0.18em] uppercase text-muted-foreground/40 hover:text-foreground/65 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={() => setReflecting(true)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-card/40 px-4 py-1.5 text-[9px] font-display tracking-[0.2em] uppercase text-foreground/75 hover:bg-muted/40 transition-colors"
                >
                  <Footprints className="h-3 w-3" aria-hidden />
                  It happened
                  <ArrowRight
                    className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
}
