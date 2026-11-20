import { useEffect, useRef, useState } from "react";
import { Activity } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, StretchingSpec } from "./types";

const DEFAULT_STRETCHES = [
  { name: "Neck", instruction: "Slowly tilt your head side to side. Don't rush." },
  { name: "Shoulders", instruction: "Roll your shoulders back. Three times each direction." },
  { name: "Spine", instruction: "Gently twist left, then right. Let the breath guide you." },
  { name: "Hips", instruction: "Drop your knees side to side. Release the lower back." },
];

export function StretchingWidget({ spec, onComplete, onSkip, done }: WidgetProps<StretchingSpec>) {
  const durationPerStretch = spec.duration ?? 30;
  const stretches = spec.stretches ?? DEFAULT_STRETCHES;
  const rounds = spec.rounds ?? 1;
  const totalDuration = durationPerStretch * stretches.length * rounds;
  const [remaining, setRemaining] = useState(totalDuration);
  const [stretchIndex, setStretchIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = totalDuration - next;
        const totalStretches = stretches.length * rounds;
        const newStretchIndex = Math.min(Math.floor(elapsed / durationPerStretch), totalStretches - 1);
        const newRound = Math.floor(newStretchIndex / stretches.length);
        const newStretch = newStretchIndex % stretches.length;
        setStretchIndex(newStretch);
        setRound(newRound);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, totalDuration, durationPerStretch, stretches.length, rounds]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "stretching",
        data: { stretches: stretches.map(s => s.name), rounds, durationSec: totalDuration },
        summary: `Stretching · ${stretches.length} stretches · ${rounds} round${rounds > 1 ? "s" : ""}`,
      });
    }
  }, [remaining, totalDuration, stretches, rounds, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentStretch = stretches[Math.min(stretchIndex, stretches.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Activity className="h-3.5 w-3.5" />}
        title={spec.title || "Stretching"}
        prompt={spec.prompt}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Round indicator */}
          {rounds > 1 && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Round {round + 1} / {rounds}
            </p>
          )}

          {/* Stretch name */}
          <p className="text-sm font-medium text-foreground/80">
            {currentStretch.name}
          </p>

          {/* Instruction */}
          <p className="text-center text-xs text-muted-foreground/80 italic leading-relaxed max-w-xs">
            {currentStretch.instruction}
          </p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {stretches.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= stretchIndex ? "w-4 h-1.5 bg-primary/70" : "w-3 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

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
        title={spec.title || "Stretching"}
        prompt={currentStretch.instruction}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-lg font-display text-foreground/85">
            {currentStretch.name}
          </p>
          <p className="text-center text-sm text-foreground/70 italic max-w-xs">
            {currentStretch.instruction}
          </p>
          {rounds > 1 && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              Round {round + 1} / {rounds}
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
