import { useState } from "react";
import { Button } from "@/design-system";
import { Textarea } from "@/design-system";

interface IntentionSetterProps {
  prompt?: string;
  placeholder?: string;
  maxLength?: number;
  onComplete?: (payload: { text: string }) => void;
}

export function IntentionSetter({
  prompt = "What is your intention for this session?",
  placeholder = "I intend to...",
  maxLength = 200,
  onComplete,
}: IntentionSetterProps) {
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-center text-sm text-muted-foreground">{prompt}</p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        className="min-h-[120px] resize-none rounded-2xl border-border/40 bg-background/40 text-base leading-relaxed"
      />
      <div className="w-full text-right text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">
        {text.length} / {maxLength}
      </div>
      <Button
        disabled={!text.trim()}
        onClick={() => onComplete?.({ text: text.trim() })}
        className="rounded-full px-6"
      >
        Set intention
      </Button>
    </div>
  );
}
