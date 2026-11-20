import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { useState } from "react";
import { StepFrame } from "./StepFrame";

interface StepOption {
  id: string;
  label: string;
}

export function ReflectionStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const [text, setText] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  if (!currentStep) return null;

  // Multiple-choice reflections (e.g. the First Eleven sittings) declare
  // options in params; everything else keeps the free-text reflection.
  const options = (currentStep.params as { options?: StepOption[] } | undefined)?.options ?? [];
  const isChoice = Array.isArray(options) && options.length > 0;
  const canContinue = isChoice ? !!choice : true;

  return (
    <StepFrame
      kind="reflection"
      title={currentStep.title}
      prompt={currentStep.prompt}
      whyForYou={currentStep.whyForYou}
      optional={currentStep.optional}
      onSkip={skipCurrent}
      ctas={
        <Button
          onClick={() =>
            goToNext(
              isChoice
                ? {
                    option: choice,
                    label: options.find((o) => o.id === choice)?.label ?? choice ?? "",
                    text: options.find((o) => o.id === choice)?.label ?? "",
                  }
                : { text }
            )
          }
          disabled={!canContinue}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      }
    >
      {isChoice ? (
        <div className="space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setChoice(opt.id)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                choice === opt.id
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/40 bg-background/40 hover:border-primary/40"
              }`}
            >
              <p className="font-display text-[15px] text-foreground">{opt.label}</p>
            </button>
          ))}
        </div>
      ) : (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A single honest line is enough…"
          className="min-h-[140px] resize-none rounded-2xl border-border/40 bg-background/40 text-base leading-relaxed"
        />
      )}
    </StepFrame>
  );
}
