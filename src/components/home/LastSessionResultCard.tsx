/**
 * LastSessionResultCard — the receipt the orb hands back on Home after a
 * sitting: you did it · what shifted · what's next.
 */
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import type { LastSessionResult } from "@/lib/lastSessionResult";

interface Props {
  result: LastSessionResult;
  onDismiss: () => void;
  onOpenRecords?: () => void;
}

export default function LastSessionResultCard({ result, onDismiss, onOpenRecords }: Props) {
  const reducedMotion = useReducedMotion();

  const stats = [
    `${result.minutes} min`,
    `${result.steps} ${result.steps === 1 ? "step" : "steps"}`,
    result.karma > 0 ? `+${result.karma} karma` : null,
    result.quality > 0 ? `quality ${result.quality}%` : null,
  ].filter(Boolean) as string[];

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="premium-panel gilt-ring relative w-full rounded-2xl p-4 sm:p-5"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss last session result"
        className="absolute right-2.5 top-2.5 rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-[linear-gradient(160deg,hsl(var(--primary)/0.22),hsl(var(--primary)/0.06))] flex items-center justify-center shrink-0 shadow-[0_0_16px_hsl(var(--primary)/0.16)]">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-display tracking-[0.25em] uppercase text-primary/70">
            Your last sitting
          </p>
          <h3 className="mt-0.5 font-display text-base font-medium text-foreground">
            You did it.
          </h3>
          {stats.length > 0 && (
            <p className="mt-1 text-[11px] text-foreground/70 tabular-nums">
              {stats.join(" · ")}
            </p>
          )}
          {result.shift && (
            <p className="mt-2 text-xs italic leading-relaxed text-foreground/80 line-clamp-3">
              "{result.shift}"
            </p>
          )}
          {result.next && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-primary/85">
              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-2">{result.next}</span>
            </p>
          )}
        </div>
      </div>

      {onOpenRecords && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onOpenRecords}
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            See records
          </button>
        </div>
      )}
    </motion.section>
  );
}
