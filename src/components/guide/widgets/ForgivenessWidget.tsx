import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, ForgivenessSpec } from "./types";

const DEFAULT_PROMPTS = [
  "Who needs forgiving? (including yourself)",
  "What needs releasing?",
  "What would softness say to this?",
];

export function ForgivenessWidget({ spec, onComplete, onSkip, done }: WidgetProps<ForgivenessSpec>) {
  const prompts = spec.prompts ?? DEFAULT_PROMPTS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");

  const isLast = currentIndex >= prompts.length - 1;
  const currentPrompt = prompts[currentIndex];

  const handleNext = () => {
    if (!currentText.trim()) return;
    const next = [...responses, currentText.trim()];
    setResponses(next);
    setCurrentText("");

    if (isLast) {
      onComplete({
        kind: "forgiveness",
        data: { prompts, responses: next },
        summary: `Forgiveness · ${prompts.length} reflections`,
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <WidgetShell
      icon={<Heart className="h-3.5 w-3.5" />}
      title={spec.title || "Forgiveness"}
      prompt={done ? null : (spec.prompt || "A gentle practice. No force. Just honesty.")}
      done={done}
    >
      {!done ? (
        <div className="flex flex-col gap-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {prompts.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i < currentIndex ? "w-5 h-1 bg-primary/60" : i === currentIndex ? "w-5 h-1 bg-primary/40" : "w-3.5 h-1 bg-border/40"
                }`}
              />
            ))}
          </div>

          <p className="text-sm text-foreground/80 italic leading-relaxed">
            {currentPrompt}
          </p>

          <Textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Write freely. Nothing to fix."
            className="min-h-[80px] bg-background/40 border-border/60 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {currentIndex + 1} / {prompts.length}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
              <Button
                size="sm"
                disabled={!currentText.trim()}
                onClick={handleNext}
                className="rounded-full"
              >
                {isLast ? "Release" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          What needed saying has been said. The rest is time.
        </p>
      )}
    </WidgetShell>
  );
}
