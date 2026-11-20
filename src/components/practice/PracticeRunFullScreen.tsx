/**
 * PracticeRunFullScreen
 * ─────────────────────
 * When a practice run is active (PracticeRunController.active != null), take
 * over the entire viewport with an immersive surface: ambient background,
 * step indicator, large breathing pulse, elapsed/total timer, and the global
 * controls (Next, More, Stop). The underlying page stays mounted but is
 * hidden behind this overlay.
 *
 * If a sutra spiral is active alongside the run, we surface step N/total +
 * current/next labels from SessionOrchestrator. Otherwise we show just the
 * primary practice + planned duration.
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MoreHorizontal, X } from "lucide-react";
import { usePracticeRunController } from "@/contexts/PracticeRunControllerContext";
import { useSessionOrchestrator } from "@/contexts/SessionOrchestratorContext";
import { useActiveGuru } from "@/hooks/useActiveGuru";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, Math.floor(sec % 60));
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PracticeRunFullScreen() {
  const { active, setMoreOpen, abort } = usePracticeRunController();
  const orch = useSessionOrchestrator();
  const { data: activeGuru } = useActiveGuru();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return null;

  const elapsed = Math.max(0, Math.round((now - active.startedAt) / 1000));
  const total = Math.max(1, active.plannedDurationSec);
  const remaining = Math.max(0, total - elapsed);
  const pct = Math.min(100, (elapsed / total) * 100);

  const stepLabel = orch.isActive && orch.totalSteps > 1
    ? `Step ${orch.stepNumber}/${orch.totalSteps}`
    : "Practice";
  const currentTitle =
    orch.currentBlock?.label ?? active.primaryPractice.toUpperCase();
  const nextLabel = orch.nextBlock?.label ?? null;

  return (
    <AnimatePresence>
      <motion.div
        key="practice-fullscreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="fixed inset-0 z-[55] flex flex-col bg-background"
      >
        {/* Cinematic guide portrait — same companion shown across all session surfaces */}
        {activeGuru?.image && (
          <img
            src={activeGuru.image}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--background) / 0.78) 0%, hsl(var(--background) / 0.55) 35%, hsl(var(--background) / 0.72) 70%, hsl(var(--background) / 0.96) 100%)",
          }}
        />
        <div className="absolute inset-0 opacity-50">
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-start justify-between px-5 pt-5">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-display tracking-[0.32em] uppercase text-primary/80">
              {stepLabel}
            </span>
            <span className="text-sm font-display text-foreground/90 truncate max-w-[60vw]">
              {currentTitle}
            </span>
            {nextLabel && (
              <span className="text-[10px] text-muted-foreground/70 truncate max-w-[60vw]">
                Next: {nextLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition"
              aria-label="More controls"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => abort()}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition"
              aria-label="Stop session"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center pulse + timer */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-[260px] h-[260px] flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-[180px] h-[180px] rounded-full border border-primary/25"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex flex-col items-center justify-center">
              <span className="text-5xl font-display tracking-tight text-foreground">
                {fmt(remaining)}
              </span>
              <span className="mt-1 text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/70">
                remaining
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-10 w-full max-w-xs">
            <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "linear" }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground/70">
              <span>{fmt(elapsed)}</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="relative z-10 px-6 pb-8 flex justify-center">
          <button
            type="button"
            onClick={() => orch.completeCurrent()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 transition"
          >
            {orch.nextBlock ? "Next step" : "Finish practice"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
