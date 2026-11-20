import { useEffect, useState } from "react";
import { useSessionShell } from "@/lib/session-shell/SessionShellContext";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { Input } from "@/design-system";
import { Play, SkipForward, Pause, Check } from "lucide-react";

type Interaction =
  | "display" | "question" | "choice" | "text-input" | "voice-input"
  | "guided-practice" | "timer" | "silence" | "audio" | "reflection"
  | "inquiry" | "dialogue" | "visualization" | "creative-canvas"
  | "visual-contemplation" | "memory-recall" | "sound-listening"
  | "body-map-selection" | "emotion-selection" | "free-text-reflection"
  | "multiple-choice-check-in" | "mantra-counter" | "real-world-mission"
  | "walking-guidance";

/**
 * Generic renderer for any data-driven session step. Handles every interaction
 * type defined in the SessionStepDefinition/ComposedStep contracts so that all
 * 526+ steps render meaningful UI instead of silently auto-advancing.
 */
export function DataDrivenStep() {
  const { currentStep, goToNext, skipCurrent } = useSessionShell();
  const interaction = (currentStep?.params?.interaction as Interaction) ?? "display";
  const [text, setText] = useState("");
  const [remaining, setRemaining] = useState<number>(
    Math.max(1, Math.round((currentStep?.est_minutes ?? 1) * 60)),
  );
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!currentStep) return;
    setRemaining(Math.max(1, Math.round((currentStep.est_minutes ?? 1) * 60)));
    setText("");
    setStarted(false);
    setPaused(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep?.title, currentStep?.kind, currentStep?.est_minutes]);

  useEffect(() => {
    if (!started || paused || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, remaining]);

  if (!currentStep) return null;

  const isTimerLike = interaction === "timer" || interaction === "silence" || interaction === "guided-practice";
  const needsText = interaction === "text-input" || interaction === "question" || interaction === "free-text-reflection" || interaction === "reflection" || interaction === "inquiry" || interaction === "dialogue";
  const isDisplay = interaction === "display" || interaction === "audio" || interaction === "visualization" || interaction === "creative-canvas" || interaction === "visual-contemplation" || interaction === "memory-recall" || interaction === "sound-listening" || interaction === "body-map-selection" || interaction === "emotion-selection" || interaction === "multiple-choice-check-in" || interaction === "mantra-counter" || interaction === "real-world-mission" || interaction === "walking-guidance" || interaction === "voice-input";

  function submit(payload?: Record<string, unknown>) {
    goToNext({ text: text.trim(), ...payload });
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold">{currentStep.title}</h2>
      {currentStep.prompt && (
        <p className="text-base opacity-80 whitespace-pre-wrap">{currentStep.prompt}</p>
      )}

      {isTimerLike && (
        <div className="text-5xl font-mono tabular-nums">{remaining}s</div>
      )}

      {needsText && (
        <Textarea
          className="w-full min-h-24"
          placeholder="Write what you notice..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {!needsText && interaction === "question" && (
        <Input
          className="w-full"
          placeholder="Your answer..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        {isTimerLike && !started && (
          <Button onClick={() => setStarted(true)}>
            <Play className="mr-2 h-4 w-4" /> Begin
          </Button>
        )}
        {isTimerLike && started && remaining > 0 && (
          <Button variant="ghost" onClick={() => setPaused((p) => !p)}>
            <Pause className="mr-2 h-4 w-4" /> {paused ? "Resume" : "Pause"}
          </Button>
        )}
        {isTimerLike && started && remaining > 0 && (
          <Button variant="ghost" onClick={() => setRemaining(0)}>
            Done early
          </Button>
        )}
        {isTimerLike && remaining <= 0 && (
          <Button onClick={() => submit()}>
            <Check className="mr-2 h-4 w-4" /> Continue
          </Button>
        )}
        {!isTimerLike && (
          <Button onClick={() => submit()} disabled={needsText && text.trim().length === 0 && currentStep.requiresUserResponse !== false ? false : false}>
            <Check className="mr-2 h-4 w-4" /> Continue
          </Button>
        )}
        {currentStep.optional && (
          <Button variant="ghost" onClick={() => skipCurrent()}>
            <SkipForward className="mr-2 h-4 w-4" /> Skip
          </Button>
        )}
      </div>
    </div>
  );
}
