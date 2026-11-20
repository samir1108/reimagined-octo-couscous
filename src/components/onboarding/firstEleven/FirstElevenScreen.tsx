/**
 * FirstElevenScreen — runner for The First Eleven (Gate 2).
 * ─────────────────────────────────
 * One sitting at a time:
 *   threshold (framing + last carry-seed) → steps (adaptive plan) →
 *   close (carry-seed + next teaser) → … → all eleven complete → the
 *   mapping is ready for The Mirror (Gate 4) and the journey picker (Gate 6).
 *
 * Progress is local-first (useFirstEleven); leaving mid-sitting resumes at
 * the next unfinished sitting.
 */
import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import SittingStepCard from "./SittingStepCard";
import TheDock from "./TheDock";
import TheMirror from "./TheMirror";
import { usePublishMirror } from "@/hooks/usePublishMirror";
import { FIRST_ELEVEN_SESSION_BY_N, FIRST_ELEVEN_TOTAL } from "@/lib/onboarding/firstElevenSessions";
import { planSession } from "@/lib/onboarding/firstElevenEngine";
import { useFirstEleven } from "@/hooks/useFirstEleven";
import { DOCK_ROLE_PHRASES, type DockSessionLike, type DockStepLike } from "@/hooks/useSittingDock";
import type { ConditioningResult } from "@/lib/onboarding/conditioningQuestions";
import type { FoundationAnswers } from "@/lib/onboarding/foundationAnalyzer";

type Phase = "threshold" | "sitting" | "close" | "complete";

interface Props {
  userId: string;
  userName?: string;
  seeds?: { conditioning?: ConditioningResult | null; foundationAnswers?: FoundationAnswers | null };
  onComplete: () => void;
  /** After the mirror: continue into the spiral explainer → journey picker. */
  onOpenJourneys?: () => void;
  onExit: () => void;
}

export default function FirstElevenScreen({ userId, userName, seeds, onComplete, onOpenJourneys, onExit }: Props) {
  const {
    progress,
    mapping,
    loading,
    answerQuestion,
    completeSession,
  } = useFirstEleven(userId, seeds);

  const firstUnfinished = useMemo(() => {
    for (let n = 1; n <= FIRST_ELEVEN_TOTAL; n++) {
      if (!progress.completed_sessions.includes(n)) return n;
    }
    return 0;
  }, [progress.completed_sessions]);

  const allDone = progress.completed_sessions.length >= FIRST_ELEVEN_TOTAL;
  const [sessionN, setSessionN] = useState(firstUnfinished || 1);
  const [phase, setPhase] = useState<Phase>(allDone ? "complete" : "threshold");
  const [stepIndex, setStepIndex] = useState(0);

  // Publish the finished mapping into the consciousness profile (once).
  usePublishMirror(userId, mapping, progress.completed_sessions.length >= FIRST_ELEVEN_TOTAL);

  const session: DockSessionLike | undefined = FIRST_ELEVEN_SESSION_BY_N(sessionN);

  // The Dock speaks to a structural summary of the current step.
  const dockStep = useMemo<DockStepLike | null>(() => {
    const s = plannedSteps[stepIndex];
    if (!s) return null;
    if (s.kind === "question") {
      return {
        kind: "question",
        label: s.question.title,
        subtitle: s.question.subtitle,
        rolePhrase: DOCK_ROLE_PHRASES[s.role] ?? "the question",
      };
    }
    if (s.kind === "silence") return { kind: "silence", label: s.prompt, body: s.prompt, seconds: s.seconds };
    if (s.kind === "breath") return { kind: "breath", label: "the breath practice", pattern: s.pattern, rounds: s.rounds };
    if (s.kind === "teaching") return { kind: "teaching", label: s.title, body: s.body };
    return { kind: "act", label: s.title, body: s.body };
  }, [plannedSteps, stepIndex]);

  // Words written this sitting (question text answers + silence lines + vows)
  // — seeds the Dock so the guide knows what has already been said.
  const typedWords = useMemo(
    () =>
      progress.answers
        .filter((a) => a.sessionId === session?.id && typeof a.value === "string" && a.value.length > 3)
        .map((a) => String(a.value))
        .slice(-6),
    [progress.answers, session?.id]
  );

  // Kept dock lines sharpen the mapping like any other written answer.
  const handleDockKeep = useCallback(
    (lines: string[]) => {
      if (!lines.length || !session) return;
      answerQuestion({
        questionId: `s${String(session.n).padStart(2, "0")}_dock`,
        sessionId: session.id,
        value: lines.join(" · "),
        band: 6,
        dimension: "awareness",
      });
    },
    [answerQuestion, session]
  );

  // ── adaptive plan for this sitting ──
  const plannedSteps = useMemo(() => {
    if (!session) return [];
    const askedIds = new Set(progress.answers.map((a) => a.questionId));
    return planSession(session, {
      askedIds,
      mapping,
      activeLoops: mapping.loops.map((l) => l.id),
      seed: userId,
    });
  }, [session, progress.answers, mapping, userId]);

  const handleStepNext = useCallback(() => {
    if (stepIndex + 1 < plannedSteps.length) {
      setStepIndex((i) => i + 1);
    } else if (session) {
      completeSession(session.n, session.carrySeed);
      setPhase(allDone ? "complete" : "close");
    }
  }, [stepIndex, plannedSteps.length, session, completeSession, allDone]);

  const enterNextSitting = useCallback(() => {
    const next = firstUnfinished;
    if (!next) {
      setPhase("complete");
      return;
    }
    setSessionN(next);
    setStepIndex(0);
    setPhase("threshold");
  }, [firstUnfinished]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background grid place-items-center">
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-primary/40 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-background">
      {/* Exit */}
      <button
        onClick={onExit}
        aria-label="Leave the sitting"
        className="fixed top-4 right-4 z-30 h-9 w-9 grid place-items-center rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition"
      >
        <X className="h-4 w-4" />
      </button>

      <AnimatePresence mode="wait">
        {/* ─── THRESHOLD ─── */}
        {phase === "threshold" && session && (
          <motion.div
            key={`threshold-${session.n}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-[100dvh] flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-6">
                Sitting {session.n} of {FIRST_ELEVEN_TOTAL}
                {userName ? ` · for ${userName}` : ""}
              </p>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="font-display text-3xl sm:text-4xl text-foreground leading-tight mb-5"
              >
                {session.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.9 }}
                className="font-display italic text-primary/85 text-base leading-relaxed mb-8"
              >
                {session.essence}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.9 }}
                className="text-[14px] text-muted-foreground leading-relaxed mb-8"
              >
                {session.purpose}
              </motion.p>

              {progress.carry_seeds[session.n - 1] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.9 }}
                  className="rounded-2xl border border-border/30 bg-card/40 px-4 py-3 mb-8 text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
                    Left with last time
                  </p>
                  <p className="text-[13px] text-foreground/85 italic font-display leading-relaxed">
                    "{progress.carry_seeds[session.n - 1]}"
                  </p>
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/70 mb-8">
                <span>{session.master}</span>
                <span>·</span>
                <span>{session.estMinutes} min</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase("sitting")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className="px-10 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
              >
                Begin the sitting
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── SITTING (steps) ─── */}
        {phase === "sitting" && session && plannedSteps[stepIndex] && (
          <>
            <SittingStepCard
              key={`step-${session.n}-${stepIndex}`}
              step={plannedSteps[stepIndex]}
              sessionN={session.n}
              sessionId={session.id}
              index={stepIndex}
              total={plannedSteps.length}
              canBack={stepIndex > 0}
              onAnswer={answerQuestion}
              onNext={handleStepNext}
              onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
            />
            {/* The Dock — chat as a property of every step, not a step itself */}
            <TheDock
              key="dock"
              userId={userId}
              session={session}
              step={dockStep}
              typedWords={typedWords}
              onKeptChange={handleDockKeep}
            />
          </>
        )}

        {/* ─── CLOSE ─── */}
        {phase === "close" && session && (
          <motion.div
            key={`close-${session.n}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-[100dvh] flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md text-center">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-6">
                Sitting {session.n} complete
              </p>

              <h2 className="font-display text-2xl text-foreground leading-snug mb-6">
                Carry this into tomorrow.
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="rounded-2xl border border-primary/30 bg-primary/[0.06] px-5 py-4 mb-8"
              >
                <p className="font-display italic text-foreground/90 text-[15px] leading-relaxed">
                  "{session.carrySeed}"
                </p>
              </motion.div>

              {FIRST_ELEVEN_SESSION_BY_N(session.n + 1) && (
                <p className="text-[12px] text-muted-foreground/70 italic mb-8">
                  Next: {FIRST_ELEVEN_SESSION_BY_N(session.n + 1)!.title}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={enterNextSitting}
                className="px-10 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
              >
                Continue →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── ALL ELEVEN COMPLETE — THE MIRROR ─── */}
        {phase === "complete" && (
          <TheMirror
            key="complete"
            mapping={mapping}
            ctaLabel="Understand the spiral →"
            onDone={onOpenJourneys ?? onComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
