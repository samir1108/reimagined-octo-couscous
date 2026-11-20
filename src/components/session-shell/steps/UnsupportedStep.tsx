import React from "react";
import { StepFrame } from "@/components/session-shell/steps/StepFrame";
import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { AlertTriangle } from "lucide-react";
import type { StepKind } from "@/lib/session-shell/types";

interface UnsupportedStepProps {
  kind: StepKind;
}

export function UnsupportedStep({ kind }: UnsupportedStepProps) {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const isDev = import.meta.env.DEV;

  React.useEffect(() => {
    if (isDev) {
      console.error(`[SessionShell] No renderer registered for step kind: "${kind}"`, {
        step: currentStep,
      });
    }
  }, [kind, currentStep, isDev]);

  return (
    <StepFrame
      kind={kind as Record<string, unknown>}
      title={currentStep?.title ?? "Unsupported Step"}
      prompt={isDev ? `No renderer registered for step kind: "${kind}"` : "This step is not yet available."}
      optional={currentStep?.optional}
      onSkip={skipCurrent}
      ctas={
        <Button onClick={() => goToNext({ unsupported: true })} className="rounded-full px-6">
          Skip
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          {isDev
            ? `Step kind "${kind}" has no registered renderer. Register it in src/lib/session-shell/stepRegistry.ts`
            : "This experience is coming soon."}
        </p>
      </div>
    </StepFrame>
  );
}
