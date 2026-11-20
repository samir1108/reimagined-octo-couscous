import { useEffect, useRef, useState } from "react";
import { Hash } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, MantraSpec } from "./types";

export function MantraWidget({ spec, onComplete, onSkip, done }: WidgetProps<MantraSpec>) {
  const total = spec.duration ?? 180;
  const mantra = spec.mantra || "Om";
  const repetitions = spec.repetitions ?? 27;
  const [remaining, setRemaining] = useState(total);
  const [count, setCount] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  // Auto-advance count based on elapsed time
  const repDuration = Math.max(1, Math.floor(total / repetitions));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = total - next;
        const newCount = Math.min(Math.floor(elapsed / repDuration), repetitions);
        setCount(newCount);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, repDuration, repetitions]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "mantra",
        data: { mantra, repetitions: count, durationSec: total },
        summary: `Mantra · ${mantra} · ${count}× · ${total}s`,
      });
    }
  }, [remaining, total, mantra, count, onComplete, done]);

  const isDone = done || remaining === 0;
  const progress = Math.min(count / repetitions, 1);

  return (
    <>
      <WidgetShell
        icon={<Hash className="h-3.5 w-3.5" />}
        title={spec.title || "Mantra"}
        prompt={spec.prompt || "Repeat silently or aloud. Let the sound become the mind."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-3">
          {/* Mantra display */}
          <p className="text-center text-2xl font-display text-foreground/85 italic leading-relaxed">
            &ldquo;{mantra}&rdquo;
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-xs h-1 rounded-full bg-border/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Counter */}
          <div className="text-sm text-muted-foreground">
            {count} / {repetitions}
          </div>

          {/* Timer */}
          <div className="text-3xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>

          {/* Tap to count (optional manual counting) */}
          {!isDone && (
            <button
              type="button"
              onClick={() => setCount((c) => Math.min(c + 1, repetitions))}
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
        title={spec.title || "Mantra"}
        prompt={spec.prompt || "Repeat silently or aloud."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-center text-3xl font-display text-foreground/85 italic">
            &ldquo;{mantra}&rdquo;
          </p>
          <div className="w-full max-w-xs h-1 rounded-full bg-border/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70 transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
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
