// Shared helpers used across many lab games.
import { useEffect, useRef, useState } from "react";

export function useCountdown(totalMs: number, onDone: () => void, active = true) {
  const [remaining, setRemaining] = useState(totalMs);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    startRef.current = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, totalMs - (Date.now() - startRef.current));
      setRemaining(left);
      if (left <= 0 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(id);
        onDone();
      }
    }, 200);
    return () => clearInterval(id);
  }, [totalMs, active, onDone]);
  return remaining;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
