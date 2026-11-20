import { useEffect, useRef, useState } from "react";
import { Button } from "@/design-system";

interface BreathHoldTimerProps {
  rounds?: number;
  inhaleSeconds?: number;
  holdSeconds?: number;
  exhaleSeconds?: number;
  restSeconds?: number;
  showOrb?: boolean;
  onComplete?: (payload: { completedRounds: number }) => void;
}

type Phase = "inhale" | "hold" | "exhale" | "rest";

export function BreathHoldTimer({
  rounds = 4,
  inhaleSeconds = 4,
  holdSeconds = 4,
  exhaleSeconds = 4,
  restSeconds = 2,
  onComplete,
}: BreathHoldTimerProps) {
  const [phase, setPhase] = useState<Phase>("inhale");
  const [remaining, setRemaining] = useState(inhaleSeconds);
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);
  const completedRef = useRef(0);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // advance phase
        if (phase === "inhale") { setPhase("hold"); return holdSeconds; }
        if (phase === "hold") { setPhase("exhale"); return exhaleSeconds; }
        if (phase === "exhale") {
          if (round >= rounds) { setDone(true); completedRef.current = rounds; return 0; }
          setPhase("rest"); return restSeconds;
        }
        if (phase === "rest") { setRound((x) => x + 1); setPhase("inhale"); return inhaleSeconds; }
        return r;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, round, done, rounds, inhaleSeconds, holdSeconds, exhaleSeconds, restSeconds]);

  const labels: Record<Phase, string> = {
    inhale: "Inhale",
    hold: "Hold",
    exhale: "Exhale",
    rest: "Rest",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
        Round {Math.min(round, rounds)} / {rounds}
      </p>
      <div className="flex h-32 w-32 items-center justify-center rounded-full border border-border/40 bg-background/40">
        <span className="text-4xl font-light tabular-nums">{done ? "✓" : remaining}</span>
      </div>
      <p className="font-serif text-xl text-primary/80">{done ? "Complete" : labels[phase]}</p>
      {done && (
        <Button onClick={() => onComplete?.({ completedRounds: completedRef.current })} className="rounded-full px-6">
          Continue
        </Button>
      )}
    </div>
  );
}
