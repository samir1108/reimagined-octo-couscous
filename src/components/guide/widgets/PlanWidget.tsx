import { useState } from "react";
import { PencilLine } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, PlanSpec } from "./types";

const DEFAULT_SECTIONS = [
  { label: "What", prompt: "What would make today a good day? One thing." },
  { label: "When", prompt: "When will you do it? Be specific — a time, a moment." },
  { label: "How", prompt: "How will you know it happened? What will you notice?" },
];

export function PlanWidget({ spec, onComplete, onSkip, done }: WidgetProps<PlanSpec>) {
  const sections = spec.sections ?? DEFAULT_SECTIONS.length;
  const prompts = spec.prompts ?? DEFAULT_SECTIONS.map(s => s.prompt);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");

  const isLast = currentIndex >= sections - 1;
  const sectionLabels = DEFAULT_SECTIONS.map(s => s.label);

  const handleNext = () => {
    if (!currentText.trim()) return;
    const next = [...responses, currentText.trim()];
    setResponses(next);
    setCurrentText("");

    if (isLast) {
      onComplete({
        kind: "plan",
        data: { sections: sectionLabels.slice(0, sections), responses: next },
        summary: `Plan · ${sections} sections`,
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <WidgetShell
      icon={<PencilLine className="h-3.5 w-3.5" />}
      title={spec.title || "Plan"}
      prompt={done ? null : (spec.prompt || `Section ${currentIndex + 1} of ${sections}`)}
      done={done}
    >
      {!done ? (
        <div className="flex flex-col gap-3">
          {/* Progress */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: sections }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  i < currentIndex ? "w-5 h-1 bg-primary/60" : i === currentIndex ? "w-5 h-1 bg-primary/40" : "w-3.5 h-1 bg-border/40"
                }`}
              />
            ))}
          </div>

          {/* Section label */}
          {sectionLabels[currentIndex] && (
            <p className="text-[10px] uppercase tracking-[0.22em] text-primary/70">
              {sectionLabels[currentIndex]}
            </p>
          )}

          {/* Prompt */}
          <p className="text-sm text-foreground/80 italic leading-relaxed">
            {prompts[currentIndex] || DEFAULT_SECTIONS[currentIndex]?.prompt}
          </p>

          <Textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Write freely..."
            className="min-h-[80px] bg-background/40 border-border/60 text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {currentIndex + 1} / {sections}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
              <Button
                size="sm"
                disabled={!currentText.trim()}
                onClick={handleNext}
                className="rounded-full"
              >
                {isLast ? "Plan set" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {responses.map((r, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-primary/70 pt-1">
                {sectionLabels[i] || i + 1}
              </span>
              <p className="text-sm text-foreground/80 italic leading-relaxed">{r}</p>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
