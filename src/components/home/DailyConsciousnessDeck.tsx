import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  completed?: number;
  total?: number;
  children: ReactNode;
}

export default function DailyConsciousnessDeck({ completed = 0, total = 12, children }: Props) {
  const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="mt-10"
    >
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <h2 className="text-xs font-display font-medium tracking-[0.16em] uppercase text-muted-foreground/80">
            Your Daily Consciousness Deck
          </h2>
          <p className="mt-1 text-xs text-muted-foreground/75">A personalized collection for today</p>
        </div>
        {total > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground/75">
            {completed}/{total} missions complete
          </span>
        )}
      </div>
      {total > 0 && (
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-border/30">
          <div
            className="h-full rounded-full bg-primary/70 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
      <div className="mt-4 text-center">
        <span className="text-xs font-display text-primary/85">One daily thread, many ways to practice</span>
      </div>
    </motion.section>
  );
}
