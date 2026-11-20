import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { SelectionCards } from "../widgets";
import { RatingSlider } from "../widgets";
import { ObservationScreen } from "../widgets";

export function SelectionStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="selection"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <SelectionCards
        options={config.options ?? []}
        allowMultiple={config.allowMultiple ?? false}
        prompt={config.prompt}
        showAsCards={config.showAsCards ?? true}
        onComplete={(p) => goToNext({ selection: p.selection })}
      />
    </StepFrame>
  );
}

export function RatingStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="rating"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <RatingSlider
        min={config.min ?? 0}
        max={config.max ?? 10}
        step={config.step ?? 1}
        labels={config.labels}
        prompt={config.prompt}
        showValue={config.showValue ?? true}
        onComplete={(p) => goToNext({ value: p.value })}
      />
    </StepFrame>
  );
}

export function NoticingStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;

  return (
    <StepFrame
      kind="noticing"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <ObservationScreen
        durationSeconds={config.durationSeconds ?? 120}
        focus={config.focus ?? "open"}
        allowLogging={config.allowLogging ?? true}
        categories={config.categories}
        showTimer={config.showTimer ?? true}
        showCounter={config.showCounter ?? true}
        onComplete={(p) => goToNext({ count: p.count, durationSec: p.durationSec, categories: p.categories })}
      />
    </StepFrame>
  );
}
