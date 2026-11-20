import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps?: number[];
  skippedSteps?: number[];
  showNumbers?: boolean;
  showLabels?: boolean;
  labels?: string[];
}

export function ProgressIndicator({
  totalSteps,
  currentStep,
  completedSteps = [],
  skippedSteps = [],
  showNumbers = true,
  showLabels = false,
  labels = [],
}: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = completedSteps.includes(i) || i < currentStep;
        const isCurrent = i === currentStep;
        const isSkipped = skippedSteps.includes(i);
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={
                "flex h-2.5 items-center justify-center rounded-full transition-all " +
                (isCurrent
                  ? "w-6 bg-primary"
                  : isCompleted
                    ? "w-2.5 bg-primary/80"
                    : isSkipped
                      ? "w-2.5 bg-muted-foreground/40"
                      : "w-2.5 bg-muted")
              }
            >
              {isCompleted && !isCurrent && (
                <Check className="h-1.5 w-1.5 text-primary-foreground" />
              )}
            </span>
            {showLabels && labels[i] && (
              <span className="text-[8px] text-muted-foreground">{labels[i]}</span>
            )}
            {showNumbers && !showLabels && (
              <span className="text-[8px] text-muted-foreground">{i + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
