import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, JournalSpec } from "./types";

export function JournalWidget({ spec, onComplete, onSkip, done }: WidgetProps<JournalSpec>) {
  const [text, setText] = useState("");
  const min = spec.minChars ?? 0;
  const questions = (spec.questions || []).filter(Boolean).slice(0, 3);
  return (
    <WidgetShell icon={<BookOpen className="h-3.5 w-3.5" />} title={spec.title || "Journal"} prompt={spec.prompt} done={done}>
      {questions.length > 0 && (
        <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-foreground/85">
          {questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      )}
      {!done ? (
        <>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write freely…"
            className="min-h-[100px] bg-background/40 border-border/60 text-sm resize-none"
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground/60">
            <span>{text.trim().length} / {Math.max(min, 1)} chars</span>
          </div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
            <Button
              size="sm"
              disabled={text.trim().length < min || text.trim().length === 0}
              onClick={() => onComplete({
                kind: "journal",
                data: { text: text.trim(), questions, chars: text.trim().length },
                summary: `Journal · ${text.trim().length} chars`,
              })}
              className="rounded-full"
            >
              Save
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground italic">Saved.</p>
      )}
    </WidgetShell>
  );
}
