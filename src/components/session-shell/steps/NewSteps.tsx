import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { EmotionWheel, BreathHoldTimer, IntentionSetter } from "../widgets";

export function EmotionCheckStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  return (
    <StepFrame
      kind="emotion_check"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <EmotionWheel
        emotions={(config.emotions as string[]) ?? undefined}
        allowIntensity={(config.allowIntensity as boolean) ?? true}
        prompt={config.prompt as string}
        onComplete={(p) => goToNext({ emotion: p.emotion, intensity: p.intensity })}
      />
    </StepFrame>
  );
}

export function BreathHoldStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  return (
    <StepFrame
      kind="breath_hold"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <BreathHoldTimer
        rounds={(config.rounds as number) ?? 4}
        inhaleSeconds={(config.inhaleSeconds as number) ?? 4}
        holdSeconds={(config.holdSeconds as number) ?? 4}
        exhaleSeconds={(config.exhaleSeconds as number) ?? 4}
        restSeconds={(config.restSeconds as number) ?? 2}
        onComplete={(p) => goToNext({ completedRounds: p.completedRounds })}
      />
    </StepFrame>
  );
}

export function IntentionSetStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  return (
    <StepFrame
      kind="intention_set"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <IntentionSetter
        prompt={(config.prompt as string) ?? currentStep.prompt}
        placeholder={(config.placeholder as string) ?? undefined}
        maxLength={(config.maxLength as number) ?? 200}
        onComplete={(p) => goToNext({ text: p.text })}
      />
    </StepFrame>
  );
}
