import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { Eye, Plus } from "lucide-react";

interface ObservationScreenProps {
  durationSeconds: number;
  focus?: "thoughts" | "emotions" | "sensations" | "sounds" | "breath" | "open";
  allowLogging?: boolean;
  categories?: string[];
  showTimer?: boolean;
  showCounter?: boolean;
  onComplete?: (payload: { count: number; durationSec: number; categories?: Record<string, number> }) => void;
}

export function ObservationScreen({
  durationSeconds,
  focus = "open",
  allowLogging = true,
  categories = [],
  showTimer = true,
  showCounter = true,
  onComplete,
}: ObservationScreenProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const [count, setCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, []);

  const done = remaining === 0;
  const pct = 1 - remaining / durationSeconds;

  function notice() {
    setCount((c) => c + 1);
    if (selectedCategory) {
      setCategoryCounts((prev) => ({
        ...prev,
        [selectedCategory]: (prev[selectedCategory] ?? 0) + 1,
      }));
    }
  }

  const focusLabels: Record<string, string> = {
    thoughts: "Watch whatever appears in the mind.",
    emotions: "Notice what you feel, without changing it.",
    sensations: "Observe sensations in the body.",
    sounds: "Listen to sounds around and within.",
    breath: "Watch the breath, without controlling it.",
    open: "Watch whatever appears. Do not change anything.",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-center text-lg leading-relaxed text-foreground/90">
        {focusLabels[focus]}
      </p>

      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/40" />
          <circle
            cx="50" cy="50" r="46" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            className="text-foreground/70 transition-all duration-1000"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - pct)}
            strokeLinecap="round"
          />
        </svg>
        {showTimer && (
          <span className="text-3xl font-light tabular-nums">
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>

      {allowLogging && (
        <div className="flex flex-col items-center gap-3">
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    selectedCategory === cat
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border/40 bg-background/40 text-muted-foreground hover:bg-background/60"
                  }`}
                >
                  {cat} {categoryCounts[cat] ? `(${categoryCounts[cat]})` : ""}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={notice}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-5 py-2 text-sm backdrop-blur transition hover:bg-background/60"
          >
            <Eye className="h-4 w-4" /> Notice {showCounter && <span className="tabular-nums">· {count}</span>}
          </button>
        </div>
      )}

      {!allowLogging && showCounter && (
        <p className="text-sm text-muted-foreground/60">Thoughts noticed: {count}</p>
      )}

      <div className="flex items-center gap-3">
        <Button
          disabled={!done}
          onClick={() => onComplete?.({ count, durationSec: durationSeconds, categories: categoryCounts })}
          className="rounded-full px-6"
        >
          {done ? "Continue" : "Sit until the bell"}
        </Button>
      </div>
    </div>
  );
}
