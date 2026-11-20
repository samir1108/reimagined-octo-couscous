import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, ReflectionCardSpec } from "./types";

export function ReflectionCardWidget({ spec, onComplete, onSkip, done }: WidgetProps<ReflectionCardSpec>) {
  const [text, setText] = useState("");
  const min = spec.minChars ?? 0;
  return (
    <WidgetShell icon={<Heart className="h-3.5 w-3.5" />} title={spec.title || "Closing reflection"} done={done}>
      {spec.summary && (
        <div className="mb-3 rounded-lg border border-border/40 bg-background/30 p-3 text-xs text-foreground/70 italic">
          {spec.summary}
        </div>
      )}
      {spec.prompt && <p className="mb-3 text-sm font-medium text-foreground">{spec.prompt}</p>}
      {!done ? (
        <>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What stayed with you?"
            className="min-h-[70px] bg-background/40 border-border/60 text-sm resize-none"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>Close</Button>
            <Button
              size="sm"
              disabled={text.trim().length < min}
              onClick={() => onComplete({
                kind: "reflection_card",
                data: { reflection: text.trim(), chars: text.trim().length },
                summary: text.trim() ? `Reflection · ${text.trim().slice(0, 80)}` : "Closed without writing",
              })}
              className="rounded-full"
            >
              Seal
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sealed.</p>
      )}
    </WidgetShell>
  );
}
