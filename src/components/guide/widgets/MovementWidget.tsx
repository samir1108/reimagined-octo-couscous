import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, MovementSpec } from "./types";

export function MovementWidget({ spec, onComplete, onSkip, done }: WidgetProps<MovementSpec>) {
  const total = spec.duration ?? 120;
  const instructions = spec.instructions ?? ["Move slowly. Follow the guidance."];
  const repetitions = spec.repetitions ?? 1;
  const [remaining, setRemaining] = useState(total);
  const [currentRep, setCurrentRep] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0 && currentRep < repetitions - 1) {
          setCurrentRep((rep) => rep + 1);
        }
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, repetitions, currentRep]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "movement",
        data: { repsCompleted: currentRep + 1, durationSec: total, instructions },
        summary: `Movement · ${currentRep + 1}/${repetitions} · ${total}s`,
      });
    }
  }, [remaining, currentRep, repetitions, total, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentInstruction = instructions[Math.min(currentRep, instructions.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Activity className="h-3.5 w-3.5" />}
        title={spec.title || "Movement"}
        prompt={spec.prompt || currentInstruction}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {repetitions > 1 && (
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Rep {currentRep + 1} / {repetitions}
            </div>
          )}

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
        title={spec.title || "Movement"}
        prompt={spec.prompt || currentInstruction}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-center text-sm text-foreground/80 max-w-xs leading-relaxed">
            {currentInstruction}
          </p>
          {repetitions > 1 && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Rep {currentRep + 1} / {repetitions}
            </p>
          )}
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
