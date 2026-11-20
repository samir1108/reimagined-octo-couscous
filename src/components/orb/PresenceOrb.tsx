import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import OrbControl from "./OrbControl";
import { APP_GOLD_ORB_PALETTE } from "./palettes";
import { cn } from "@/lib/utils";
import { playSoundEffect } from "@/lib/soundEffects";
import { supabase } from "@/lib/supabase";
import { readNeedDecision } from "@/lib/needEngine";
import { loadSuitability, prescribe } from "@/lib/prescription";
import { getCurrentGateForSchedule } from "@/lib/consciousness/dailyGates";
import { useGuruVoice } from "@/games/shell/useGuruVoice";
import type { TimeAskChoice } from "@/components/home/TimeAskSheet";

const WitnessOrbStage = lazy(() => import("./WitnessOrbStage"));
const TimeAskSheet = lazy(() =>
  import("@/components/home/TimeAskSheet").then((module) => ({ default: module.TimeAskSheet })),
);

export type WitnessMode = "witness" | "neti" | "inquiry";

const MODE_COPY: Record<
  WitnessMode,
  { label: string; title: string; hint: string; lines: string[] }
> = {
  witness: {
    label: "Witness",
    title: "I am not my mind.",
    hint: "Tap the orb to continue",
    lines: [
      "The mind does not want to let go. It has held old pain for so long that releasing it feels like dying.",
      "That resistance is not you. It is a survival habit the brain learned from past pain.",
      "You are the awareness in which the mind, the brain and the pain all appear.",
      "The soul was never wounded. Only the story wrapped around it was.",
      "Stay here and breathe. You do not have to fix the mind — only stop calling it yourself.",
    ],
  },
  neti: {
    label: "Neti neti",
    title: "Neti. Neti.",
    hint: "Tap to keep negating",
    lines: [
      "I am not this body.",
      "I am not this breath.",
      "I am not these thoughts.",
      "I am not this pain.",
      "I am not the mind that fears its own silence.",
      "What remains cannot be named. That is you.",
    ],
  },
  inquiry: {
    label: "Self-inquiry",
    title: "Who is aware of this?",
    hint: "Tap to move through the inquiry",
    lines: [
      "Bring one old pain gently to mind. Do not analyse it.",
      "Now notice: something in you is watching the pain.",
      "That watcher was never hurt. It has only been witnessing.",
      "Rest as the watcher. The pain can stay — it is no longer who you are.",
    ],
  },
};

const MODE_ORDER: WitnessMode[] = ["witness", "neti", "inquiry"];

function chime(kind: "tap" | "threshold") {
  try {
    playSoundEffect(kind);
  } catch {
    /* audio is optional */
  }
}

/**
 * Global witness orb.
 *
 * One small presence dot sits on every screen. It carries no WebGL cost until
 * it is opened: the launcher is a DOM control plus a CSS orb, and the real
 * React Three Fiber orb (WitnessOrbStage) is code-split behind a tap.
 *
 * Gestures follow the app-wide orb contract: tap = open, double-tap = neti
 * neti, triple-tap = self-inquiry, hold = the time-ask card that begins a
 * sitting at the length the user actually has.
 */
export default function PresenceOrb() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<WitnessMode>("witness");
  const [step, setStep] = useState(0);
  const [timeAskOpen, setTimeAskOpen] = useState(false);
  const [sessionStarting, setSessionStarting] = useState(false);
  const { say, stop: stopVoice } = useGuruVoice();
  const voiceRef = useRef(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const firstPathRef = useRef(pathname);

  const openOrb = useCallback(
    (next: WitnessMode, withVoice = false) => {
      lastFocusRef.current =
        typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
      setMode(next);
      setStep(0);
      setOpen(true);
      voiceRef.current = withVoice;
      chime("tap");
      if (withVoice) {
        void say(`${MODE_COPY[next].title} ${MODE_COPY[next].lines[0]}`);
      }
    },
    [say],
  );

  const close = useCallback(() => {
    setOpen(false);
    voiceRef.current = false;
    stopVoice();
    chime("tap");
    lastFocusRef.current?.focus?.();
  }, [stopVoice]);

  const advance = useCallback(() => {
    const next = (step + 1) % MODE_COPY[mode].lines.length;
    setStep(next);
    if (voiceRef.current) {
      void say(MODE_COPY[mode].lines[next]);
    }
    chime("tap");
  }, [mode, say, step]);

  const switchMode = useCallback(
    (next: WitnessMode) => {
      setMode(next);
      setStep(0);
      if (voiceRef.current) {
        void say(`${MODE_COPY[next].title} ${MODE_COPY[next].lines[0]}`);
      }
      chime("threshold");
    },
    [say],
  );

  /**
   * Hold opens the same pre-session card Home uses: how much time, how much
   * energy, and what is on the mind — then the sitting composes itself.
   */
  const openSitting = useCallback(() => {
    setOpen(false);
    setTimeAskOpen(true);
    voiceRef.current = false;
    stopVoice();
    chime("threshold");
  }, [stopVoice]);

  const handleTimeAskConfirm = useCallback(
    async (choice: TimeAskChoice) => {
      setSessionStarting(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setTimeAskOpen(false);
          navigate("/auth");
          return;
        }

        const need = await readNeedDecision(user.id, {
          energy: choice.energy,
          timeBudgetMin: choice.minutes,
        }).catch(() => null);
        const suitability = loadSuitability();
        const prescription = need
          ? prescribe({
              need,
              suitability,
              energy: choice.energy,
              timeBudgetMin: choice.minutes,
            })
          : undefined;
        const effectiveMinutes = prescription
          ? Math.min(choice.minutes, Math.max(3, prescription.dose.minutes))
          : choice.minutes;

        const { startGenerativeSession } = await import("@/lib/session-shell/api");
        const { sessionId } = await startGenerativeSession({
          intent: choice.intent,
          themeId: null,
          timeBudgetMin: effectiveMinutes,
          energy: choice.energy,
          gate: getCurrentGateForSchedule(new Date()),
          depth: "deep",
          prescription,
          suitability,
          need: need
            ? {
                concept: need.concept,
                label: need.label,
                intent: need.intent,
                familiarity: need.familiarity,
                minutes: need.shape.minutes,
                why: need.why,
                evidence: need.evidence,
              }
            : undefined,
        });

        setTimeAskOpen(false);
        navigate(`/app/session/${sessionId}`);
      } catch (error) {
        // Credits redirects are already triggered inside startGenerativeSession.
        if ((error as Error)?.message !== "insufficient_credits") {
          toast.error("Session could not be composed. Nothing was started — please retry.");
        }
      } finally {
        setSessionStarting(false);
      }
    },
    [navigate],
  );

  // A route change means the user has moved on — drop the overlay with it.
  useEffect(() => {
    if (firstPathRef.current === pathname) return;
    firstPathRef.current = pathname;
    setOpen(false);
    voiceRef.current = false;
    stopVoice();
  }, [pathname, stopVoice]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, close]);

  const copy = MODE_COPY[mode];
  const lineIndex = Math.min(step, copy.lines.length - 1);

  return (
    <>
      {!timeAskOpen ? (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-[calc(1.75rem+env(safe-area-inset-bottom))] sm:right-6">
          <div className="relative">
            <span
              aria-hidden
              className="orb-accent-breathe pointer-events-none absolute -inset-1.5 rounded-full"
            />
            <OrbControl
              ariaLabel="Witness orb. Tap for the reminder that you are not your mind. Double-tap for neti neti. Triple-tap for self-inquiry with the WebGL orb and spoken guidance. Press and hold to open the time card and begin a sitting."
              className="w-14 text-primary"
              onActivate={() => openOrb("witness")}
              onDouble={() => openOrb("neti")}
              onTriple={() => openOrb("inquiry", true)}
              onHold={openSitting}
            >
            {({ charge, holding }) => (
              <>
                <div
                  className="absolute inset-[12%] rounded-full"
                  style={{
                    background: `radial-gradient(circle at 38% 32%, ${APP_GOLD_ORB_PALETTE[3]} 0%, ${APP_GOLD_ORB_PALETTE[2]} 38%, ${APP_GOLD_ORB_PALETTE[1]} 68%, ${APP_GOLD_ORB_PALETTE[0]} 100%)`,
                    boxShadow: `0 0 ${18 + charge * 16}px hsl(var(--orb-hue, 38) 92% 60% / ${0.34 + charge * 0.22}), inset 0 0 12px hsl(var(--gold-50, 46) 100% 92% / 0.35)`,
                    transform: `scale(${1 + charge * 0.05})`,
                    transition: holding
                      ? "none"
                      : "transform 0.35s ease, box-shadow 0.35s ease",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-[12%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 34% 28%, hsl(0 0% 100% / 0.5), transparent 42%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-[26%] rounded-full border border-white/20"
                />
              </>
            )}
          </OrbControl>
        </div>
      </div>
      ) : null}

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  key="witness-overlay"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="witness-orb-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed inset-0 z-[120] overflow-y-auto overscroll-contain bg-background/95 backdrop-blur-2xl"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none fixed inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 24%, hsl(38 95% 60% / 0.16), transparent 58%)",
                    }}
                  />

                  <div className="relative mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-7 px-6 pb-16 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-8">
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={close}
                      aria-label="Close the witness orb"
                      className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:right-6"
                    >
                      <X className="h-5 w-5" aria-hidden />
                    </button>

                    <div className="relative w-[min(64vw,19rem)]">
                      <Suspense
                        fallback={
                          <div
                            className="absolute inset-[10%] rounded-full"
                            style={{
                              background: `radial-gradient(circle at 40% 35%, ${APP_GOLD_ORB_PALETTE[3]} 0%, ${APP_GOLD_ORB_PALETTE[2]} 45%, ${APP_GOLD_ORB_PALETTE[1]} 100%)`,
                              boxShadow: "0 0 90px hsl(38 95% 55% / 0.45)",
                            }}
                          />
                        }
                      >
                        <WitnessOrbStage
                          onActivate={advance}
                          onDouble={() => switchMode("neti")}
                          onTriple={() => switchMode("inquiry")}
                          onHold={openSitting}
                        />
                      </Suspense>
                    </div>

                    <div className="flex w-full flex-col items-center gap-4 text-center">
                      <h2
                        id="witness-orb-title"
                        className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                      >
                        {copy.title}
                      </h2>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={`${mode}-${lineIndex}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.26, ease: "easeOut" }}
                          className="min-h-[5.5rem] max-w-md font-body text-[0.975rem] leading-relaxed text-muted-foreground"
                        >
                          {copy.lines[lineIndex]}
                        </motion.p>
                      </AnimatePresence>
                      <p className="text-[0.7rem] uppercase tracking-[0.22em] text-primary/70">
                        {copy.hint}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {MODE_ORDER.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => switchMode(key)}
                          aria-pressed={mode === key}
                          className={cn(
                            "rounded-full border px-4 py-2 font-body text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                            mode === key
                              ? "border-primary/45 bg-primary/12 text-primary"
                              : "border-border/40 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {MODE_COPY[key].label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={openSitting}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/12 px-6 py-3 font-display text-sm text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      Begin a sitting · choose your time
                    </button>

                    <p className="text-center font-body text-[0.7rem] leading-relaxed text-muted-foreground/70">
                      Hold the orb to begin a sitting · double-tap for neti neti · triple-tap for
                      self-inquiry
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      {timeAskOpen ? (
        <Suspense fallback={null}>
          <TimeAskSheet
            open={timeAskOpen}
            onOpenChange={setTimeAskOpen}
            onConfirm={handleTimeAskConfirm}
            loading={sessionStarting}
          />
        </Suspense>
      ) : null}
    </>
  );
}
