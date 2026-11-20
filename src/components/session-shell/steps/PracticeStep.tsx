import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { getStepWidget } from "@/lib/session-shell/widgets/catalog";
import { StepWidget } from "../widgets/StepWidget";
import { StepFrame } from "./StepFrame";

/** Lightweight in-shell practice timer, or a catalog widget when one is named. */
export function PracticeStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const params = (currentStep?.params ?? {}) as Record<string, unknown>;
  const widgetDefinition = getStepWidget(
    typeof params.widgetId === "string" ? params.widgetId : undefined,
  );
  const totalSec = Number(params.durationSeconds) || 180;
  const hasExplicitDuration = Number(params.durationSeconds) > 0;
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(true);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running || widgetDefinition) return;
    ref.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, widgetDefinition?.id]);

  if (!currentStep) return null;

  if (widgetDefinition) {
    const overrides = {
      ...((params.config as Record<string, unknown> | undefined) ?? {}),
      ...(hasExplicitDuration ? { durationSeconds: totalSec } : {}),
    };
    return (
      <StepWidget
        definition={widgetDefinition}
        title={currentStep.title}
        prompt={currentStep.prompt}
        whyForYou={currentStep.whyForYou}
        overrides={overrides}
        onComplete={(result) =>
          goToNext({ ...result.data, widgetId: result.widgetId, widgetEngine: result.engine, summary: result.summary })
        }
        onSkip={skipCurrent}
      />
    );
  }

  const done = remaining === 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = 1 - remaining / totalSec;

  return (
    <StepFrame
      kind="practice"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          disabled={!done}
          onClick={() => goToNext({ durationSec: totalSec })}
          className="rounded-full px-6"
        >
          {done ? "Continue" : "Practicing…"}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="text-7xl font-extralight tabular-nums tracking-tight">{mm}:{ss}</div>
        <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-border/30">
          <div className="h-full bg-gradient-to-r from-fuchsia-400/70 to-rose-400/70 transition-all duration-1000" style={{ width: `${pct * 100}%` }} />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRunning((r) => !r)}
          className="text-muted-foreground"
        >
          {running ? "Pause" : "Resume"}
        </Button>
      </div>
    </StepFrame>
  );
}
