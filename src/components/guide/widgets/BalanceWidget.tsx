import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, BalanceSpec } from "./types";

export function BalanceWidget({ spec, onComplete, onSkip, done }: WidgetProps<BalanceSpec>) {
  const durationPerSide = spec.duration ?? 30;
  const sides = spec.sides ?? 2;
  const instructions = spec.instructions ?? ["Stand on one foot. Soften the knee. Find a still point.", "Switch sides."];
  const totalDuration = durationPerSide * sides;
  const [remaining, setRemaining] = useState(totalDuration);
  const [currentSide, setCurrentSide] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0 && currentSide < sides - 1) {
          setCurrentSide((s) => s + 1);
        }
        return next > 0 ? next : 0;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, currentSide, sides]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "balance",
        data: { sidesCompleted: currentSide + 1, totalSides: sides, durationPerSide },
        summary: `Balance · ${currentSide + 1}/${sides} sides · ${totalDuration}s`,
      });
    }
  }, [remaining, currentSide, sides, durationPerSide, totalDuration, onComplete, done]);

  const isDone = done || remaining === 0;
  const sideLabel = sides > 1 ? (currentSide === 0 ? "Left foot" : "Right foot") : null;
  const currentInstruction = instructions[Math.min(currentSide, instructions.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Activity className="h-3.5 w-3.5" />}
        title={spec.title || "Balance"}
        prompt={spec.prompt || currentInstruction}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {sideLabel && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {sideLabel}
            </p>
          )}

          <p className="text-center text-sm text-foreground/80 italic leading-relaxed max-w-xs">
            {currentInstruction}
          </p>

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
        title={spec.title || "Balance"}
        prompt={currentInstruction}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          {sideLabel && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              {sideLabel}
            </p>
          )}
          <p className="text-center text-sm text-foreground/80 max-w-xs leading-relaxed">
            {currentInstruction}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
