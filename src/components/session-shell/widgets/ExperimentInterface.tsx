import { useState } from "react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";

interface ExperimentStep {
  instruction: string;
  durationSeconds: number;
  prompt?: string;
  inputType?: "none" | "text" | "selection" | "rating";
  inputConfig?: Record<string, unknown>;
}

interface ExperimentInterfaceProps {
  durationSeconds?: number;
  instruction?: string;
  steps?: ExperimentStep[];
  showTimer?: boolean;
  onComplete?: (payload: { completedSteps: number; responses: unknown[] }) => void;
}

export function ExperimentInterface({
  durationSeconds = 120,
  instruction,
  steps = [],
  showTimer = true,
  onComplete,
}: ExperimentInterfaceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<unknown[]>([]);
  const [textValue, setTextValue] = useState("");
  const [completedCount, setCompletedCount] = useState(0);

  const totalSteps = steps.length || 1;
  const step = steps[currentStep];

  function handleNext(response?: unknown) {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    setCompletedCount((c) => c + 1);
    setTextValue("");

    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onComplete?.({ completedSteps: completedCount + 1, responses: newResponses });
    }
  }

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-center text-muted-foreground">{instruction ?? "Follow the instructions."}</p>
        <Button onClick={() => onComplete?.({ completedSteps: 1, responses: [] })} className="rounded-full px-6">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        {showTimer && <span>{step?.durationSeconds ?? 0}s</span>}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/40 p-4">
        <p className="text-sm leading-relaxed">{step?.instruction}</p>
        {step?.prompt && (
          <p className="mt-2 text-xs italic text-muted-foreground">{step.prompt}</p>
        )}
      </div>

      {step?.inputType === "text" && (
        <Textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Write your observation..."
          className="min-h-[80px] rounded-2xl border-border/40 bg-background/40"
        />
      )}

      {step?.inputType === "selection" && (
        <div className="flex flex-wrap gap-2">
          {(step.inputConfig?.options as string[] ?? []).map((opt) => (
            <button
              key={opt}
              onClick={() => handleNext(opt)}
              className="rounded-full border border-border/40 bg-background/40 px-4 py-2 text-sm transition hover:bg-background/60"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {step?.inputType === "rating" && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            value={textValue || "5"}
            onChange={(e) => setTextValue(e.target.value)}
            className="flex-1"
          />
          <span className="tabular-nums">{textValue || "5"}</span>
        </div>
      )}

      {(step?.inputType === "none" || !step?.inputType) && (
        <Button onClick={() => handleNext()} className="rounded-full px-6">
          {currentStep < totalSteps - 1 ? "Next" : "Complete"}
        </Button>
      )}

      {(step?.inputType === "text" || step?.inputType === "rating") && (
        <div className="flex justify-end">
          <Button
            onClick={() => handleNext(step?.inputType === "rating" ? Number(textValue) : textValue)}
            className="rounded-full px-6"
          >
            {currentStep < totalSteps - 1 ? "Next" : "Complete"}
          </Button>
        </div>
      )}
    </div>
  );
}
