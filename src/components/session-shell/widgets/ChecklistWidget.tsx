import { useState } from "react";
import { Button } from "@/design-system";
import { Check } from "lucide-react";

interface ChecklistWidgetProps {
  items?: string[];
  minSelections?: number;
  prompt?: string;
  onComplete?: (payload: { checked: string[]; count: number }) => void;
}

export function ChecklistWidget({
  items = [],
  minSelections = 1,
  prompt,
  onComplete,
}: ChecklistWidgetProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  const selected = items.filter((_, index) => checked.has(index));
  const ready = selected.length >= Math.min(minSelections, items.length);

  return (
    <div className="flex flex-col gap-4 py-2">
      {prompt && <p className="text-center text-sm text-muted-foreground">{prompt}</p>}
      <div className="flex flex-col gap-2" role="group" aria-label="Checklist">
        {items.map((item, index) => {
          const isChecked = checked.has(index);
          return (
            <button
              key={`${item}-${index}`}
              type="button"
              onClick={() => toggle(index)}
              aria-pressed={isChecked}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                isChecked
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/40 bg-background/30 text-muted-foreground hover:bg-background/50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                  isChecked ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
                }`}
              >
                {isChecked && <Check className="h-3 w-3" />}
              </span>
              <span className="leading-relaxed">{item}</span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">
          {selected.length} / {items.length}
        </span>
        <Button
          disabled={!ready}
          onClick={() => onComplete?.({ checked: selected, count: selected.length })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
