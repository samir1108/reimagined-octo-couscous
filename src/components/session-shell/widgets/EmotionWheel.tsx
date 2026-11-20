import { useState } from "react";
import { Button } from "@/design-system";

const DEFAULT_EMOTIONS = ["calm","anxious","sad","angry","joyful","tired","hopeful","overwhelmed"];

interface EmotionWheelProps {
  emotions?: string[];
  allowIntensity?: boolean;
  prompt?: string;
  onComplete?: (payload: { emotion: string; intensity: number }) => void;
}

export function EmotionWheel({
  emotions = DEFAULT_EMOTIONS,
  allowIntensity = true,
  prompt,
  onComplete,
}: EmotionWheelProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {prompt && <p className="text-center text-sm text-muted-foreground">{prompt}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        {emotions.map((e) => (
          <button
            key={e}
            onClick={() => setSelected(e)}
            className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
              selected === e
                ? "border-primary bg-primary/20 text-primary"
                : "border-border/40 bg-background/40 text-muted-foreground hover:bg-background/60"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      {allowIntensity && selected && (
        <div className="w-full max-w-xs space-y-2">
          <label className="text-xs uppercase tracking-[0.24em] text-muted-foreground/60">Intensity · {intensity}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
      <Button
        disabled={!selected}
        onClick={() => selected && onComplete?.({ emotion: selected, intensity })}
        className="rounded-full px-6"
      >
        Continue
      </Button>
    </div>
  );
}
