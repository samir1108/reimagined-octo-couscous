import { useState } from "react";
import { Sparkles, Check, Clock } from "lucide-react";
import { Button } from "@/design-system";
import { WidgetShell } from "./WidgetShell";
import type { WidgetProps, MicroActSpec } from "./types";

type Commitment = "now" | "today";

/**
 * A micro-act is not a checkbox. The user either did it now or commits to a
 * concrete window; both outcomes are recorded so the loop can be verified.
 */
export function MicroActWidget({ spec, onComplete, onSkip, done }: WidgetProps<MicroActSpec>) {
  const [committed, setCommitted] = useState<Commitment | null>(null);

  return (
    <WidgetShell icon={<Sparkles className="h-3.5 w-3.5" />} title={spec.title || "Try this now"} done={done}>
      <p className="mb-1 text-sm text-foreground leading-relaxed">{spec.act}</p>
      {spec.window && (
        <p className="mb-4 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
          window · {spec.window}
        </p>
      )}
      {!done && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>Skip</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCommitted("today");
              onComplete({
                kind: "micro_act",
                data: { act: spec.act, window: "today", committed: true, done: false },
                summary: `Committed · ${spec.act.slice(0, 60)}`,
              });
            }}
            className="rounded-full gap-1.5"
          >
            <Clock className="h-3.5 w-3.5" /> I'll do it today
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCommitted("now");
              onComplete({
                kind: "micro_act",
                data: { act: spec.act, window: "now", committed: true, done: true, at: new Date().toISOString() },
                summary: `Did · ${spec.act.slice(0, 60)}`,
              });
            }}
            className="rounded-full gap-1.5"
          >
            <Check className="h-3.5 w-3.5" /> Did it now
          </Button>
        </div>
      )}
      {done && committed === "today" && (
        <p className="text-xs italic text-muted-foreground">Committed for today.</p>
      )}
    </WidgetShell>
  );
}
