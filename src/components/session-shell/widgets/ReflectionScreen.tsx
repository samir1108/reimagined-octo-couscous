import { Button } from "@/design-system";
import { Textarea } from "@/design-system";
import { useState } from "react";

interface ReflectionScreenProps {
  durationSeconds?: number;
  prompt?: string;
  allowJournaling?: boolean;
  guidedQuestions?: string[];
  showTimer?: boolean;
  integrationPrompt?: string;
  onComplete?: (payload: { reflected: boolean; responses: string[] }) => void;
}

export function ReflectionScreen({
  durationSeconds,
  prompt,
  allowJournaling = true,
  guidedQuestions = [],
  showTimer = false,
  integrationPrompt,
  onComplete,
}: ReflectionScreenProps) {
  const [answers, setAnswers] = useState<string[]>(guidedQuestions.map(() => ""));
  const [freeText, setFreeText] = useState("");

  function handleComplete() {
    const responses = [...answers, freeText].filter((s) => s.trim().length > 0);
    onComplete?.({ reflected: responses.length > 0, responses });
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {prompt && <p className="text-center text-sm text-muted-foreground">{prompt}</p>}

      {guidedQuestions.map((q, i) => (
        <div key={i} className="space-y-2">
          <p className="text-sm font-medium">{q}</p>
          <Textarea
            value={answers[i]}
            onChange={(e) => {
              const next = [...answers];
              next[i] = e.target.value;
              setAnswers(next);
            }}
            placeholder="..."
            className="min-h-[60px] rounded-2xl border-border/40 bg-background/40"
          />
        </div>
      ))}

      {allowJournaling && (
        <div className="space-y-2">
          {guidedQuestions.length === 0 && (
            <p className="text-sm text-muted-foreground">What did you notice?</p>
          )}
          <Textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Write freely..."
            className="min-h-[100px] rounded-2xl border-border/40 bg-background/40"
          />
        </div>
      )}

      {integrationPrompt && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">{integrationPrompt}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleComplete} className="rounded-full px-6">
          Continue
        </Button>
      </div>
    </div>
  );
}
