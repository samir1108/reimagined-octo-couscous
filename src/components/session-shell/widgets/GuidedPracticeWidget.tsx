import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/design-system";
import { Pause, Play } from "lucide-react";

export interface GuidedPhase {
  label: string;
  seconds: number;
  cue?: string;
}

interface GuidedPracticeWidgetProps {
  phases?: GuidedPhase[];
  autoStart?: boolean;
  onComplete?: (payload: { completedPhases: number; durationSec: number }) => void;
}

interface GuidedState {
  index: number;
  remaining: number;
  elapsed: number;
  done: boolean;
}

function format(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function GuidedPracticeWidget({
  phases = [{ label: "Practice", seconds: 180 }],
  autoStart = false,
  onComplete,
}: GuidedPracticeWidgetProps) {
  const safePhases = useMemo(
    () => (phases.length ? phases : [{ label: "Practice", seconds: 180 }]),
    [phases],
  );
  const total = safePhases.reduce((sum, phase) => sum + Math.max(1, phase.seconds), 0);
  const [state, setState] = useState<GuidedState>({
    index: 0,
    remaining: Math.max(1, safePhases[0].seconds),
    elapsed: 0,
    done: false,
  });
  const [running, setRunning] = useState(autoStart);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!running || state.done) return;
    const timer = window.setInterval(() => {
      setState((prev) => {
        if (prev.done) return prev;
        const elapsed = prev.elapsed + 1;
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1, elapsed };
        }
        const next = prev.index + 1;
        if (next >= safePhases.length) {
          return { index: prev.index, remaining: 0, elapsed, done: true };
        }
        return { index: next, remaining: Math.max(1, safePhases[next].seconds), elapsed, done: false };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, state.done, safePhases]);

  useEffect(() => {
    if (state.done && !completedRef.current) {
      completedRef.current = true;
      onComplete?.({ completedPhases: safePhases.length, durationSec: total });
    }
  }, [state.done, onComplete, safePhases.length, total]);

  const phase = safePhases[Math.min(state.index, safePhases.length - 1)];
  const progress = total > 0 ? Math.min(1, state.elapsed / total) : 0;

  function advance() {
    setState((prev) => {
      const next = prev.index + 1;
      if (next >= safePhases.length) {
        return { ...prev, done: true, remaining: 0 };
      }
      return { ...prev, index: next, remaining: Math.max(1, safePhases[next].seconds) };
    });
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative flex h-44 w-44 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full opacity-70 blur-2xl"
          style={{ background: `conic-gradient(from 0deg, hsl(var(--primary) / 0.55) ${progress * 360}deg, transparent 0deg)` }}
        />
        <div className="relative flex h-40 w-40 flex-col items-center justify-center rounded-full border border-border/40 bg-background/60 backdrop-blur">
          <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {state.done ? "Complete" : phase.label}
          </span>
          <span className="mt-1 text-4xl font-extralight tabular-nums">{format(state.remaining)}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {Math.min(state.index + 1, safePhases.length)} / {safePhases.length}
          </span>
        </div>
      </div>

      {phase.cue && !state.done && (
        <p className="max-w-md text-center text-sm leading-relaxed text-muted-foreground">{phase.cue}</p>
      )}

      <div className="h-1 w-full max-w-sm overflow-hidden rounded-full bg-border/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-1000"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        {!state.done ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setRunning((value) => !value)} className="rounded-full">
              {running ? <Pause className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}
              {running ? "Pause" : "Resume"}
            </Button>
            <Button variant="ghost" size="sm" onClick={advance} className="rounded-full text-muted-foreground">
              Next phase
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">The practice is complete.</span>
        )}
      </div>
    </div>
  );
}
