"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";

interface KarmaIndicatorProps {
  karmaPoints: number;
  karmaTier?: string;
  karmaToNext?: number | null;
  compact?: boolean;
}

export default function KarmaIndicator({ karmaPoints, karmaTier, karmaToNext, compact = false }: KarmaIndicatorProps) {
  const reducedMotion = useReducedMotion();

  if (!Number.isFinite(karmaPoints) || karmaPoints < 0) return null;
  const label = [
    `Karma ${karmaPoints}`,
    karmaTier,
    karmaToNext && karmaToNext > 0 ? `${karmaToNext} to next tier` : null,
  ].filter(Boolean).join(" · ");

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      role="img"
      aria-label={label}
      title={label}
      className="flex items-center gap-2 text-[10px] text-primary/70"
    >
      <Flame className="h-3 w-3" aria-hidden="true" />
      <span>{compact ? karmaPoints : `Karma ${karmaPoints}`}</span>
      {!compact && karmaTier && (
        <>
          <span className="text-muted-foreground/40">·</span>
          <span>{karmaTier}</span>
        </>
      )}
      {!compact && karmaToNext && karmaToNext > 0 && (
        <>
          <span className="text-muted-foreground/40">·</span>
          <span>{karmaToNext} to next</span>
        </>
      )}
    </motion.div>
  );
}