import { useState } from "react";
import { Button, Textarea } from "@/design-system";

interface WritingWidgetProps {
  prompts?: string[];
  placeholder?: string;
  minChars?: number;
  maxChars?: number;
  note?: string;
  onComplete?: (payload: { responses: string[]; characters: number }) => void;
}

export function WritingWidget({
  prompts = ["What is here right now?"],
  placeholder = "Write without editing…",
  minChars = 20,
  maxChars = 4000,
  note,
  onComplete,
}: WritingWidgetProps) {
  const [answers, setAnswers] = useState<string[]>(prompts.map(() => ""));
  const characters = answers.reduce((sum, answer) => sum + answer.trim().length, 0);
  const ready = characters >= minChars;

  function update(index: number, value: string) {
    setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      {prompts.map((prompt, index) => (
        <div key={`${prompt}-${index}`} className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/50 bg-background/50 text-[10px] font-medium text-muted-foreground">
              {index + 1}
            </span>
            <p className="text-sm font-medium leading-relaxed">{prompt}</p>
          </div>
          <Textarea
            value={answers[index] ?? ""}
            onChange={(event) => update(index, event.target.value.slice(0, maxChars))}
            placeholder={placeholder}
            aria-label={prompt}
            className="min-h-[92px] resize-none rounded-2xl border-border/40 bg-background/40 text-base leading-relaxed"
          />
        </div>
      ))}

      {note && <p className="text-xs italic text-muted-foreground/70">{note}</p>}

      <div className="flex items-center justify-between gap-3">
        <span className={`text-[10px] uppercase tracking-[0.24em] ${ready ? "text-muted-foreground/60" : "text-muted-foreground/40"}`}>
          {characters} / {minChars} min
        </span>
        <Button
          disabled={!ready}
          onClick={() => onComplete?.({ responses: answers.map((a) => a.trim()), characters })}
          className="rounded-full px-6"
        >
          Seal it
        </Button>
      </div>
    </div>
  );
}
