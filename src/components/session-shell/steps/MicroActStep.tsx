import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";
import { Check } from "lucide-react";

export function MicroActStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  if (!currentStep) return null;
  return (
    <StepFrame
      kind="micro-act"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button onClick={() => goToNext()} className="rounded-full px-6">
          <Check className="mr-2 h-4 w-4" /> I did it
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Check className="h-7 w-7 text-primary/80" />
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          One small physical action. Do it now, not later.
        </p>
      </div>
    </StepFrame>
  );
}
