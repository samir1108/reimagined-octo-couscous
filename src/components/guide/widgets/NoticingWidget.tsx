import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, NoticingSpec } from "./types";

const TARGET_LABELS: Record<string, string> = {
  thoughts: "thoughts",
  feelings: "feelings",
  sensations: "sensations",
  all: "whatever arises",
};

export function NoticingWidget({ spec, onComplete, onSkip, done }: WidgetProps<NoticingSpec>) {
  const total = spec.duration ?? 180;
  const target = spec.target || "all";
  const noticingPrompt = spec.noticingPrompt || `Notice and name what you experience. Don't analyze it. Just name it.`;
  const [remaining, setRemaining] = useState(total);
  const [noticedCount, setNoticedCount] = useState(0);
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
        kind: "noticing",
        data: { target, noticedCount, durationSec: total },
        summary: `Noticing · ${noticedCount} ${target} · ${total}s`,
      });
    }
  }, [remaining, total, target, noticedCount, onComplete, done]);

  const isDone = done || remaining === 0;

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "Noticing"}
        prompt={noticingPrompt}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-3">
          {/* Target label */}
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Noticing {target}
          </p>

          {/* Timer */}
          <div className="text-3xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>

          {!isDone && (
            <button
              type="button"
              onClick={() => setNoticedCount((c) => c + 1)}
              className="rounded-full border border-border/50 bg-background/40 px-5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-foreground/80 hover:bg-background/60 transition"
            >
              Noticed · {noticedCount}
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
        title={spec.title || "Noticing"}
        prompt={noticingPrompt}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            Noticing {target}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
