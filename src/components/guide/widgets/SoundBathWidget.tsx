import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, SoundBathSpec } from "./types";

export function SoundBathWidget({ spec, onComplete, onSkip, done }: WidgetProps<SoundBathSpec>) {
  const total = spec.duration ?? 300;
  const [remaining, setRemaining] = useState(total);
  const [listening, setListening] = useState(false);
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
        kind: "sound_bath",
        data: { durationSec: total, tone: spec.tone },
        summary: `Sound bath · ${total}s`,
      });
    }
  }, [remaining, total, spec.tone, onComplete, done]);

  const isDone = done || remaining === 0;

  return (
    <>
      <WidgetShell
        icon={<Volume2 className="h-3.5 w-3.5" />}
        title={spec.title || "Sound Bath"}
        prompt={spec.soundDescription || spec.prompt || "Let sound move through you. Don't analyze it. Just receive."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-5 py-3">
          {/* Listening indicator */}
          <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all ${
            listening ? "border-primary/40 bg-primary/10" : "border-border/40 bg-background/30"
          }`}>
            <div className={`h-2 w-2 rounded-full transition-all ${
              listening ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
            }`} />
            <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {listening ? "Listening" : "Ready"}
            </span>
          </div>

          {/* Sound wave visualization */}
          {listening && !isDone && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-primary/60 animate-pulse"
                  style={{
                    height: `${12 + Math.sin(i * 0.8 + Date.now() / 500) * 12}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.8 + (i % 3) * 0.3}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Timer */}
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>

          {!isDone && !listening && (
            <Button size="sm" onClick={() => setListening(true)} className="rounded-full">
              Begin Listening
            </Button>
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
        title={spec.title || "Sound Bath"}
        prompt={spec.soundDescription || spec.prompt || "Let sound move through you."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary/50"
                style={{
                  height: `${16 + Math.sin(i * 0.7 + Date.now() / 400) * 16}px`,
                }}
              />
            ))}
          </div>
          {spec.soundDescription && (
            <p className="text-xs text-muted-foreground/70 italic max-w-xs text-center">
              {spec.soundDescription}
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
