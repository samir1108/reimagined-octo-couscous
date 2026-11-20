import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { computeLifetimePhase, shouldUseSilentMode } from "@/lib/consciousness/lifetimeSpiral";

/**
 * SILENT MODE SHELL (Batch 13 — Phase 10 Beyond)
 * For users who reach Phase 9+ in the lifetime spiral, the app
 * dissolves into near-emptiness: just presence, no UI noise.
 */

interface Props {
  vLevel: number;
  daysActive: number;
  breakthroughs: number;
  children: ReactNode;
}

export default function SilentModeShell({ vLevel, daysActive, breakthroughs, children }: Props) {
  const phase = computeLifetimePhase({ vLevel, daysActive, breakthroughs });
  const silent = shouldUseSilentMode(phase.phase);

  if (!silent) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.03, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="w-24 h-24 rounded-full border border-primary/20"
      />
      <p className="mt-8 text-sm font-display text-muted-foreground italic">
        Nothing more to say.
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40">
        Just be
      </p>
    </motion.div>
  );
}
