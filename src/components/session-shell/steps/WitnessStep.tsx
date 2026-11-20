import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { Eye } from "lucide-react";
import { StepFrame } from "./StepFrame";

/** Witness — silent observation. Tap to mark a noticed thought. */
export function WitnessStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const totalSec = Number((currentStep?.params as any)?.durationSeconds) || 120;
  const [remaining, setRemaining] = useState(totalSec);
  const [thoughts, setThoughts] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, []);

  if (!currentStep) return null;
  const done = remaining === 0;
  const pct = 1 - remaining / totalSec;

  return (
    <StepFrame
      kind="witness"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          disabled={!done}
          onClick={() => goToNext({ thoughts, durationSec: totalSec })}
          className="rounded-full px-6"
        >
          {done ? "Continue" : "Sit until the bell"}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/40" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="text-foreground/70 transition-all duration-1000"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - pct)}
              strokeLinecap="round"
            />
          </svg>
          <span className="text-4xl font-light tabular-nums">{remaining}<span className="text-sm text-muted-foreground">s</span></span>
        </div>
        <button
          onClick={() => setThoughts((t) => t + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-5 py-2 text-sm backdrop-blur transition hover:bg-background/60"
        >
          <Eye className="h-4 w-4" /> Noticed · <span className="tabular-nums">{thoughts}</span>
        </button>
      </div>
    </StepFrame>
  );
}
