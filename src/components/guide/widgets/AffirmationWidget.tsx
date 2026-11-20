import { useEffect, useRef, useState } from "react";
import { Repeat } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, AffirmationSpec } from "./types";

export function AffirmationWidget({ spec, onComplete, onSkip, done }: WidgetProps<AffirmationSpec>) {
  const total = spec.duration ?? 120;
  const text = spec.text || "I am present.";
  const repetitions = spec.repetitions ?? 1;
  const [remaining, setRemaining] = useState(total);
  const [count, setCount] = useState(0);
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
        kind: "affirmation",
        data: { text, repetitions: count, durationSec: total },
        summary: `Affirmation · "${text}" · ${count}× · ${total}s`,
      });
    }
  }, [remaining, total, text, count, onComplete, done]);

  const isDone = done || remaining === 0;

  return (
    <>
      <WidgetShell
        icon={<Repeat className="h-3.5 w-3.5" />}
        title={spec.title || "Affirmation"}
        prompt={spec.prompt || "Let these words become your own. Speak them, think them, feel them."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-3">
          {/* Affirmation text */}
          <p className="text-center text-xl font-display text-foreground/85 italic leading-relaxed">
            &ldquo;{text}&rdquo;
          </p>

          {/* Counter */}
          <div className="text-sm text-muted-foreground">
            {count} / {repetitions}
          </div>

          {/* Timer */}
          <div className="text-3xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>

          {!isDone && (
            <button
              type="button"
              onClick={() => setCount((c) => c + 1)}
              className="rounded-full border border-border/50 bg-background/40 px-6 py-2 text-xs uppercase tracking-[0.22em] text-foreground/80 hover:bg-background/60 transition"
            >
              Repeat · {count}
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
        title={spec.title || "Affirmation"}
        prompt={spec.prompt || "Let these words become your own."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-center text-3xl font-display text-foreground/85 italic">
            &ldquo;{text}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">
            {count} / {repetitions}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
