/**
 * SessionOrbStage — the immersive full-screen orb beat.
 *
 * Used twice in the daily flow:
 *   1. after the time-ask card, while the session is being composed
 *   2. on entry to a session, before the agenda/step cards appear
 *
 * Tap anywhere (or `autoHideMs`) dismisses it when `onDone` is provided.
 */
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HomeOrb from "@/components/orb/HomeOrb";

interface Props {
  open: boolean;
  title?: string;
  subtitle?: string;
  autoHideMs?: number;
  onDone?: () => void;
}

export default function SessionOrbStage({
  open,
  title = "Preparing your sitting…",
  subtitle,
  autoHideMs,
  onDone,
}: Props) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !autoHideMs || !onDone) return;
    const id = window.setTimeout(onDone, autoHideMs);
    return () => window.clearTimeout(id);
  }, [open, autoHideMs, onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="session-orb-stage"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
          onClick={onDone}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background px-6 text-center"
        >
          <div className="relative h-64 w-64">
            <HomeOrb className="absolute inset-0" />
          </div>

          <p className="mt-12 max-w-sm font-display text-lg sm:text-xl text-foreground/90">
            {title}
          </p>
          {subtitle && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
