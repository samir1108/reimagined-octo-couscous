import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JournalStep } from "./steps/JournalStep";
import { WisdomReadStep } from "./steps/WisdomReadStep";
import { ReflectionStep } from "./steps/ReflectionStep";
import { BreathworkStep } from "./steps/BreathworkStep";
import { MicroActStep } from "./steps/MicroActStep";
import { WitnessStep } from "./steps/WitnessStep";
import { PracticeStep } from "./steps/PracticeStep";
import { GuideChatStep } from "./steps/GuideChatStep";
import { TempleChatStep } from "./steps/TempleChatStep";
import { GenericPlaceholderStep } from "./steps/GenericPlaceholderStep";
import { AgendaCard } from "./AgendaCard";
import { AmbientLayer } from "./AmbientLayer";
import { CinematicStage } from "./CinematicStage";
import { SessionCompleteScreen } from "./SessionCompleteScreen";
import StepKindIntro from "./StepKindIntro";
import { SessionProgressRail } from "./SessionProgressRail";
import { StepTransition } from "./StepTransition";
import { pickKeystoneIndex } from "./stepRevolution";
import { completeGenerativeSession } from "@/lib/session-shell/api";
import { getCurrentTimeSlot } from "@/lib/timeSlots";
import { toast } from "sonner";
import { X } from "lucide-react";
import type { SessionCompleteResult, StepKind } from "@/lib/session-shell/types";
import { useAudioContext } from "@/contexts/SoundContext";

function StepRenderer() {
  const { currentStep } = useSessionShell();
  if (!currentStep) return null;
  const kind: StepKind = currentStep.kind;
  switch (kind) {
    case "journal": return <JournalStep />;
    case "wisdom-read": return <WisdomReadStep />;
    case "reflection": return <ReflectionStep />;
    case "breathwork": return <BreathworkStep />;
    case "micro-act": return <MicroActStep />;
    case "witness": return <WitnessStep />;
    case "practice": return <PracticeStep />;
    case "guide-chat": return <GuideChatStep />;
    case "temple-chat": return <TempleChatStep />;
    default: return <GenericPlaceholderStep />;
  }
}

export function UniversalSessionShell() {
  const {
    sessionId,
    plan,
    cursor,
    isAgenda,
    isFinished,
    completedSteps,
    skippedSteps,
    startedAtMs,
    pauseSession,
  } = useSessionShell();
  const navigate = useNavigate();
  const [ending, setEnding] = useState(false);
  const [result, setResult] = useState<SessionCompleteResult | null>(null);
  const closingRef = useRef(false);
  const getAudioContext = useAudioContext();
  const audioContext = getAudioContext?.();

  async function endNow(opts: { silent?: boolean } = {}) {
    if (closingRef.current) return;
    closingRef.current = true;
    setEnding(true);
    try {
      const res = await completeGenerativeSession({
        sessionId,
        completedSteps,
        totalSeconds: Math.round((Date.now() - startedAtMs) / 1000),
        plan,
      });
      setResult(res);
    } catch (e: any) {
      // Keep the sitting on the device so nothing is lost offline.
      try {
        const { data: auth } = await (await import("@/lib/supabase")).supabase.auth.getUser();
        const userId = auth?.user?.id;
        if (userId) {
          const { enqueueCompletion } = await import("@/lib/session/offlineQueue");
          enqueueCompletion({
            sessionId,
            userId,
            plan,
            completedSteps,
            totalSeconds: Math.round((Date.now() - startedAtMs) / 1000),
            gate: getCurrentTimeSlot(),
          });
        }
      } catch {
        /* queue is best-effort */
      }
      if (!opts.silent) toast.error(e?.message || "Could not close session");
      // Still surface the completion screen with local data so the user isn't trapped.
      setResult({
        ok: false,
        sessionId,
        completedStepCount: completedSteps.length,
        durationMs: Math.max(0, Date.now() - startedAtMs),
        loopsTouched: [],
        karmaEarned: 0,
        shiftSummary: null,
        nextTeaser: null,
        vLevelDelta: null,
        dimensionNudges: [],
      });
    } finally {
      setEnding(false);
    }
  }

  // Auto-finish when cursor passes the last step — in effect, NOT in render
  useEffect(() => {
    if (isFinished && !result && !closingRef.current) {
      void endNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Block accidental tab close mid-session
  useEffect(() => {
    if (result || isAgenda) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [result, isAgenda]);

  function handlePause() {
    if (ending) return;
    pauseSession();
    toast.success("Sitting kept. Resume it from Home.");
    navigate("/app");
  }

  function handleEndClick() {
    if (ending || closingRef.current) return;
    if (!isAgenda && completedSteps.length > 0) {
      const ok = window.confirm("End this session now? Your progress will be saved.");
      if (!ok) return;
    }
    void endNow();
  }

  if (result) {
    return (
      <SessionCompleteScreen
        result={result}
        completedSteps={completedSteps}
        onHome={() => navigate("/app")}
        onAnalytics={() => navigate("/app/analytics")}
      />
    );
  }

  const totalSteps = plan.steps.length;
  const stepNum = Math.min(Math.max(cursor, 0) + 1, totalSteps);
  const completedIndices = completedSteps
    .map((step) => step.stepIndex)
    .filter((index): index is number => typeof index === "number");
  const skippedIndices = skippedSteps
    .map((step) => step.stepIndex)
    .filter((index): index is number => typeof index === "number");
  const keystoneIndex = pickKeystoneIndex(plan.steps);

  return (
    <div className="dark fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <AmbientLayer audioContext={audioContext} />
      <CinematicStage kind={plan.steps[cursor]?.kind} slot={getCurrentTimeSlot()} />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-border/40 bg-background/60 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {plan._meta?.prescription
              ? `Spiral ${plan._meta.prescription.arc.sessionNumber}/${plan._meta.prescription.arc.totalSessions} · ${plan._meta.prescription.arc.spiralLabel}`
              : "Session"}
          </p>
          <p className="truncate text-sm font-medium">{plan.intent}</p>
          {plan._meta?.prescription && (
            <p className="truncate text-[10px] text-muted-foreground/70">
              {plan._meta.prescription.arc.phaseLabel} · Arc day {plan._meta.prescription.arc.arcDay}/
              {plan._meta.prescription.arc.arcLengthDays} · {plan._meta.prescription.dose.minutes} min ·{" "}
              {plan._meta.prescription.dose.intensity}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {isAgenda ? "Agenda" : `${stepNum} / ${totalSteps}`}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePause}
            disabled={ending || isAgenda}
            className="rounded-full"
          >
            Pause
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEndClick}
            disabled={ending}
            className="rounded-full"
          >
            <X className="mr-1 h-4 w-4" />
            End
          </Button>
        </div>
      </header>

      {/* Progress rail */}
      {!isAgenda && (
        <SessionProgressRail
          steps={plan.steps}
          cursor={cursor}
          completedIndices={completedIndices}
          skippedIndices={skippedIndices}
          keystoneIndex={keystoneIndex}
        />
      )}

      {/* Body */}
      <main className="relative z-10 flex-1 overflow-y-auto py-6">
        {isAgenda ? (
          <AgendaCard />
        ) : (
          <StepTransition stepKey={cursor}>
            <StepKindIntroForCurrent />
            <StepRenderer />
          </StepTransition>
        )}
      </main>
    </div>
  );
}

function StepKindIntroForCurrent() {
  const { currentStep } = useSessionShell();
  if (!currentStep) return null;
  return <StepKindIntro kind={currentStep.kind} />;
}
