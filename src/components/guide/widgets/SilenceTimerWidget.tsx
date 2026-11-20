import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, WitnessTimerSpec } from "./types";

export function SilenceTimerWidget({ spec, onComplete, onSkip, done }: WidgetProps<WitnessTimerSpec>) {
  const total = spec.duration ?? 180;
  const [remaining, setRemaining] = useState(total);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "silent_sit",
        data: { durationSec: total },
        summary: `Silence · ${total}s`,
      });
    }
  }, [remaining, total, onComplete, done]);

  const isDone = done || remaining === 0;

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "Pure Silence"}
        prompt={spec.prompt || "Sit. Nothing to do. Nothing to figure out. Just being."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-5 py-3">
          <div className="relative">
            
          </div>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
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
        title={spec.title || "Pure Silence"}
        prompt={spec.prompt || "Sit. Nothing to do. Nothing to figure out."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-8">
          
          <div className="text-5xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground/60">
            nothing to fix · nothing to become
          </p>
        </div>
      </ImmersivePractice>
    </>
  );
}
