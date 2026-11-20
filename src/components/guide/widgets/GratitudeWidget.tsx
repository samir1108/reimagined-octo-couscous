import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, GratitudeSpec } from "./types";

const DEFAULT_PROMPTS = [
  "Something in your body right now",
  "Something that happened today",
  "Someone you appreciate",
];

export function GratitudeWidget({ spec, onComplete, onSkip, done }: WidgetProps<GratitudeSpec>) {
  const count = spec.count ?? 3;
  const prompts = spec.prompts ?? DEFAULT_PROMPTS;
  const [items, setItems] = useState<string[]>(Array(count).fill(""));
  const [started, setStarted] = useState(false);

  const allFilled = items.every((item) => item.trim().length > 0);

  const updateItem = (index: number, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <WidgetShell
      icon={<Heart className="h-3.5 w-3.5" />}
      title={spec.title || "Gratitude"}
      prompt={started ? null : (spec.prompt || "Name three things you're grateful for. They can be small.")}
      done={done}
    >
      {!started && !done ? (
        <Button size="sm" onClick={() => setStarted(true)} className="rounded-full">
          Begin
        </Button>
      ) : !done ? (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
              <Input
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={prompts[i] || "Something you're grateful for..."}
                className="bg-background/40 border-border/60 text-sm h-9"
              />
            </div>
          ))}
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
              <Button
                size="sm"
                disabled={!allFilled}
                onClick={() =>
                  onComplete({
                    kind: "gratitude",
                    data: { items: items.filter((i) => i.trim()) },
                    summary: `Gratitude · ${count} items`,
                  })
                }
                className="rounded-full"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Three things named. The noticing is the practice.
        </p>
      )}
    </WidgetShell>
  );
}
