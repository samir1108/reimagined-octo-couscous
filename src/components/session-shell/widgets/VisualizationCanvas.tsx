import { useEffect, useState } from "react";
import { Button } from "@/design-system";

interface VisualizationStep {
  text: string;
  durationSeconds: number;
  pauseAfter?: boolean;
}

interface VisualizationCanvasProps {
  durationSeconds?: number;
  script?: VisualizationStep[];
  prompt?: string;
  showTimer?: boolean;
  background?: "black" | "starfield" | "guru-bg" | "gradient";
  onComplete?: (payload: { completed: boolean; durationSec: number }) => void;
}

export function VisualizationCanvas({
  durationSeconds = 120,
  script,
  prompt,
  showTimer = true,
  background = "black",
  onComplete,
}: VisualizationCanvasProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(script?.[0]?.durationSeconds ?? durationSeconds);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const steps = script ?? [{ text: prompt ?? "Close your eyes and visualize.", durationSeconds }];

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          const nextIndex = currentStepIndex + 1;
          if (nextIndex < steps.length) {
            setCurrentStepIndex(nextIndex);
            setRemaining(steps[nextIndex].durationSeconds);
            setTotalElapsed((e) => e + steps[currentStepIndex].durationSeconds);
            return steps[nextIndex].durationSeconds;
          }
          setDone(true);
          if (window) {
            // notify completion
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [currentStepIndex, done, steps]);

  const currentStep = steps[currentStepIndex];
  const totalDuration = steps.reduce((s, x) => s + x.durationSeconds, 0);
  const pct = totalDuration > 0 ? totalElapsed / totalDuration : 0;

  const bgClasses: Record<string, string> = {
    black: "bg-black",
    starfield: "bg-gradient-to-b from-indigo-950 via-purple-950 to-black",
    "guru-bg": "bg-gradient-to-b from-amber-950/80 via-orange-950/60 to-black",
    gradient: "bg-gradient-to-br from-violet-900/60 via-indigo-900/40 to-black",
  };

  return (
    <div className={`flex flex-col items-center gap-6 rounded-2xl p-6 ${bgClasses[background]}`}>
      {showTimer && !done && (
        <div className="text-3xl font-light tabular-nums text-white/70">
          {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
        </div>
      )}

      <div className="flex min-h-[120px] items-center justify-center">
        <p className="text-center text-lg leading-relaxed text-white/90">
          {done ? "The visualization is complete." : currentStep?.text}
        </p>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-white/40 transition-all duration-1000"
          style={{ width: `${Math.min(100, pct * 100)}%` }}
        />
      </div>

      {done && (
        <Button
          onClick={() => onComplete?.({ completed: true, durationSec: totalDuration })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      )}
    </div>
  );
}
