import { useState } from "react";
import { Button } from "@/design-system";
import { Slider } from "@/design-system";

interface RatingSliderProps {
  min?: number;
  max?: number;
  step?: number;
  labels?: Record<number, string>;
  prompt?: string;
  showValue?: boolean;
  onComplete?: (payload: { value: number }) => void;
}

export function RatingSlider({
  min = 0,
  max = 10,
  step = 1,
  labels = {},
  prompt,
  showValue = true,
  onComplete,
}: RatingSliderProps) {
  const [value, setValue] = useState(Math.round((min + max) / 2));

  const midpoint = (min + max) / 2;
  const currentLabel = labels[value];

  return (
    <div className="flex flex-col gap-6 py-4">
      {prompt && <p className="text-center text-sm text-muted-foreground">{prompt}</p>}
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl font-light tabular-nums text-primary">
          {showValue ? value : "—"}
        </div>
        {currentLabel && (
          <p className="text-sm text-muted-foreground">{currentLabel}</p>
        )}
        <div className="w-full px-4">
          <Slider
            value={[value]}
            onValueChange={([v]) => setValue(v)}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground/60">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onComplete?.({ value })} className="rounded-full px-6">
          Continue
        </Button>
      </div>
    </div>
  );
}
