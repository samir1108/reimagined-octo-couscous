/**
 * GuidedPracticeRuntime v2 — "Cinematic single-beat stage"
 * ────────────────────────────────────────────────────────
 * Replaces the scrolling chat-style stack with a single immersive stage:
 *   1. ARRIVAL    — 3 quick check-in chips (How are you arriving?) before starting.
 *                   Optional. Shapes the practice. Auto-skips after 12s if untouched.
 *   2. PRACTICE   — One beat at a time, large legible type, breath orb as anchor,
 *                   crossfade between beats. Only ONE contextual noticing prompt
 *                   surfaces mid-way (not a permanent chat box).
 *   3. COMPLETE   — Felt-sense check (Lighter / Same / Heavier) + advance.
 *
 * Design goals (per founder feedback):
 *   • Orb is the hero — big, breathing, alive.
 *   • Text is high-contrast, readable, centered, never clipped.
 *   • No persistent input box — questions appear only where they belong.
 *   • Same component drives Practice tab AND in-session practice steps.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send, Loader2, ArrowRight } from "lucide-react";
import { buildPracticeScript, type PracticeBeat } from "@/lib/practice/script";
import type { TodayPracticeItem } from "@/hooks/useTodayPractice";
interface GuidedPracticeRuntimeProps {
  step: TodayPracticeItem;
  themeTitle: string;
  themeOpener?: string;
  durationMin: number;
  elapsedSec: number;
  running: boolean;
  onComplete: (feedback: {
    quality: number;
    note?: string;
    feltShift?: "lighter" | "same" | "heavier";
    arrivalState?: string;
  }) => void;
  onArrivalReady?: () => void; // notifies parent so the timer can start AFTER arrival
  isCompleting: boolean;
  isLastStep: boolean;
}

const ARRIVAL_OPTIONS = [
  { id: "scattered", label: "Scattered", hint: "Mind is jumping" },
  { id: "tired",     label: "Tired",     hint: "Low energy" },
  { id: "tense",     label: "Tense",     hint: "Body is gripping" },
  { id: "okay",      label: "Okay",      hint: "Just here" },
  { id: "open",      label: "Open",      hint: "Already settled" },
];

export default function GuidedPracticeRuntime({
  step,
  themeTitle,
  themeOpener,
  durationMin,
  elapsedSec,
  running,
  onComplete,
  onArrivalReady,
  isCompleting,
  isLastStep,
}: GuidedPracticeRuntimeProps) {
  const totalSec = Math.max(60, durationMin * 60);

  // ── Phase machine: arrival → practice → complete (complete is computed)
  const [phase, setPhase] = useState<"arrival" | "practice">("arrival");
  const [arrivalState, setArrivalState] = useState<string | null>(null);

  const beats = useMemo<PracticeBeat[]>(
    () => buildPracticeScript(step, { themeTitle, themeOpener, totalSec, arrivalState }),
    [step, themeTitle, themeOpener, totalSec, arrivalState],
  );

  // Index of the beat currently on stage (only one shown at a time)
  const currentBeatIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < beats.length; i++) {
      if (elapsedSec >= beats[i].atSec) idx = i;
      else break;
    }
    return idx;
  }, [beats, elapsedSec]);
  const currentBeat = beats[currentBeatIndex];
  const nextBeat = beats[currentBeatIndex + 1];

  // Mid-practice noticing prompt — surfaces ONCE, around 60% of duration
  const noticingAt = Math.round(totalSec * 0.6);
  const showNoticing = phase === "practice" && elapsedSec >= noticingAt && elapsedSec < noticingAt + 25;
  const [noticing, setNoticing] = useState("");
  const [noticingDone, setNoticingDone] = useState(false);

  const isFinished = phase === "practice" && elapsedSec >= totalSec;

  // Closing felt-sense feedback
  const [feltShift, setFeltShift] = useState<"lighter" | "same" | "heavier" | null>(null);

  // ─── ARRIVAL: auto-advance after 12s of inaction so it never blocks
  useEffect(() => {
    if (phase !== "arrival") return;
    const t = setTimeout(() => {
      if (phase === "arrival") {
        setPhase("practice");
        onArrivalReady?.();
      }
    }, 12000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const confirmArrival = (id: string) => {
    setArrivalState(id);
    setPhase("practice");
    onArrivalReady?.();
  };
  const skipArrival = () => {
    setPhase("practice");
    onArrivalReady?.();
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────

  if (phase === "arrival") {
    return (
      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <p className="text-muted-foreground/70 text-[10px] font-display tracking-[0.3em] uppercase mb-3">
            One breath before we begin
          </p>
          <h3 className="text-foreground text-2xl md:text-[28px] font-display leading-snug mb-8">
            How are you arriving?
          </h3>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ARRIVAL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => confirmArrival(opt.id)}
                className="group flex flex-col items-center px-4 py-3 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/70 hover:border-primary/40 transition-all"
              >
                <span className="text-foreground text-sm font-display">{opt.label}</span>
                <span className="text-muted-foreground/60 text-[10px] font-body mt-0.5">{opt.hint}</span>
              </button>
            ))}
          </div>
          <button
            onClick={skipArrival}
            className="text-muted-foreground/60 hover:text-muted-foreground text-[11px] font-display tracking-[0.2em] uppercase transition-colors"
          >
            Skip · just begin
          </button>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-7 shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.7)]"
          >
            <Check className="w-9 h-9 text-primary-foreground" />
          </motion.div>
          <p className="text-muted-foreground/80 text-[10px] font-display tracking-[0.3em] uppercase mb-2">
            Practice Complete
          </p>
          <h3 className="text-foreground text-2xl font-display mb-7">
            {step.title}
          </h3>
          <p className="text-foreground/80 text-base font-body mb-5 leading-relaxed">
            How does the body feel right now?
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["lighter", "same", "heavier"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFeltShift(opt)}
                className={[
                  "px-5 py-2.5 rounded-full border text-[11px] font-display tracking-wider uppercase transition-all",
                  feltShift === opt
                    ? "bg-primary/20 border-primary/60 text-foreground shadow-[0_4px_20px_-8px_hsl(var(--primary)/0.6)]"
                    : "bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70",
                ].join(" ")}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={isCompleting}
            onClick={() =>
              onComplete({
                quality: feltShift === "lighter" ? 0.9 : feltShift === "heavier" ? 0.5 : 0.75,
                note: noticing.trim() || undefined,
                feltShift: feltShift ?? undefined,
                arrivalState: arrivalState ?? undefined,
              })
            }
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-display tracking-[0.2em] uppercase shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.6)] disabled:opacity-50"
          >
            {isCompleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                {isLastStep ? "Finish Session" : "Next Practice"}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── PRACTICE STAGE — single beat, hero orb, crossfade
  return (
    <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 flex flex-col items-center justify-between px-6 py-6">
      {/* Hero orb — same Cosmic Orb used on Home (ambient, non-interactive here) */}
      <div className="flex-1 w-full flex items-center justify-center pointer-events-none">
        
      </div>

      {/* Beat copy stage — fades between beats, never stacks */}
      <div className="w-full max-w-lg min-h-[160px] flex items-center justify-center px-2">
        <AnimatePresence mode="wait">
          {currentBeat && (
            <motion.div
              key={`beat-${currentBeatIndex}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center"
            >
              {currentBeat.title && (
                <p className="text-primary/80 text-[10px] font-display tracking-[0.35em] uppercase mb-3">
                  {currentBeat.title}
                </p>
              )}
              <p className={[
                "leading-relaxed text-foreground",
                currentBeat.tone === "anchor"
                  ? "text-xl md:text-2xl font-display"
                  : currentBeat.tone === "instruction"
                    ? "text-lg md:text-xl font-display"
                    : "text-base md:text-lg font-body italic text-foreground/85",
              ].join(" ")}>
                {currentBeat.body}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mid-practice noticing — appears ONCE, then disappears */}
      <div className="w-full max-w-lg h-[72px] mt-4 flex items-center justify-center">
        <AnimatePresence>
          {showNoticing && !noticingDone && (
            <motion.form
              key="noticing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (noticing.trim()) setNoticingDone(true);
              }}
              className="w-full"
            >
              <p className="text-center text-muted-foreground/80 text-[10px] font-display tracking-[0.3em] uppercase mb-2">
                What's present right now? (optional)
              </p>
              <div className="flex items-center gap-2">
                <input
                  value={noticing}
                  onChange={(e) => setNoticing(e.target.value)}
                  placeholder="A word or sensation…"
                  className="flex-1 px-4 py-2.5 rounded-full bg-card/50 border border-border/40 text-foreground placeholder:text-muted-foreground/50 text-sm font-body focus:outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setNoticingDone(true)}
                  className="text-muted-foreground/60 hover:text-foreground text-[10px] font-display tracking-[0.2em] uppercase px-2"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={!noticing.trim()}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground disabled:opacity-30"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle next-beat dwell hint */}
      {nextBeat && (
        <motion.p
          key={`hint-${currentBeatIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-2 text-muted-foreground/50 text-[10px] font-display tracking-[0.3em] uppercase"
        >
          {Math.max(1, Math.ceil((nextBeat.atSec - elapsedSec)))}s · breathing
        </motion.p>
      )}
    </div>
  );
}

