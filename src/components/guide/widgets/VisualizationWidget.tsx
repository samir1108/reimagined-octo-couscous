import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, VisualizationSpec } from "./types";

export function VisualizationWidget({ spec, onComplete, onSkip, done }: WidgetProps<VisualizationSpec>) {
  const total = spec.duration ?? 300;
  const scenes = spec.scenes ?? ["Close your eyes. Take a deep breath.", "Begin to visualize...", "Stay with the image.", "Now gently return."];
  const [remaining, setRemaining] = useState(total);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const sceneDuration = Math.max(5, Math.floor(total / scenes.length));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = total - next;
        const newIndex = Math.min(Math.floor(elapsed / sceneDuration), scenes.length - 1);
        setSceneIndex(newIndex);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, sceneDuration, scenes.length]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "visualization",
        data: { scenesVisited: scenes.slice(0, sceneIndex + 1), durationSec: total },
        summary: `Visualization · ${scenes.length} scenes · ${total}s`,
      });
    }
  }, [remaining, total, sceneIndex, scenes, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentScene = scenes[Math.min(sceneIndex, scenes.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "Visualization"}
        prompt={spec.prompt || "Let the images come. Don't force them. Just observe."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Scene progress */}
          <div className="flex items-center gap-1.5">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= sceneIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

          {/* Current scene */}
          <p className="text-center text-sm text-foreground/80 italic leading-relaxed max-w-xs">
            {currentScene}
          </p>

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
        title={spec.title || "Visualization"}
        prompt={spec.prompt || "Let the images come."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-base text-foreground/80 italic max-w-sm leading-relaxed">
            {currentScene}
          </p>
          <div className="flex items-center gap-1.5">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= sceneIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
