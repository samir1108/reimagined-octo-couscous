import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, LovingKindnessSpec } from "./types";

const DEFAULT_PHASES = ["self", "loved_one", "neutral", "difficult", "all"];
const PHASE_LABELS: Record<string, string> = {
  self: "Yourself",
  loved_one: "Someone you love",
  neutral: "Someone you don't know well",
  difficult: "Someone difficult",
  all: "All beings",
};
const DEFAULT_PHRASES = ["May I be happy", "May I be safe", "May I be free"];

export function LovingKindnessWidget({ spec, onComplete, onSkip, done }: WidgetProps<LovingKindnessSpec>) {
  const total = spec.duration ?? 300;
  const phases = spec.phases ?? DEFAULT_PHASES;
  const phrases = spec.phrases ?? DEFAULT_PHRASES;
  const [remaining, setRemaining] = useState(total);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const phaseDuration = Math.max(5, Math.floor(total / phases.length));
  const phraseInterval = Math.max(3, Math.floor(phaseDuration / phrases.length));

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next <= 0) return 0;
        const elapsedInPhase = (total - next) % phaseDuration;
        const newPhraseIndex = Math.min(Math.floor(elapsedInPhase / phraseInterval), phrases.length - 1);
        const newPhaseIndex = Math.min(Math.floor((total - next) / phaseDuration), phases.length - 1);
        setPhraseIndex(newPhraseIndex);
        setPhaseIndex(newPhaseIndex);
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [done, total, phaseDuration, phraseInterval, phrases.length, phases.length]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "loving_kindness",
        data: { phases, durationSec: total },
        summary: `Loving-kindness · ${phases.length} phases · ${total}s`,
      });
    }
  }, [remaining, total, phases, onComplete, done]);

  const isDone = done || remaining === 0;
  const currentPhase = PHASE_LABELS[phases[Math.min(phaseIndex, phases.length - 1)]] || "All beings";
  const currentPhrase = phrases[Math.min(phraseIndex, phrases.length - 1)];

  return (
    <>
      <WidgetShell
        icon={<Heart className="h-3.5 w-3.5" />}
        title={spec.title || "Loving Kindness"}
        prompt={spec.prompt || "Begin with yourself. Then expand outward. Let the phrases land."}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Phase dots */}
          <div className="flex items-center gap-1.5">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i <= phaseIndex ? "w-5 h-1.5 bg-primary/70" : "w-3.5 h-1.5 bg-border/40"
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {currentPhase}
          </p>

          <p className="text-center text-base text-foreground/85 italic leading-relaxed">
            &ldquo;{currentPhrase}&rdquo;
          </p>

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
        title={spec.title || "Loving Kindness"}
        prompt={spec.prompt || "Begin with yourself. Then expand outward."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-center text-lg text-foreground/85 italic max-w-sm">
            &ldquo;{currentPhrase}&rdquo;
          </p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
            {currentPhase}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
