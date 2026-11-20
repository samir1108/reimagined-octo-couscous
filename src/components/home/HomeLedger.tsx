/**
 * HomeLedger — the money/merit strip under the day mission.
 *
 * Karma points come from `user_karma`, credits from `user_credits`
 * (paise → ₹). "Records" opens the practice records tab; "Credits" opens the
 * top-up page. Read-only, one row.
 */
import { motion, useReducedMotion } from "framer-motion";
import { Coins, ScrollText, Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

interface HomeLedgerProps {
  karma: number;
  nextThreshold?: number | null;
  toNext?: number | null;
  onOpenRecords: () => void;
  onOpenCredits: () => void;
}

export default function HomeLedger({
  karma,
  toNext,
  onOpenRecords,
  onOpenCredits,
}: HomeLedgerProps) {
  const reducedMotion = useReducedMotion();
  const { data: credits } = useCredits();

  const balance = typeof credits?.balance_paise === "number" ? credits.balance_paise / 100 : null;

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.45 }}
      aria-label="Karma and credits"
      className="glass-1 w-full rounded-2xl px-3 py-2.5 flex items-center gap-1"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <Sparkles className="w-3.5 h-3.5 text-primary/70 shrink-0" aria-hidden="true" />
        <span className="text-[11px] font-medium text-foreground/85 tabular-nums">{karma}</span>
        <span className="text-[10px] text-muted-foreground/45 truncate">
          karma{typeof toNext === "number" && toNext > 0 ? ` · ${toNext} to next` : ""}
        </span>
      </div>

      <button
        onClick={onOpenCredits}
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] text-muted-foreground/70 hover:text-foreground hover:bg-muted/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Open credits"
      >
        <Coins className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="tabular-nums">{balance === null ? "—" : `₹${balance.toFixed(0)}`}</span>
      </button>

      <button
        onClick={onOpenRecords}
        className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] text-muted-foreground/70 hover:text-foreground hover:bg-muted/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Open practice records"
      >
        <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
        Records
      </button>
    </motion.section>
  );
}
