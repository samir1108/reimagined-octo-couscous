import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { useEffect, useState } from "react";
import { StepFrame } from "./StepFrame";

export function BreathworkStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const total = Number((currentStep?.params as any)?.durationSeconds) || 60;
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  if (!currentStep) return null;
  const done = remaining <= 0;
  const phase = Math.floor((total - remaining) / 4) % 2 === 0 ? "Inhale" : "Exhale";

  return (
    <StepFrame
      kind="breathwork"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <>
          {!running && !done && (
            <Button onClick={() => setRunning(true)} className="rounded-full px-6">Begin</Button>
          )}
          {(running || done) && (
            <Button onClick={() => goToNext({ completedSeconds: total - remaining })} className="rounded-full px-6">
              {done ? "Continue" : "Done"}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center gap-6 py-4">
        
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {running && !done ? phase : done ? "Complete" : "Tap the orb to begin"}
          </p>
          <p className="mt-1 text-4xl font-light tabular-nums">{remaining}<span className="text-base text-muted-foreground">s</span></p>
        </div>
      </div>
    </StepFrame>
  );
}
