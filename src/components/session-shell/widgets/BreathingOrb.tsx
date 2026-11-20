import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import HomeOrb from "@/components/orb/HomeOrb";

interface BreathingOrbProps {
  durationSeconds: number;
  pattern?: "natural" | "box" | "4-7-8" | "coherent";
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  pauseSeconds?: number;
  showPhaseText?: boolean;
  showOrb?: boolean;
  soundEnabled?: boolean;
  onComplete?: (payload: { completedSeconds: number; cycles: number }) => void;
}

const PATTERNS: Record<string, { inhale: number; hold: number; exhale: number; pause: number }> = {
  natural: { inhale: 4, hold: 0, exhale: 4, pause: 0 },
  box: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, pause: 0 },
  coherent: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
};

export function BreathingOrb({
  durationSeconds,
  pattern = "natural",
  inhaleSeconds,
  holdSeconds,
  exhaleSeconds,
  pauseSeconds,
  showPhaseText = true,
  showOrb = true,
  soundEnabled = false,
  onComplete,
}: BreathingOrbProps) {
  const p = PATTERNS[pattern] ?? PATTERNS.natural;
  const inh = inhaleSeconds ?? p.inhale;
  const hold = holdSeconds ?? p.hold;
  const exh = exhaleSeconds ?? p.exhale;
  const pause = pauseSeconds ?? p.pause;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "pause">("inhale");
  const [phaseRemaining, setPhaseRemaining] = useState(inh);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= durationSeconds) {
          setRunning(false);
          if (onComplete) onComplete({ completedSeconds: next, cycles });
        }
        return next;
      });
      setPhaseRemaining((pr) => {
        if (pr <= 1) {
          setPhase((prev) => {
            if (prev === "inhale") {
              if (hold > 0) { setPhaseRemaining(hold); return "hold"; }
              setPhaseRemaining(exh); return "exhale";
            }
            if (prev === "hold") { setPhaseRemaining(exh); return "exhale"; }
            if (prev === "exhale") {
              if (pause > 0) { setPhaseRemaining(pause); return "pause"; }
              setCycles((c) => c + 1);
              setPhaseRemaining(inh); return "inhale";
            }
            setCycles((c) => c + 1);
            setPhaseRemaining(inh); return "inhale";
          });
          return pr;
        }
        return pr - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, durationSeconds, inh, hold, exh, pause, cycles, onComplete]);

  const scale = phase === "inhale" ? 1 + (inh - phaseRemaining) / inh * 0.4
    : phase === "hold" ? 1.4
    : phase === "exhale" ? 1.4 - (exh - phaseRemaining) / exh * 0.4
    : 1.0;

  const phaseLabel = phase === "inhale" ? "Inhale" : phase === "hold" ? "Hold" : phase === "exhale" ? "Exhale" : "Pause";

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {showOrb && (
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div
            className="absolute inset-0 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${scale})` }}
          >
            <HomeOrb className="absolute inset-0" />
          </div>
          <span className="z-10 text-3xl font-light tabular-nums text-gold-100 drop-shadow-[0_0_12px_hsl(var(--gold-500)/0.55)]">
            {phaseRemaining}
          </span>
        </div>
      )}
      {showPhaseText && (
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            {running ? phaseLabel : elapsed >= durationSeconds ? "Complete" : "Tap to begin"}
          </p>
          <p className="mt-1 text-lg font-light tabular-nums text-muted-foreground">
            {Math.max(0, durationSeconds - elapsed)}s · {cycles} cycles
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        {!running && elapsed < durationSeconds && (
          <Button onClick={() => setRunning(true)} className="rounded-full px-6">
            {elapsed > 0 ? "Resume" : "Begin"}
          </Button>
        )}
        {running && (
          <Button onClick={() => setRunning(false)} variant="outline" className="rounded-full px-6">
            Pause
          </Button>
        )}
        {elapsed >= durationSeconds && onComplete && (
          <Button onClick={() => onComplete({ completedSeconds: elapsed, cycles })} className="rounded-full px-6">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
