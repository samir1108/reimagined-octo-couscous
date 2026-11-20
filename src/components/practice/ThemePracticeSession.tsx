/**
 * ThemePracticeSession — The Begin Practice flow.
 * Visually consistent with the Dojo (primary/accent, glass cards).
 * No redundant pack overview: tap Begin → straight into the practice.
 * Filters filler items ("Your Choice" placeholder) and de-dupes identical "why" copy.
 */
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Loader2, Pause, Play, Timer as TimerIcon, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useTodayPracticePack,
  useComposeTodayPractice,
  useMarkPracticeComplete,
  useLogArrivalState,
  type TodayPracticeItem,
  type ArrivalState,
} from "@/hooks/useTodayPractice";
import GuidedPracticeRuntime from "./GuidedPracticeRuntime";
import ArrivalRitual from "./ArrivalRitual";

interface ThemePracticeSessionProps {
  theme: {
    title: string;
    description: string;
    affirmation?: string | null;
    action_items?: string[];
    daily_intentions?: string[];
    felt_sense_opener?: string;
  };
  onClose: () => void;
  onComplete?: () => void | Promise<void>;
}

// ── Filter true placeholder items only. user_choice items now carry a real
// practice (mapped from the user's intention), so we keep them — they ARE the 20%.
function curatePractices(raw: TodayPracticeItem[]): TodayPracticeItem[] {
  const seenWhy = new Set<string>();
  return raw
    .filter((p) => {
      // Drop only the legacy empty placeholder ("Your Choice / Pick anything").
      if (p.allocation === "user_choice" && p.practice === "user_choice") return false;
      if (/your choice/i.test(p.title) && /pick anything/i.test(p.why)) return false;
      return true;
    })
    .filter((p) => {
      const key = (p.why || "").trim().toLowerCase();
      if (!key) return true;
      if (seenWhy.has(key)) {
        p = { ...p, why: "" };
      }
      seenWhy.add(key);
      return true;
    });
}

function detectTimeSlot(): string {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 16) return "afternoon";
  if (h < 20) return "evening";
  return "night";
}

export default function ThemePracticeSession({ theme, onClose, onComplete }: ThemePracticeSessionProps) {
  const { data: pack, isLoading: packLoading } = useTodayPracticePack();
  const compose = useComposeTodayPractice();
  const markComplete = useMarkPracticeComplete();
  const logArrival = useLogArrivalState();

  // ── Arrival ritual disabled — Begin goes straight into the session.
  // Composer infers arrival state from recent context.
  const [arrivalDone, setArrivalDone] = useState(true);
  const [arrivalState, setArrivalState] = useState<ArrivalState | null>(null);

  useEffect(() => {
    if (!pack && !compose.isPending) compose.mutate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArrivalComplete = (arrival: ArrivalState) => {
    setArrivalState(arrival);
    setArrivalDone(true);
    logArrival.mutate({ ...arrival, time_slot: detectTimeSlot() });
    compose.mutate({ force: true, arrival });
  };

  const handleArrivalSkip = () => {
    setArrivalDone(true);
    if (!pack && !compose.isPending) compose.mutate(false);
  };

  const practices: TodayPracticeItem[] = useMemo(
    () => curatePractices((pack?.practices as TodayPracticeItem[]) || []),
    [pack?.practices],
  );

  // ── Session flow state — start straight in "intro" of step 0 (no overview screen).
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<"intro" | "chat">("intro");
  const currentStep = practices[stepIndex];
  const totalDuration = practices.reduce((s, p) => s + (p.duration || 10), 0) || 30;

  // ── Per-step timer (resets when step changes; pauses through arrival)
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    setElapsed(0);
    setRunning(true);
    setArrived(false);
  }, [stepIndex]);

  useEffect(() => {
    if (!running || phase !== "chat" || !arrived) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running, phase, arrived]);

  const stepDurationMin = currentStep?.duration || 5;
  const stepTotalSec = stepDurationMin * 60;
  const remaining = Math.max(0, stepTotalSec - elapsed);
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const progress = Math.min(1, elapsed / stepTotalSec);

  const startCurrentPractice = () => {
    if (!currentStep) return;
    setElapsed(0);
    setRunning(true);
    setArrived(false);
    setPhase("chat");
  };

  const completeCurrentPractice = async (feedback?: { quality?: number; note?: string }) => {
    if (!pack || !currentStep) return;
    try {
      await markComplete.mutateAsync({
        packId: pack.id,
        practice: currentStep.practice,
        quality: feedback?.quality ?? 0.75,
        loopTag: (currentStep as any).loop_tag ?? null,
      });
    } catch (error) {
      console.error("Could not save practice completion", error);
      toast.error("We couldn't save that practice completion. Please try again.");
      return;
    }

    if (stepIndex < practices.length - 1) {
      setStepIndex((i) => i + 1);
      setPhase("intro");
    } else {
      await onComplete?.();
      onClose();
    }
  };

  // ── ARRIVAL GATE — first thing the user sees, before any composing
  if (!arrivalDone) {
    return createPortal(
      <ArrivalRitual onComplete={handleArrivalComplete} onSkip={handleArrivalSkip} />,
      document.body,
    );
  }

  // ── Loading state while pack composes (post-arrival)
  if (packLoading || compose.isPending || !currentStep) {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <p className="mt-4 text-xs font-display tracking-[0.3em] uppercase text-muted-foreground">
          {arrivalState ? "Tuning your practice to how you arrived…" : "Composing your practice…"}
        </p>
      </motion.div>,
      document.body,
    );
  }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Cohesive backdrop — matches Dojo's primary/accent palette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04]" />
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, hsl(var(--primary) / 0.18), transparent 60%)",
          }}
          animate={{ opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto w-full max-w-2xl flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-card/60 backdrop-blur-md border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground/70 text-[10px] font-display tracking-[0.25em] uppercase">
            Step {stepIndex + 1} of {practices.length} · {theme.title}
          </p>
          <h2 className="text-foreground text-sm font-display font-medium truncate">
            {currentStep.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-9 h-9 rounded-full bg-card/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <div className="px-3 py-1.5 rounded-full bg-card/60 border border-border/40 flex items-center gap-1.5">
            <TimerIcon className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground/85 text-xs font-mono tabular-nums">
              {mm}:{ss}
            </span>
          </div>
        </div>
      </div>

      {/* Step rail — compact dots, not a full re-listing */}
      <div className="relative z-10 mx-auto w-full max-w-2xl px-4">
        <div className="flex items-center gap-1.5">
          {practices.map((_, i) => (
            <div
              key={i}
              className={[
                "h-0.5 flex-1 rounded-full transition-colors",
                i < stepIndex
                  ? "bg-primary/70"
                  : i === stepIndex
                    ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-border/40",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="mt-2 h-px bg-border/30 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/60 to-accent/60"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {phase === "intro" ? (
        // ── STEP INTRO — matches Dojo card language
        <div className="relative z-10 mx-auto w-full max-w-2xl flex-1 flex flex-col items-center justify-center px-6 py-8">
          <motion.div
            key={`intro-${stepIndex}`}
            className="w-full max-w-md text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="inline-block text-5xl mb-6"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              {currentStep.emoji}
            </motion.span>
            <p className="text-muted-foreground/70 text-[10px] font-display tracking-[0.3em] uppercase mb-2">
              {currentStep.allocation === "fixed"
                ? "Anchor Practice"
                : currentStep.allocation === "ai_personalized"
                  ? "Theme-Tuned"
                  : "Open Practice"}
            </p>
            <h2 className="text-foreground text-2xl md:text-3xl font-display mb-4">
              {currentStep.title}
            </h2>
            {currentStep.why && (
              <p className="text-muted-foreground text-sm font-body italic mb-6 leading-relaxed">
                {currentStep.why}
              </p>
            )}
            {(currentStep as any).teaching && (
              <p className="text-foreground/85 text-base font-display mb-4 leading-relaxed px-2">
                "{(currentStep as any).teaching}"
              </p>
            )}
            {(currentStep as any).instruction && (
              <p className="text-muted-foreground/85 text-xs font-body mb-8 leading-relaxed px-4">
                {(currentStep as any).instruction}
              </p>
            )}
            <motion.button
              onClick={startCurrentPractice}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-display tracking-[0.2em] uppercase shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.6)] hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.7)] transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-3 h-3" />
              Begin · {currentStep.duration} min
            </motion.button>
          </motion.div>
        </div>
      ) : (
        // ── PRACTICE — guided runtime drives time-anchored beats
        <GuidedPracticeRuntime
          step={currentStep}
          themeTitle={theme.title}
          themeOpener={theme.felt_sense_opener}
          durationMin={stepDurationMin}
          elapsedSec={elapsed}
          running={running && arrived}
          onArrivalReady={() => setArrived(true)}
          isCompleting={markComplete.isPending}
          isLastStep={stepIndex >= practices.length - 1}
          onComplete={(fb) => completeCurrentPractice({ quality: fb.quality, note: fb.note })}
        />
      )}
    </motion.div>,
    document.body,
  );
}
