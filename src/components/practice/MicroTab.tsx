/**
 * Micro Tab — 60-second awareness drops.
 * Swipeable / scrollable card list. Tap a card to expand its script
 * and start a tiny inline timer.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { MICRO_PRACTICES, type MicroPractice } from "@/data/microPractices";

export default function MicroTab() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/30 bg-card/30 px-4 py-3">
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          One minute. That's all. For queues, red lights, lifts, the moment between
          meetings. Tap any card to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MICRO_PRACTICES.map((m) => (
          <MicroCard
            key={m.id}
            micro={m}
            active={activeId === m.id}
            onActivate={() => setActiveId(activeId === m.id ? null : m.id)}
          />
        ))}
      </div>
    </div>
  );
}

function MicroCard({
  micro,
  active,
  onActivate,
}: {
  micro: MicroPractice;
  active: boolean;
  onActivate: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= micro.durationSec) {
          setRunning(false);
          return micro.durationSec;
        }
        return e + 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, micro.durationSec]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const pct = Math.min(100, (elapsed / micro.durationSec) * 100);

  return (
    <motion.div
      layout
      onClick={() => !active && onActivate()}
      className={`rounded-2xl border bg-card/30 overflow-hidden cursor-pointer transition-colors ${
        active ? "border-primary/40" : "border-border/30 hover:border-border/60"
      }`}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="text-2xl shrink-0">{micro.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm text-foreground truncate">{micro.title}</div>
          <div className="text-[11px] font-body text-muted-foreground">
            {micro.durationSec}s · {micro.tag}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pb-4 pt-1 border-t border-border/20 space-y-3">
              <div className="text-sm font-body text-foreground/90 leading-relaxed">
                {micro.script}
              </div>

              <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-body tabular-nums text-muted-foreground">
                  {Math.max(0, micro.durationSec - elapsed)}s
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={reset}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                    aria-label="Reset"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setRunning((r) => !r)}
                    className="h-9 px-4 flex items-center gap-2 rounded-full bg-primary text-primary-foreground text-xs font-display tracking-wide hover:bg-primary/90"
                  >
                    {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {running ? "Pause" : elapsed > 0 ? "Resume" : "Begin"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
