import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";

interface InquiryScreenProps {
  question: string;
  durationSeconds?: number;
  contemplationSeconds?: number;
  allowReflection?: boolean;
  reflectionPrompt?: string;
  showTimer?: boolean;
  onComplete?: (payload: { reflected: boolean; response: string; durationSec: number }) => void;
}

export function InquiryScreen({
  question,
  durationSeconds = 60,
  contemplationSeconds = 60,
  allowReflection = true,
  reflectionPrompt,
  showTimer = true,
  onComplete,
}: InquiryScreenProps) {
  const [phase, setPhase] = useState<"contemplation" | "reflection">("contemplation");
  const [remaining, setRemaining] = useState(contemplationSeconds);
  const [text, setText] = useState("");
  const [contemplated, setContemplated] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "contemplation") return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          setContemplated(true);
          if (allowReflection) setPhase("reflection");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [phase, allowReflection]);

  function skipToReflection() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setContemplated(true);
    if (allowReflection) setPhase("reflection");
    else finish();
  }

  function finish() {
    onComplete?.({ reflected: text.trim().length > 0, response: text.trim(), durationSec: durationSeconds });
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <h3 className="text-center font-serif text-2xl leading-tight sm:text-3xl">
        {question}
      </h3>
      <p className="text-center text-sm text-muted-foreground">
        Sit with the question. No need to answer.
      </p>

      {phase === "contemplation" && (
        <>
          {showTimer && (
            <div className="text-4xl font-light tabular-nums text-muted-foreground">
              {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={skipToReflection} className="text-muted-foreground">
            {allowReflection ? "I'm ready to reflect" : "Continue"}
          </Button>
        </>
      )}

      {phase === "reflection" && allowReflection && (
        <div className="w-full space-y-3">
          {reflectionPrompt && (
            <p className="text-sm text-muted-foreground">{reflectionPrompt}</p>
          )}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="If something arose, you may write it here. Or leave it empty."
            className="min-h-[120px] rounded-2xl border-border/40 bg-background/40"
          />
          <div className="flex justify-end">
            <Button onClick={finish} className="rounded-full px-6">
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
