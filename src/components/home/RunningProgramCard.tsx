import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import {
  getActiveProgram,
  subscribeActiveProgram,
  clearActiveProgram,
  type ActiveProgram,
} from "@/lib/programs/activeProgram";

/**
 * Small card shown above the Home orb when a V3 program session is running.
 * Lets the user resume (tap → ProgramsV3) or stop (clears active state).
 */
export default function RunningProgramCard() {
  const navigate = useNavigate();
  const [active, setActive] = useState<ActiveProgram | null>(null);

  useEffect(() => {
    setActive(getActiveProgram());
    return subscribeActiveProgram(() => setActive(getActiveProgram()));
  }, []);

  if (!active) return null;

  const pct = active.totalAtoms > 0
    ? Math.min(100, Math.round((active.cursor / active.totalAtoms) * 100))
    : 0;

  return (
    <AnimatePresence>
      <motion.div
        key={active.programId}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="relative w-full max-w-md mb-4"
      >
        <button
          onClick={() => navigate(`/app/programs-v3?open=${active.programId}`)}
          className="w-full rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 pr-12 text-left hover:bg-primary/15 transition"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-primary/90 font-medium">
              Program running
            </span>
            <span className="text-[10px] uppercase tracking-wider text-primary/70">
              Session {active.sessionIndex}
            </span>
          </div>
          <div className="mt-1 text-sm text-foreground/90 line-clamp-1 font-medium">
            {active.programTitle}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-primary/15 overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {active.cursor}/{active.totalAtoms}
            </span>
            <Play className="w-3.5 h-3.5 text-primary fill-current" />
          </div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!window.confirm("Stop this program session?")) return;
            clearActiveProgram();
          }}
          className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-background/60 transition"
          aria-label="Stop program"
          title="Stop program"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
