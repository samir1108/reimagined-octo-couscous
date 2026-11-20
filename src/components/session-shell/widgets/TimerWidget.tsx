import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";
import { Play, Pause, RotateCcw } from "lucide-react";
import HomeOrb from "@/components/orb/HomeOrb";

interface TimerWidgetProps {
  durationSeconds: number;
  mode?: "countdown" | "stopwatch" | "interval";
  intervalSeconds?: number;
  intervalCount?: number;
  showOrb?: boolean;
  showPhase?: boolean;
  phases?: { name: string; durationSeconds: number }[];
  autoStart?: boolean;
  gentleBell?: boolean;
  onComplete?: (payload: { elapsedSeconds: number }) => void;
  onTick?: (remaining: number) => void;
}

export function TimerWidget({
  durationSeconds,
  mode = "countdown",
  intervalSeconds,
  intervalCount,
  showOrb = false,
  showPhase = false,
  phases,
  autoStart = false,
  gentleBell = true,
  onComplete,
  onTick,
}: TimerWidgetProps) {
  const [running, setRunning] = useState(autoStart);
  const [elapsed, setElapsed] = useState(0);
  const [intervalIndex, setIntervalIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const total = durationSeconds;
  const remaining = Math.max(0, total - elapsed);
  const pct = total > 0 ? elapsed / total : 0;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (onTick) onTick(Math.max(0, total - next));
        if (next >= total) {
          setRunning(false);
          if (gentleBell) playBell();
          if (onComplete) onComplete({ elapsedSeconds: next });
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, total, gentleBell, onComplete, onTick]);

  function playBell() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 528;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.start();
      osc.stop(ctx.currentTime + 2);
    } catch {}
  }

  function reset() {
    setElapsed(0);
    setRunning(false);
    setIntervalIndex(0);
  }

  const currentPhase = phases
    ? phases.reduce((acc, p, i) => {
        const cum = phases.slice(0, i + 1).reduce((s, x) => s + x.durationSeconds, 0);
        return elapsed < cum ? p : acc;
      }, phases[0])
    : null;

  const displayTime = mode === "stopwatch" ? elapsed : remaining;
  const mins = Math.floor(displayTime / 60);
  const secs = displayTime % 60;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {showOrb && (
        <div className="relative flex h-32 w-32 items-center justify-center">
          <HomeOrb className="absolute inset-0" />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/40" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke="currentColor" strokeWidth="2"
              className="text-primary/70 transition-all duration-1000"
              strokeDasharray={2 * Math.PI * 46}
              strokeDashoffset={2 * Math.PI * 46 * (1 - pct)}
              strokeLinecap="round"
            />
          </svg>
          <span className="z-10 text-2xl font-light tabular-nums text-gold-50 drop-shadow-[0_0_10px_hsl(var(--gold-500)/0.5)]">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      )}
      {!showOrb && (
        <span className="text-5xl font-light tabular-nums">
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      )}
      {showPhase && currentPhase && (
        <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">{currentPhase.name}</p>
      )}
      <div className="flex items-center gap-3">
        {!running && elapsed < total && (
          <Button onClick={() => setRunning(true)} size="sm" className="rounded-full px-5">
            <Play className="mr-1 h-3.5 w-3.5" /> {elapsed > 0 ? "Resume" : "Begin"}
          </Button>
        )}
        {running && (
          <Button onClick={() => setRunning(false)} size="sm" variant="outline" className="rounded-full px-5">
            <Pause className="mr-1 h-3.5 w-3.5" /> Pause
          </Button>
        )}
        {elapsed > 0 && !running && (
          <Button onClick={reset} size="sm" variant="ghost" className="rounded-full px-5">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        )}
        {elapsed >= total && onComplete && (
          <Button onClick={() => onComplete({ elapsedSeconds: elapsed })} size="sm" className="rounded-full px-5">
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
