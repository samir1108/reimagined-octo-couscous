import { useEffect, useRef, useState } from "react";
import { Eye, Maximize2 } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import DisplayOrb from "@/components/shared/DisplayOrb.tsx";
import type { WidgetProps, WitnessTimerSpec } from "./types";

export function WitnessTimerWidget({ spec, onComplete, onSkip, done }: WidgetProps<WitnessTimerSpec>) {
  const total = spec.duration ?? 120;
  const [remaining, setRemaining] = useState(total);
  const [thoughts, setThoughts] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done || paused) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, paused]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "witness_timer",
        data: { thoughts, durationSec: total, level: spec.level },
        summary: `Witness ${total}s · noticed ${thoughts} thought${thoughts === 1 ? "" : "s"}`,
      });
    }
  }, [remaining, thoughts, total, spec.level, onComplete, done]);

  const isDone = done || remaining === 0;

  const markThought = () => {
    if (!isDone) setThoughts((t) => t + 1);
  };

  /** Early exit is allowed, but it is recorded as partial — honesty over gamification. */
  const finishEarly = () => {
    if (isDone || completedRef.current) return;
    completedRef.current = true;
    setImmersive(false);
    const elapsed = total - remaining;
    onComplete({
      kind: "witness_timer",
      data: { thoughts, durationSec: elapsed, plannedSec: total, partial: true, object: spec.object },
      summary: `Witness ${elapsed}s of ${total}s · noticed ${thoughts} thought${thoughts === 1 ? "" : "s"}`,
    });
  };

  const immersiveStage = (
    <div className="flex flex-col items-center gap-9">
      <div className="relative">
        <DisplayOrb size={230} breathing={!isDone} />
      </div>
      <div className="text-3xl font-light tabular-nums text-foreground/85">{remaining}s</div>
      <button
        type="button"
        onClick={markThought}
        disabled={isDone}
        className="rounded-full border border-border/50 bg-background/40 px-7 py-2.5 text-xs uppercase tracking-[0.25em] text-foreground/80 hover:bg-background/60 disabled:opacity-60 transition"
      >
        Noticed · {thoughts}
      </button>
    </div>
  );

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "The Witness"}
        prompt={spec.prompt}
        done={isDone}
      >
        <div className="flex flex-col items-center py-2">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
            <span className="text-2xl font-light tabular-nums">{remaining}s</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={markThought}
              disabled={isDone}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-xs hover:bg-background/60 disabled:opacity-60"
            >
              <Eye className="h-3 w-3" /> Noticed · {thoughts}
            </button>
            {!isDone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPaused((p) => !p)}
                className="text-xs text-muted-foreground"
              >
                {paused ? "Resume" : "Pause"}
              </Button>
            )}
            {!isDone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImmersive(true)}
                className="text-xs text-muted-foreground"
              >
                <Maximize2 className="h-3 w-3" /> Immerse
              </Button>
            )}
          </div>
          {spec.object && (
            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-foreground/60">
              object · {spec.object}
            </p>
          )}
          {!isDone && (
            <div className="mt-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={finishEarly} className="text-xs text-muted-foreground">
                Finish early
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
        title={spec.title || "The Witness"}
        prompt={spec.prompt || "Sit still. Watch what arises without naming it."}
        onClose={() => setImmersive(false)}
      >
        {immersiveStage}
      </ImmersivePractice>
    </>
  );
}
