import { useEffect, useRef, useState } from "react";
import { Footprints } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, WalkingSpec } from "./types";

const DEFAULT_WALKING_PHASES = ["stand", "lift", "step", "land", "stand"];
const WALKING_PHASE_PROMPTS: Record<string, string> = {
  stand: "Stand still. Feel your weight. Both feet.",
  lift: "Lift one foot slowly. Notice the intention to move.",
  step: "Step forward. Feel the whole foot make contact.",
  land: "Feel the landing. The heel. The ball. The toes.",
};

export function WalkingWidget({ spec, onComplete, onSkip, done }: WidgetProps<WalkingSpec>) {
  const total = spec.duration ?? 300;
  const phases = spec.phases ?? DEFAULT_WALKING_PHASES;
  const [remaining, setRemaining] = useState(total);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const phaseDuration = Math.max(5, Math.floor(total / phases.length));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = total - next;
        const newPhaseIndex = Math.min(Math.floor(elapsed / phaseDuration), phases.length - 1);
        setPhaseIndex(newPhaseIndex);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, phaseDuration, phases.length]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "walking",
        data: { steps: stepCount, durationSec: total, pace: spec.pace },
        summary: `Walking · ${stepCount} steps · ${total}s`,
      });
    }
  }, [remaining, total, stepCount, spec.pace, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentPhase = phases[Math.min(phaseIndex, phases.length - 1)];
  const phasePrompt = WALKING_PHASE_PROMPTS[currentPhase] || "Walk slowly. Notice the movement.";

  return (
    <>
      <WidgetShell
        icon={<Footprints className="h-3.5 w-3.5" />}
        title={spec.title || "Walking Meditation"}
        prompt={spec.prompt || "Walk very slowly. Feel each phase of the step."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Phase dots */}
          <div className="flex items-center gap-1.5">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= phaseIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

          <p className="text-center text-sm text-foreground/80 italic leading-relaxed max-w-xs">
            {phasePrompt}
          </p>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-extralight tabular-nums text-foreground/80 tracking-wide">
              {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
            </div>
            {spec.stepCountGoal && (
              <div className="text-xs text-muted-foreground">
                {stepCount} / {spec.stepCountGoal}
              </div>
            )}
          </div>

          {!isDone && (
            <button
              type="button"
              onClick={() => setStepCount((c) => c + 1)}
              className="rounded-full border border-border/50 bg-background/40 px-5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground/80 hover:bg-background/60 transition"
            >
              Step · {stepCount}
            </button>
          )}

          {!isDone && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setImmersive(true)} className="text-xs text-muted-foreground">
                Immerse
              </Button>
              <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
                Skip
              </Button>
            </div>
          )}
        </div>
      </WidgetShell>

      <ImmersivePractice
        open={immersive}
        title={spec.title || "Walking Meditation"}
        prompt={spec.prompt || "Walk slowly. Feel each phase."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-base text-foreground/80 italic max-w-sm leading-relaxed">
            {phasePrompt}
          </p>
          <div className="flex items-center gap-1.5">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= phaseIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
