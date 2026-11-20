import { useState } from "react";
import { Button } from "@/design-system";

interface SelectionOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

interface SelectionCardsProps {
  options: SelectionOption[];
  allowMultiple?: boolean;
  prompt?: string;
  showAsCards?: boolean;
  onComplete?: (payload: { selection: string | string[] }) => void;
}

export function SelectionCards({
  options,
  allowMultiple = false,
  prompt,
  showAsCards = true,
  onComplete,
}: SelectionCardsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    if (allowMultiple) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelected([id]);
    }
  }

  const canContinue = selected.length > 0;

  return (
    <div className="flex flex-col gap-4 py-4">
      {prompt && <p className="text-center text-sm text-muted-foreground">{prompt}</p>}
      <div className={showAsCards ? "grid grid-cols-1 gap-3 sm:grid-cols-2" : "flex flex-wrap gap-2"}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_-8px_hsl(var(--primary))]"
                  : "border-border/40 bg-card/40 hover:border-border/60 hover:bg-card/60"
              }`}
            >
              {opt.icon && <span className="mb-2 block text-2xl">{opt.icon}</span>}
              <p className="font-medium">{opt.label}</p>
              {opt.description && (
                <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <Button
          disabled={!canContinue}
          onClick={() =>
            onComplete?.({ selection: allowMultiple ? selected : selected[0] })
          }
          className="rounded-full px-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
