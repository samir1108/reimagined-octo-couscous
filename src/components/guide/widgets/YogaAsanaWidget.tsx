import { useEffect, useRef, useState } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, YogaAsanaSpec } from "./types";

export function YogaAsanaWidget({ spec, onComplete, onSkip, done }: WidgetProps<YogaAsanaSpec>) {
  const durationPerSide = spec.duration ?? 60;
  const sides = spec.sides ?? 1;
  const instructions = spec.instructions ?? ["Hold the pose. Breathe steadily."];
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
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, currentSide, sides]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "yoga_asana",
        data: { sidesCompleted: currentSide + 1, totalSides: sides, durationPerSide, instructions },
        summary: `Yoga · ${currentSide + 1}/${sides} sides · ${totalDuration}s`,
      });
    }
  }, [remaining, currentSide, sides, durationPerSide, totalDuration, instructions, onComplete, done]);

  const isDone = done || remaining === 0;
  const sideLabel = sides > 1 ? `Side ${currentSide + 1} / ${sides}` : null;
  const currentInstruction = instructions[Math.min(currentSide, instructions.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Flame className="h-3.5 w-3.5" />}
        title={spec.title || "Yoga Asana"}
        prompt={spec.prompt || currentInstruction}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {sideLabel && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {sideLabel}
            </p>
          )}

          {spec.benefits && !isDone && (
            <p className="text-[11px] text-muted-foreground/70 italic text-center max-w-xs">
              {spec.benefits}
            </p>
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
        title={spec.title || "Yoga Asana"}
        prompt={spec.prompt || currentInstruction}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          {spec.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={spec.imageUrl}
              alt={spec.title || "Yoga pose"}
              className="max-h-44 rounded-xl border border-border/30 opacity-80"
            />
          )}
          <p className="text-center text-sm text-foreground/80 max-w-xs leading-relaxed">
            {currentInstruction}
          </p>
          {spec.benefits && (
            <p className="text-[11px] text-muted-foreground/70 italic">
              {spec.benefits}
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
