import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, BodyScanSpec } from "./types";

const DEFAULT_REGIONS = ["feet", "legs", "belly", "chest", "hands", "face"];
const REGION_PROMPTS: Record<string, string> = {
  feet: "Notice your feet — contact with the ground, weight, temperature",
  legs: "Notice your legs — tension, warmth, the weight of the body",
  belly: "Notice your belly — rising, falling, or still",
  chest: "Notice your chest — breath moving the ribs, the space inside",
  hands: "Notice your hands — temperature, texture, weight",
  face: "Notice your face — jaw, forehead, eyes, mouth. Soften.",
};

export function BodyScanWidget({ spec, onComplete, onSkip, done }: WidgetProps<BodyScanSpec>) {
  const total = spec.duration ?? 300;
  const regions = spec.regions ?? DEFAULT_REGIONS;
  const [remaining, setRemaining] = useState(total);
  const [regionIndex, setRegionIndex] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const regionDuration = Math.max(10, Math.floor(total / regions.length));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsed = total - next;
        const newIndex = Math.min(Math.floor(elapsed / regionDuration), regions.length - 1);
        setRegionIndex(newIndex);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, regionDuration, regions.length]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "body_scan",
        data: { regionsVisited: regions.slice(0, regionIndex + 1), durationSec: total },
        summary: `Body scan · ${regions.length} regions · ${total}s`,
      });
    }
  }, [remaining, total, regionIndex, regions, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentRegion = regions[Math.min(regionIndex, regions.length - 1)];
  const regionPrompt = REGION_PROMPTS[currentRegion] || `Notice your ${currentRegion}`;

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "Body Scan"}
        prompt={spec.prompt || "Progressive body awareness. Follow the prompts. Don't change anything."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Region progress dots */}
          <div className="flex items-center gap-1.5">
            {regions.map((r, i) => (
              <div
                key={r}
                className={`rounded-full transition-all duration-500 ${
                  i <= regionIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

          {/* Current region prompt */}
          <p className="text-center text-sm text-foreground/80 italic leading-relaxed max-w-xs">
            {regionPrompt}
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
        title={spec.title || "Body Scan"}
        prompt={spec.prompt || "Progressive body awareness. Follow the prompts."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-6">
          
          <p className="text-center text-base text-foreground/80 italic max-w-sm leading-relaxed">
            {regionPrompt}
          </p>
          {/* Region progress */}
          <div className="flex items-center gap-2">
            {regions.map((r, i) => (
              <div
                key={r}
                className={`rounded-full transition-all duration-500 ${
                  i <= regionIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
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
