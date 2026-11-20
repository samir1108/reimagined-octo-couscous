import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/design-system";
import { Input } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { ReadingSpec, WidgetProps } from "./types";

/**
 * ReadingWidget — a wisdom-read step is a passage, not a chat.
 * The user must take one line away, otherwise the step is a scroll.
 */
export function ReadingWidget({ spec, onComplete, onSkip, done }: WidgetProps<ReadingSpec>) {
  const [line, setLine] = useState("");
  const prompt = spec.highlightPrompt || "Which line catches you? Copy it or say it in your own words.";

  return (
    <WidgetShell icon={<BookOpen className="h-3.5 w-3.5" />} title={spec.title || "Read slowly"} done={done}>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{spec.passage}</p>
      </div>
      {spec.source && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">{spec.source}</p>
      )}
      {!done ? (
        <>
          <p className="mt-4 text-xs text-foreground/80">{prompt}</p>
          <Input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            placeholder="One line…"
            className="mt-2 bg-background/40 border-border/60 text-sm"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
            <Button
              size="sm"
              disabled={line.trim().length < 3}
              onClick={() =>
                onComplete({
                  kind: "reading",
                  data: { passage: spec.passage, source: spec.source, highlight: line.trim() },
                  summary: `Read · "${line.trim().slice(0, 80)}"`,
                })
              }
              className="rounded-full"
            >
              Keep this line
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm italic text-muted-foreground">Line kept.</p>
      )}
    </WidgetShell>
  );
}
