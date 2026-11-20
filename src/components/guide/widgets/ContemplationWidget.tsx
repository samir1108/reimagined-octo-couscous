import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import { ImmersivePractice } from "./ImmersivePractice";
import type { WidgetProps, ContemplationSpec } from "./types";

const DEFAULT_PROMPTS = [
  "Return to the question. Don't try to answer it.",
  "What arises when you sit with this?",
  "Let the question breathe. No need to resolve it.",
  "Return here. The question is the practice.",
];

export function ContemplationWidget({ spec, onComplete, onSkip, done }: WidgetProps<ContemplationSpec>) {
  const total = spec.duration ?? 300;
  const question = spec.question || "Who is aware of this?";
  const periodicPrompts = spec.periodicPrompts ?? DEFAULT_PROMPTS;
  const promptInterval = spec.promptInterval ?? 60;
  const [remaining, setRemaining] = useState(total);
  const [showGentlePrompt, setShowGentlePrompt] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const promptTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (done) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    // Gentle periodic prompts
    promptTimerRef.current = window.setInterval(() => {
      if (remaining > 0) {
        setShowGentlePrompt(true);
        setTimeout(() => setShowGentlePrompt(false), 8000);
      }
    }, promptInterval * 1000);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (promptTimerRef.current) window.clearInterval(promptTimerRef.current);
    };
  }, [done, promptInterval]);

  useEffect(() => {
    if (remaining === 0 && !completedRef.current && !done) {
      completedRef.current = true;
      setImmersive(false);
      onComplete({
        kind: "contemplation",
        data: { question, durationSec: total },
        summary: `Contemplation · "${question.slice(0, 30)}..." · ${total}s`,
      });
    }
  }, [remaining, total, question, onComplete, done]);

  const isDone = done || remaining === 0;
  const gentlePrompt = periodicPrompts[Math.floor((total - remaining) / promptInterval) % periodicPrompts.length];

  return (
    <>
      <WidgetShell
        icon={<Eye className="h-3.5 w-3.5" />}
        title={spec.title || "Contemplation"}
        prompt={spec.prompt}
        done={isDone}
      >
        <div className="flex flex-col items-center gap-4 py-3">
          {/* The question — large, centered */}
          <p className="text-center text-lg font-display text-foreground/85 italic leading-relaxed">
            {question}
          </p>

          {/* Gentle periodic prompt */}
          <AnimatePresence>
            {showGentlePrompt && !isDone && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-muted-foreground/70 italic"
              >
                {gentlePrompt}
              </motion.p>
            )}
          </AnimatePresence>

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
        title={spec.title || "Contemplation"}
        prompt={spec.prompt || "Sit with the question. No answer needed."}
        onClose={() => setImmersive(false)}
      >
        <div className="flex flex-col items-center gap-7">
          
          <p className="text-center text-2xl font-display text-foreground/85 italic max-w-lg leading-relaxed">
            {question}
          </p>
          <div className="text-4xl font-extralight tabular-nums text-foreground/80 tracking-wide">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </ImmersivePractice>
    </>
  );
}
