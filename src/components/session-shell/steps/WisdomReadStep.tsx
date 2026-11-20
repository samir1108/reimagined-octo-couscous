import { useState } from "react";
import { Button } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { StepFrame } from "./StepFrame";

export function WisdomReadStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const [rereads, setRereads] = useState(0);
  if (!currentStep) return null;

  return (
    <StepFrame
      kind="wisdom-read"
      title={currentStep.title}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setRereads((n) => n + 1)}
            className="rounded-full px-4 text-sm"
          >
            Read it again
          </Button>
          <Button
            onClick={() => goToNext({ rereadCount: rereads })}
            className="rounded-full px-8"
          >
            I sat with it
          </Button>
        </div>
      }
    >
      <blockquote className="relative py-4 text-center">
        <span className="absolute -top-2 left-0 font-serif text-6xl leading-none text-primary/20">â€œ</span>
        <p className="font-serif text-2xl leading-relaxed sm:text-3xl">
          {currentStep.prompt}
        </p>
        <span className="absolute -bottom-6 right-0 font-serif text-6xl leading-none text-primary/20">â€</span>
      </blockquote>
      {rereads > 0 ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Read {rereads + 1} times
        </p>
      ) : null}
    </StepFrame>
  );
}
