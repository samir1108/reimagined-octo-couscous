import { useEffect, useRef, useState } from "react";
import { PencilLine } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, FreeWriteSpec } from "./types";

export function FreeWriteWidget({ spec, onComplete, onSkip, done }: WidgetProps<FreeWriteSpec>) {
  const total = spec.duration ?? 300;
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(total);
  const intervalRef = useRef<number | null>(null);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (!started || done) return;
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [started, done]);

  const isDone = done || timeLeft === 0;
  const isTimeUp = timeLeft === 0 && started;

  const handleComplete = () => {
    onComplete({
      kind: "free_write",
      data: { text: text.trim(), wordCount, durationSec: total - timeLeft },
      summary: `Free write · ${wordCount} words`,
    });
  };

  return (
    <WidgetShell
      icon={<PencilLine className="h-3.5 w-3.5" />}
      title={spec.title || "Free Write"}
      prompt={started ? null : (spec.prompt || "Write freely for the full duration. No editing. No censorship.")}
      done={isDone}
    >
      {!started && !isDone ? (
        <Button size="sm" onClick={() => setStarted(true)} className="rounded-full">
          Begin Writing
        </Button>
      ) : !isDone ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write whatever comes. Don't stop. Don't edit. Just keep the pen moving..."
            className="min-h-[140px] bg-background/40 border-border/60 text-sm resize-none leading-relaxed"
            autoFocus
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
            <Button
              size="sm"
              onClick={handleComplete}
              className="rounded-full"
            >
              Done
            </Button>
          </div>
        </div>
      ) : isTimeUp ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Time's up. {wordCount > 0 ? `${wordCount} ${wordCount === 1 ? "word" : "words"} written.` : "Whatever arose is enough."}
          </p>
          <Button size="sm" onClick={handleComplete} className="rounded-full">
            Save
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Written. The act of putting it down is the practice.
        </p>
      )}
    </WidgetShell>
  );
}
