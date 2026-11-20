import { useState } from "react";
import { Button } from "@/design-system";

interface JapCounterProps {
  targetCount?: number;
  mantra?: string;
  showMala?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  showProgress?: boolean;
  onComplete?: (payload: { count: number; targetCount: number }) => void;
}

export function JapCounter({
  targetCount = 108,
  mantra = "ॐ",
  showMala = true,
  soundEnabled = false,
  vibrationEnabled = false,
  showProgress = true,
  onComplete,
}: JapCounterProps) {
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);

  const circumference = 2 * Math.PI * 56;
  const pct = count / targetCount;
  const strokeDashoffset = circumference * (1 - pct);

  function increment() {
    const next = count + 1;
    if (next >= targetCount) {
      setRounds((r) => r + 1);
      setCount(0);
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
      if (soundEnabled) playBell();
    } else {
      setCount(next);
      if (vibrationEnabled && navigator.vibrate) navigator.vibrate(10);
    }
  }

  function playBell() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 432;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch {}
  }

  const totalRepetitions = rounds * targetCount + count;

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <p className="font-serif text-4xl text-primary">{mantra}</p>
      </div>

      {showMala && (
        <div className="relative flex h-40 w-40 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" className="text-border/30" />
            <circle
              cx="60" cy="60" r="56" fill="none"
              stroke="currentColor" strokeWidth="3"
              className="text-primary/80 transition-all duration-200"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center">
            <span className="text-3xl font-light tabular-nums">{count}</span>
            <span className="text-sm text-muted-foreground"> / {targetCount}</span>
          </div>
        </div>
      )}

      {!showMala && (
        <div className="text-center">
          <span className="text-5xl font-light tabular-nums">{count}</span>
          <span className="text-lg text-muted-foreground"> / {targetCount}</span>
        </div>
      )}

      {showProgress && (
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
          {rounds > 0 ? `${rounds} round${rounds > 1 ? "s" : ""} · ` : ""}{totalRepetitions} total
        </p>
      )}

      <button
        onClick={increment}
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-3xl font-serif text-primary transition-all hover:scale-105 hover:bg-primary/20 active:scale-95"
      >
        {mantra}
      </button>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setCount(0); setRounds(0); }}
          className="text-muted-foreground"
        >
          Reset
        </Button>
        <Button
          onClick={() => onComplete?.({ count: totalRepetitions, targetCount })}
          className="rounded-full px-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
