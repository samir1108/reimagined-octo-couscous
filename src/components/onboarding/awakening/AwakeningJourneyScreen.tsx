/**
 * AwakeningJourneyScreen — runner for THE AWAKENING JOURNEY.
 * ─────────────────────────────────
 * Eleven sessions from automatic living to conscious action:
 *
 *   opening    → the journey's promise + what the user wants from it
 *   threshold  → the session's question, the last carry-seed, the vow check
 *   sitting    → the beats (arrival · observation · investigation · practice ·
 *                application · reflection), filled adaptively per user
 *   close      → what happened, the vow, the carry-seed, the sharpened map,
 *                and what comes next — with the reason it was chosen
 *   complete   → the development report
 *
 * Local-first progress (useAwakening); The Dock rides along every beat.
 */
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import AwakeningStepCard from "./AwakeningStepCard";
import DevelopmentMapCard from "./DevelopmentMapCard";
import NextStepCard from "./NextStepCard";
import TheReport from "./TheReport";
import TheDock from "../firstEleven/TheDock";
import { useAwakening } from "@/hooks/useAwakening";
import { usePublishAwakening } from "@/hooks/usePublishAwakening";
import {
  AWAKENING_SESSION_BY_ID,
  AWAKENING_TOTAL,
  planSession,
  recommendNext,
  buildReport,
  loopsFromAnswers,
  type AwakeningAnswer,
} from "@/lib/onboarding/awakening";

type Phase = "opening" | "threshold" | "sitting" | "close" | "complete";

interface Props {
  userId: string;
  userName?: string;
  onDone: () => void;
  onExit: () => void;
}

const VOW_OPTIONS: { id: "kept" | "partly" | "not_yet"; label: string; hint: string }[] = [
  { id: "kept", label: "Yes — it happened", hint: "Recorded honestly, either way." },
  { id: "partly", label: "Partly — some of it", hint: "A partial vow kept is still data." },
  { id: "not_yet", label: "Not yet", hint: "The vow stands; nothing is lost." },
];

export default function AwakeningJourneyScreen({ userId, userName, onDone, onExit }: Props) {
  const navigate = useNavigate();
  const {
    progress, map, loading, nextSession, nextPosition, answerQuestion, completeSession,
    recordVowResult, setGoal,
  } = useAwakening(userId);

  const allDone = progress.completed_session_ids.length >= AWAKENING_TOTAL;
  const [phase, setPhase] = useState<Phase>(allDone ? "complete" : "opening");
  const [sessionId, setSessionId] = useState<string>(nextSession?.id ?? "meet_the_observer");
  const [stepIndex, setStepIndex] = useState(0);
  const [closedPosition, setClosedPosition] = useState(0);
  const [goalDraft, setGoalDraft] = useState("");

  const session = AWAKENING_SESSION_BY_ID(sessionId);
  const position = nextPosition || (session ? session.n : 1);

  // Publish the capability map once the journey is complete.
  usePublishAwakening(userId, map, progress, allDone);

  // ── adaptive plan for this session ──
  const plannedSteps = useMemo(() => {
    if (!session) return [];
    const askedIds = new Set(progress.answers.map((a) => a.questionId));
    return planSession(session, {
      askedIds,
      map,
      activeLoops: loopsFromAnswers(progress.answers).map((l) => l.id),
      seed: userId,
    });
  }, [session, progress.answers, map, userId]);

  // The user's written words this session — seeds the Dock's guide context.
  const typedWords = useMemo(
    () =>
      progress.answers
        .filter((a) => a.sessionId === session?.id && typeof a.value === "string" && String(a.value).length > 3)
        .map((a) => String(a.value))
        .slice(-6),
    [progress.answers, session?.id]
  );

  // Kept dock lines sharpen the map like any reflective answer.
  const handleDockKeep = useCallback(
    (lines: string[]) => {
      if (!lines.length || !session) return;
      answerQuestion({
        questionId: `aw_${session.id}_dock`,
        sessionId: session.id,
        beat: "reflection",
        value: lines.join(" · "),
        capabilities: { reflection: 6, awareness: 5 },
        evidence: "self_reported",
      });
    },
    [answerQuestion, session]
  );

  const dockStep = useMemo(() => {
    const step = plannedSteps[stepIndex];
    if (!step) return null;
    if (step.kind === "question") {
      return {
        kind: "question",
        label: step.question.title,
        subtitle: step.question.subtitle,
        rolePhrase: `the ${step.beat} question`,
      };
    }
    if (step.kind === "practice") {
      return {
        kind: step.practice.kind,
        label: step.practice.title,
        body: step.practice.instruction,
        seconds: step.practice.seconds,
        pattern: step.practice.pattern,
        rounds: step.practice.rounds,
      };
    }
    return { kind: "application", label: step.experiment.title, body: step.experiment.body };
  }, [plannedSteps, stepIndex]);

  const handleStepNext = useCallback(() => {
    if (!session) return;
    if (stepIndex + 1 < plannedSteps.length) {
      setStepIndex((i) => i + 1);
      return;
    }
    setClosedPosition(position);
    completeSession(session, vowFor(progress.answers, session.id));
    setPhase(allDone ? "complete" : "close");
  }, [session, stepIndex, plannedSteps.length, completeSession, progress.answers, allDone, position]);

  const enterNextSession = useCallback(() => {
    if (!nextSession) {
      setPhase("complete");
      return;
    }
    setSessionId(nextSession.id);
    setStepIndex(0);
    setPhase("threshold");
  }, [nextSession]);

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

  const report = allDone && session ? buildReport(progress, map) : null;
  const recommendation = allDone ? null : recommendNext(progress, map);

  // The vow the session just closed on — read back from the user's own words.
  const justClosedVow = session ? progress.vows[session.id] : undefined;

  return (
    <div className="relative min-h-[100dvh] bg-background">
      <button
        onClick={onExit}
        aria-label="Leave the journey"
        className="fixed top-4 right-4 z-30 h-9 w-9 grid place-items-center rounded-full border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60 transition"
      >
        ×
      </button>

      <AnimatePresence mode="wait">
        {/* ─── OPENING ─── */}
        {phase === "opening" && (
          <motion.div
            key="opening"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-[100dvh] flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-6 text-center font-display">
                The awakening journey
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground text-center leading-tight mb-6">
                You have spent years experiencing your life.
              </h1>
              <p className="text-[14.5px] text-muted-foreground leading-relaxed mb-8 text-center">
                Now begin exploring how you experience it. Over the next {AWAKENING_TOTAL} sessions you
                will investigate your attention, emotions, habits, motivations, and actions.
                <br /><br />
                You will not be asked to become someone else. You will learn to see yourself more
                clearly — and use what you discover.
              </p>

              <label className="block text-[11px] text-muted-foreground/80 italic mb-2">
                What do you want from these {AWAKENING_TOTAL} sessions? (One line. Optional.)
              </label>
              <input
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value.slice(0, 140))}
                onBlur={() => setGoal(goalDraft.trim() || null)}
                placeholder="e.g. understand why I keep avoiding what matters"
                className="w-full px-4 py-3 rounded-2xl bg-card/40 border border-border/30 focus:border-primary/60 focus:outline-none text-foreground text-[15px] mb-8"
              />

              <div className="flex flex-col items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setGoal(goalDraft.trim() || null);
                    setPhase("threshold");
                  }}
                  className="px-10 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
                >
                  Begin your journey
                </motion.button>
                <p className="text-[11px] text-muted-foreground/70">
                  {AWAKENING_TOTAL} sessions · about 8 minutes each · yours to leave any time
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── THRESHOLD ─── */}
        {phase === "threshold" && session && (
          <motion.div
            key={`threshold-${session.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="min-h-[100dvh] flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 mb-6 text-center">
                Session {position} of {AWAKENING_TOTAL}
                {userName ? ` · for ${userName}` : ""}
              </p>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8 }}
                className="font-display text-3xl sm:text-4xl text-foreground text-center leading-tight mb-4"
              >
                {session.title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="font-display italic text-primary/85 text-base text-center leading-relaxed mb-8"
              >
                {session.question}
              </motion.p>

              {/* The vow ledger — ask about last session's vow before anything else */}
              {previousVowCheck(session, progress).pending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.9 }}
                  className="rounded-2xl border border-border/30 bg-card/40 px-4 py-3 mb-6 text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
                    Last time you said
                  </p>
                  <p className="text-[13px] text-foreground/85 italic font-display leading-relaxed mb-3">
                    "{previousVowCheck(session, progress).vow}"
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {VOW_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          recordVowResult(previousVowCheck(session, progress).sessionId!, opt.id)
                        }
                        className="px-3 py-1.5 rounded-full border border-border/40 text-[11.5px] font-display text-muted-foreground hover:text-foreground hover:border-primary/50 transition"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* The carry-seed from the previous session */}
              {progress.carry_seeds[previousSessionId(progress)] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.9 }}
                  className="rounded-2xl border border-border/30 bg-card/40 px-4 py-3 mb-6 text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
                    You left with this
                  </p>
                  <p className="text-[13px] text-foreground/85 italic font-display leading-relaxed">
                    "{progress.carry_seeds[previousSessionId(progress)]}"
                  </p>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85, duration: 0.9 }}
                className="text-[14px] text-muted-foreground leading-relaxed mb-8"
              >
                {session.essence}
              </motion.p>

              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/70 mb-8">
                <span>{session.master}</span>
                <span>·</span>
                <span>~{session.estMinutes} min</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setPhase("sitting")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="block mx-auto px-10 py-3.5 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
              >
                Begin the session
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── SITTING (beats) ─── */}
        {phase === "sitting" && session && plannedSteps[stepIndex] && (
          <>
            <AwakeningStepCard
              key={`step-${session.id}-${stepIndex}`}
              step={plannedSteps[stepIndex]}
              session={session}
              index={stepIndex}
              total={plannedSteps.length}
              canBack={stepIndex > 0}
              onAnswer={answerQuestion}
              onNext={handleStepNext}
              onBack={() => setStepIndex((i) => Math.max(0, i - 1))}
            />
            <TheDock
              key="dock"
              userId={userId}
              session={session}
              step={dockStep}
              typedWords={typedWords}
              onKeptChange={handleDockKeep}
              journeyLabel="THE AWAKENING JOURNEY"
              stepLabel="SESSION"
            />
          </>
        )}

        {/* ─── CLOSE ─── */}
        {phase === "close" && session && recommendation && (
          <motion.div
            key={`close-${session.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="min-h-[100dvh] flex items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.32em] text-primary/80 mb-5 text-center">
                Session {closedPosition || position} complete
              </p>

              <h2 className="font-display text-2xl text-foreground text-center leading-snug mb-5">
                What you found
              </h2>
              <p className="text-[14px] text-muted-foreground leading-relaxed text-center mb-6">
                {session.discovery}
              </p>

              {justClosedVow && (
                <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] px-4 py-3 mb-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
                    Your vow
                  </p>
                  <p className="text-[13.5px] text-foreground/90 font-display italic leading-relaxed">
                    "{justClosedVow}"
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-border/30 bg-card/40 px-4 py-3 mb-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary/70 mb-1">
                  Carry this into tomorrow
                </p>
                <p className="text-[13.5px] text-foreground/90 font-display italic leading-relaxed">
                  "{session.carrySeed}"
                </p>
              </div>

              <div className="mb-5">
                <DevelopmentMapCard map={map} compact />
              </div>

              <NextStepCard
                recommendation={recommendation}
                onBegin={enterNextSession}
                ctaLabel={`Begin session ${(closedPosition || position) + 1}`}
              />

              <div className="flex justify-center mt-5">
                <button
                  onClick={onDone}
                  className="text-[12px] text-muted-foreground/70 hover:text-foreground transition font-display"
                >
                  Continue later
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── COMPLETE — THE REPORT ─── */}
        {phase === "complete" && report && (
          <TheReport
            key="report"
            report={report}
            map={map}
            onOpenPath={(slug) => navigate(`/app/journeys?path=${slug}`)}
            onDone={onDone}
          />
        )}

        {/* Resume screens that only need the report */}
        {phase === "complete" && !report && allDone && (
          <div className="min-h-[100dvh] flex items-center justify-center px-6">
            <div className="text-center">
              <Check className="h-10 w-10 text-primary mx-auto mb-4" />
              <p className="font-display text-lg text-foreground mb-4">The journey is complete.</p>
              <button
                onClick={onDone}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-display tracking-wide hover:bg-primary/90 transition"
              >
                Continue into the app
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────

function vowFor(answers: AwakeningAnswer[], sessionId: string): string {
  const vow = answers.find((a) => a.questionId === `${sessionId}_vow`);
  return vow && typeof vow.value === "string" ? vow.value : "";
}

/** The session completed just before the given one, in canonical order. */
function previousSessionId(progress: { completed_session_ids: string[] }): string {
  const completed = progress.completed_session_ids;
  return completed.length ? completed[completed.length - 1] : "";
}

/**
 * If the previously completed session has a vow that was never checked on,
 * the current threshold asks about it first — the vow ledger.
 */
function previousVowCheck(
  session: { id: string },
  progress: { completed_session_ids: string[]; vows: Record<string, string>; vow_results: Record<string, string> }
): { pending: boolean; vow: string; sessionId: string | null } {
  const prevId = previousSessionId(progress);
  if (!prevId || prevId === session.id) return { pending: false, vow: "", sessionId: null };
  const vow = progress.vows[prevId];
  const result = progress.vow_results[prevId];
  if (!vow || result) return { pending: false, vow: "", sessionId: null };
  return { pending: true, vow, sessionId: prevId };
}
