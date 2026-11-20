import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { InquiryScreen } from "../widgets";

export function SelfInquiryStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  const config = (currentStep.config ?? currentStep.params ?? {}) as Record<string, unknown>;
  const question = config.question ?? currentStep.prompt ?? "Who is noticing this?";

  return (
    <StepFrame
      kind="self_inquiry"
      title={currentStep.title}
      prompt={undefined}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={<span />}
      hideSkip
    >
      <InquiryScreen
        question={question}
        durationSeconds={config.durationSeconds ?? 60}
        contemplationSeconds={config.contemplationSeconds ?? 60}
        allowReflection={config.allowReflection ?? true}
        reflectionPrompt={config.reflectionPrompt}
        showTimer={config.showTimer ?? true}
        onComplete={(p) => goToNext({ reflected: p.reflected, response: p.response, durationSec: p.durationSec })}
      />
    </StepFrame>
  );
}
