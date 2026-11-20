/**
 * RitualRunner — three-phase modal for an Off-App ritual.
 *
 *   1. Cue          → grounds the user in the moment
 *   2. Practice     → countdown timer with the depth-appropriate instruction
 *   3. Reflection   → one optional line; fully skippable
 *
 * Depth (base / deepen / subtle) is sourced from useRitualProgress and
 * shapes the practice prompt so the same ritual matures with the user.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipForward, Check } from "lucide-react";
import type { OffAppRitual } from "@/data/offAppRituals";
import { useRitualProgress, type RitualDepth } from "@/hooks/useRitualProgress";

interface Props {
  ritual: OffAppRitual;
  onClose: () => void;
}

type Phase = "cue" | "practice" | "reflect" | "done";

function deepenPrompt(r: OffAppRitual, depth: RitualDepth): string {
  if (depth === "subtle") {
    return `${r.instruction}\n\nSubtle layer: drop the doer. Let the practice happen on its own — no one performing it.`;
  }
  if (depth === "deepen") {
    return `${r.instruction}\n\nDeepen: stay one breath longer than feels natural. Notice what wants to rush you.`;
  }
  return r.instruction;
}

export default function RitualRunner({ ritual, onClose }: Props) {
  const { ensureEnrolled, recordCompletion, getInfo } = useRitualProgress();
  const info = getInfo(ritual.id);

  const [phase, setPhase] = useState<Phase>("cue");
  const [secondsLeft, setSecondsLeft] = useState(ritual.durationSec || 60);
  const [running, setRunning] = useState(false);
  const [reflection, setReflection] = useState("");
  const tickRef = useRef<number | null>(null);

  useEffect(() => { ensureEnrolled(ritual.id); }, [ritual.id, ensureEnrolled]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Timer
  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tickRef.current!);
          setRunning(false);
          setPhase("reflect");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [running]);

  const promptText = useMemo(() => deepenPrompt(ritual, info.depth), [ritual, info.depth]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const finish = (text?: string) => {
    recordCompletion(ritual.id, text);
    setPhase("done");
    window.setTimeout(onClose, 1100);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-border/40 bg-card/80 shadow-2xl overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Depth chip */}
        <div className="px-5 pt-5 flex items-center gap-2">
          <span className="text-2xl">{ritual.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="font-display text-base text-foreground truncate">{ritual.title}</div>
            <div className="text-[11px] font-body text-muted-foreground truncate">
              {ritual.whenLabel}
            </div>
          </div>
          <span className="text-[10px] font-display tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary/90">
            {info.depth === "subtle" ? "Subtle" : info.depth === "deepen" ? "Deepen" : "Base"} · D{info.daysSinceEnrolled + 1}
          </span>
        </div>

        <div className="px-5 pb-5 pt-4 min-h-[280px] flex flex-col">
          <AnimatePresence mode="wait">
            {phase === "cue" && (
              <motion.div
                key="cue"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-4"
              >
                <div className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">Cue</div>
                <div className="text-base font-body text-foreground/90 italic leading-relaxed">
                  "{ritual.cue}"
                </div>
                <button
                  onClick={() => { setPhase("practice"); setRunning(true); }}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm hover:opacity-90 transition-opacity"
                >
                  <Play className="h-4 w-4" /> Begin
                </button>
              </motion.div>
            )}

            {phase === "practice" && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex-1 flex flex-col gap-4"
              >
                <div className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">Practice</div>
                <div className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line">
                  {promptText}
                </div>
                <div className="flex-1" />
                <div className="flex items-center justify-between">
                  <div className="font-display text-3xl tabular-nums text-foreground">
                    {mm}:{ss}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRunning((r) => !r)}
                      className="p-2.5 rounded-full bg-muted/40 text-foreground hover:bg-muted/60 transition-colors"
                      aria-label={running ? "Pause" : "Resume"}
                    >
                      {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { setRunning(false); setPhase("reflect"); }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-display text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <SkipForward className="h-3.5 w-3.5" /> Done early
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "reflect" && (
              <motion.div
                key="reflect"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex-1 flex flex-col gap-3"
              >
                <div className="text-[10px] font-display tracking-[0.25em] uppercase text-muted-foreground">Reflection · optional</div>
                <div className="text-sm font-body text-foreground/80">
                  One line — what did you notice? <span className="text-muted-foreground">(or skip)</span>
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                  placeholder="A word, a feeling, nothing — all fine."
                  className="w-full rounded-xl bg-background/50 border border-border/30 px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 resize-none"
                />
                <div className="text-[11px] font-body text-muted-foreground italic">
                  — {ritual.closing}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => finish(reflection)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-display text-sm hover:opacity-90 transition-opacity"
                  >
                    <Check className="h-4 w-4" /> Complete
                  </button>
                  <button
                    onClick={() => finish()}
                    className="px-4 py-2.5 rounded-full bg-muted/40 text-muted-foreground hover:text-foreground font-display text-sm transition-colors"
                  >
                    Skip
                  </button>
                </div>
                {info.nextDepth && (
                  <div className="text-[11px] font-body text-muted-foreground/70 text-center pt-1">
                    {info.daysToNext > 0
                      ? `${info.daysToNext} day${info.daysToNext === 1 ? "" : "s"} until "${info.nextDepth}" layer unlocks`
                      : `"${info.nextDepth}" layer ready next session`}
                  </div>
                )}
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="h-12 w-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <div className="font-display text-sm text-foreground">Held.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
