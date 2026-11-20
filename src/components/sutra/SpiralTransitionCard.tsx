/**
 * SpiralTransitionCard
 * Full-screen informative card shown between blocks of a multi-step spiral.
 * "Step X of Y · Label · Duration — intro. Continue / Stop".
 */
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";

function fmtMin(sec: number) {
  const m = Math.round(sec / 60);
  return m <= 1 ? "1m" : `${m}m`;
}

export default function SpiralTransitionCard() {
  const { active, advance, stop, totalSteps } = useSessionOrchestrator();

  if (typeof document === "undefined") return null;
  const open = !!active?.showTransition;
  const nextIdx = active ? active.currentIndex + 1 : -1;
  const nextBlock = active && nextIdx < active.plan.blocks.length ? active.plan.blocks[nextIdx] : null;

  return createPortal(
    <AnimatePresence>
      {open && active && nextBlock && (
        <motion.div
          className="fixed inset-0 z-[85] bg-background/95 backdrop-blur-xl flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            type="button"
            onClick={stop}
            className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground transition"
            aria-label="Stop session"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="w-full max-w-md text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] mb-5">
              <Sparkles className="w-3 h-3" />
              <span>Step {nextIdx + 1} of {totalSteps}</span>
            </div>

            <h2 className="text-2xl font-light text-foreground mb-2">{nextBlock.label}</h2>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-4">
              {nextBlock.surface} · {fmtMin(nextBlock.durationSec)}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 px-3">
              {nextBlock.intro}
            </p>

            <button
              type="button"
              onClick={advance}
              className="w-full py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition inline-flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={stop}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground transition"
            >
              Stop session
            </button>

            <p className="text-[10px] italic text-muted-foreground/70 mt-6 px-4">
              You can stop anytime — your progress is yours.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
