import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, SelfInquirySpec } from "./types";

export function SelfInquiryWidget({ spec, onComplete, onSkip, done }: WidgetProps<SelfInquirySpec>) {
  const [text, setText] = useState("");
  return (
    <WidgetShell
      icon={<HelpCircle className="h-3.5 w-3.5" />}
      title={spec.title || "Self-Inquiry"}
      done={done}
    >
      <p className="mb-3 text-sm font-medium text-foreground">{spec.question}</p>
      {!done ? (
        <>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Sit with the question. Type whatever rises…"
            className="min-h-[80px] bg-background/40 border-border/60 text-sm resize-none"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
            <Button
              size="sm"
              disabled={text.trim().length === 0}
              onClick={() => onComplete({
                kind: "self_inquiry",
                data: { question: spec.question, answer: text.trim() },
                summary: `Inquiry · "${spec.question.slice(0, 40)}…" → ${text.trim().slice(0, 80)}`,
              })}
              className="rounded-full"
            >
              Share
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground italic">Reflection received.</p>
      )}
    </WidgetShell>
  );
}
