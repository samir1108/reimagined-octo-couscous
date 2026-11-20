import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, TaiChiSpec } from "./types";

const DEFAULT_PHASES = ["Root", "Yield", "Ward off", "Roll back", "Press", "Push"];
const PHASE_INSTRUCTIONS: Record<string, string> = {
  Root: "Stand rooted. Weight even. Sink into the earth.",
  Yield: "Soft knees. Release tension. Let the body lead.",
  "Ward off": "Open the chest. Ward off with the palm. No force.",
  "Roll back": "Shift weight back. Let the arms follow the body.",
  Press: "Press forward. Palm open. Energy extends.",
  Push: "Push. Palm faces forward. Weight shifts. Empty the other side.",
};

export function TaiChiWidget({ spec, onComplete, onSkip, done }: WidgetProps<TaiChiSpec>) {
  const total = spec.duration ?? 300;
  const phases = spec.phases ?? DEFAULT_PHASES;
  const instructions = spec.instructions ?? [];
  const [remaining, setRemaining] = useState(total);
  const [phaseIndex, setPhaseIndex] = useState(0);
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
        const newIndex = Math.min(Math.floor(elapsed / phaseDuration), phases.length - 1);
        setPhaseIndex(newIndex);
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
        kind: "tai_chi",
        data: { phases: phases.slice(0, phaseIndex + 1), durationSec: total },
        summary: `Tai Chi · ${phases.length} movements · ${total}s`,
      });
    }
  }, [remaining, total, phaseIndex, phases, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentPhase = phases[Math.min(phaseIndex, phases.length - 1)];
  const phaseInstruction = instructions[Math.min(phaseIndex, instructions.length - 1)] || PHASE_INSTRUCTIONS[currentPhase] || "Move slowly. Follow the breath.";

  return (
    <>
      <WidgetShell
        icon={<Activity className="h-3.5 w-3.5" />}
        title={spec.title || "Tai Chi"}
        prompt={spec.prompt || "Slow, flowing movement. One posture at a time."}
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

          {/* Phase name */}
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {currentPhase}
          </p>

          {/* Instruction */}
          <p className="text-center text-sm text-foreground/80 italic leading-relaxed max-w-xs">
            {phaseInstruction}
          </p>

          {/* Timer */}
          <div className="text-3xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>

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
        title={spec.title || "Tai Chi"}
        prompt={spec.prompt || "Slow, flowing movement."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-base text-foreground/80 italic max-w-sm">
            {currentPhase}
          </p>
          <p className="text-center text-sm text-foreground/70 max-w-xs leading-relaxed">
            {phaseInstruction}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
