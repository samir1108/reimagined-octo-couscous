import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { TimerWidget } from "../widgets";
import { Button } from "@/design-system";

export function SilentSitStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const duration = config.durationSeconds ?? 120;

  return (
    <StepFrame
      kind="silent_sit"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <TimerWidget
        durationSeconds={duration}
        showOrb={config.showOrb ?? true}
        showPhase={false}
        gentleBell={config.gentleBell ?? true}
        onComplete={(p) => goToNext({ durationSec: p.elapsedSeconds })}
      />
    </StepFrame>
  );
}

export function TimerStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const duration = config.durationSeconds ?? 60;

  return (
    <StepFrame
      kind="timer"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <TimerWidget
        durationSeconds={duration}
        mode={config.mode ?? "countdown"}
        showOrb={config.showOrb ?? false}
        showPhase={config.showPhase ?? false}
        phases={config.phases}
        autoStart={config.autoStart ?? false}
        gentleBell={config.gentleBell ?? true}
        onComplete={(p) => goToNext({ elapsedSeconds: p.elapsedSeconds })}
      />
    </StepFrame>
  );
}

export function ContemplationStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const duration = config.durationSeconds ?? 120;

  return (
    <StepFrame
      kind="contemplation"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <TimerWidget
        durationSeconds={duration}
        showOrb={true}
        showPhase={false}
        gentleBell={config.gentleBell ?? true}
        onComplete={(p) => goToNext({ durationSec: p.elapsedSeconds })}
      />
      {config.prompt && (
        <p className="mt-4 text-center text-sm italic text-muted-foreground">{config.prompt}</p>
      )}
    </StepFrame>
  );
}
