/**
 * TodayPack — the engine's personalised practice pack for today.
 *
 * Shows up to three items from `today_practice_packs` (already composed by the
 * Practice surface) with the "why", duration and completion state, so Home can
 * lead with real curated practice instead of a generic card.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock } from "lucide-react";
import { useTodayPracticePack } from "@/hooks/useTodayPractice";

interface TodayPackProps {
  /** Navigate into the Practice surface (item-level deep links optional). */
  onOpen: () => void;
  limit?: number;
}

export default function TodayPack({ onOpen, limit = 3 }: TodayPackProps) {
  const reducedMotion = useReducedMotion();
  const { data: pack, isLoading } = useTodayPracticePack();

  const practices = pack?.practices ?? [];
  if (!isLoading && practices.length === 0) return null;

  const completed = new Set(pack?.completed_practices ?? []);
  const items = practices.slice(0, limit);
  const doneCount = practices.filter((p) => completed.has(p.practice)).length;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      aria-labelledby="today-pack-title"
      className="glass-1 premium-panel-hover w-full rounded-2xl p-4 sm:p-5 text-left"
    >
      <header className="flex items-center justify-between gap-3 mb-3">
        <p
          id="today-pack-title"
          className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground/75"
        >
          Practice Pack
        </p>
        <span className="text-[10px] text-muted-foreground/45 tabular-nums">
          {isLoading ? "composing…" : `${doneCount}/${practices.length} done`}
        </span>
      </header>

      <ul className="flex flex-col gap-1.5">
        {isLoading && practices.length === 0
          ? [0, 1, 2].slice(0, limit).map((i) => (
              <li key={i} className="h-10 rounded-xl bg-muted/20 animate-pulse" />
            ))
          : items.map((item, i) => {
              const isDone = completed.has(item.practice);
              return (
                <motion.li
                  key={`${item.practice}-${i}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                >
                  <button
                    onClick={onOpen}
                    className="w-full flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-2 text-left transition-colors hover:border-primary/25 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`${item.title}${isDone ? " — completed" : ""}`}
                  >
                    <span className="text-base leading-none shrink-0" aria-hidden="true">
                      {item.emoji || "✨"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-xs font-medium ${
                          isDone ? "text-muted-foreground/60 line-through" : "text-foreground/90"
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.why && (
                        <span className="block truncate text-[10px] text-muted-foreground/45">
                          {item.why}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground/50 tabular-nums">
                      {isDone ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          {item.duration}m
                        </>
                      )}
                    </span>
                  </button>
                </motion.li>
              );
            })}
      </ul>

      <button
        onClick={onOpen}
        className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-primary/80 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
      >
        Open practice
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.section>
  );
}
