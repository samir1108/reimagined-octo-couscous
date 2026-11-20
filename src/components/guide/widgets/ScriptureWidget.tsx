import { useEffect, useRef, useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, ScriptureSpec } from "./types";

export function ScriptureWidget({ spec, onComplete, onSkip, done }: WidgetProps<ScriptureSpec>) {
  const total = spec.duration ?? 300;
  const segments = spec.segments ?? ["Read slowly. Let each line land before moving on."];
  const [remaining, setRemaining] = useState(total);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const segmentDuration = Math.max(5, Math.floor(total / segments.length));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = total - next;
        const newIndex = Math.min(Math.floor(elapsed / segmentDuration), segments.length - 1);
        setSegmentIndex(newIndex);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, segmentDuration, segments.length]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "scripture",
        data: { segmentsRead: segments.slice(0, segmentIndex + 1), source: spec.source },
        summary: `Scripture · ${segments.length} passages · ${total}s`,
      });
    }
  }, [remaining, total, segmentIndex, segments, spec.source, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentSegment = segments[Math.min(segmentIndex, segments.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<BookOpen className="h-3.5 w-3.5" />}
        title={spec.title || "Wisdom Reading"}
        prompt={spec.source ? `From ${spec.source}` : undefined}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Segment progress */}
          <div className="flex items-center gap-1.5">
            {segments.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= segmentIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

          {/* Current segment */}
          <p className="text-center text-sm text-foreground/85 leading-relaxed italic max-w-sm">
            {currentSegment}
          </p>

          {/* Source attribution */}
          {spec.source && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              — {spec.source}
            </p>
          )}

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
        title={spec.title || "Wisdom Reading"}
        prompt={spec.prompt || "Read slowly. Let it land."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-lg text-foreground/85 italic max-w-lg leading-relaxed">
            {currentSegment}
          </p>
          {spec.source && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
              — {spec.source}
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
