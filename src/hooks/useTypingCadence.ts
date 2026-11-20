/**
 * Typing cadence biometric.
 * Tracks keystroke inter-arrival times globally; computes WPM and a
 * jitter score (proxy for anxiety vs. flow). Ingests every 5 min.
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export function useTypingCadence(enabled = true) {
  const timesRef = useRef<number[]>([]);
  const lastFlushRef = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const flush = async () => {
      const times = timesRef.current;
      timesRef.current = [];
      lastFlushRef.current = Date.now();
      if (times.length < 20) return;
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) intervals.push(times[i] - times[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance =
        intervals.reduce((a, b) => a + (b - avg) ** 2, 0) / intervals.length;
      const jitter = Math.sqrt(variance);
      const wpm = avg > 0 ? 60_000 / avg / 5 : 0;

      try {
        await supabase.functions.invoke("ingest-signal", {
          body: {
            points: [
              {
                layer: "device",
                source: "keyboard_cadence",
                signal_type: "typing_wpm",
                category: jitter > 250 ? "anxious" : jitter < 80 ? "flow" : "neutral",
                value: Math.round(wpm),
                meta: { jitter_ms: Math.round(jitter) },
              },
            ],
          },
        });
      } catch {
        /* silent */
      }
    };

    const onKey = () => {
      timesRef.current.push(performance.now());
      if (timesRef.current.length > 1000) timesRef.current = timesRef.current.slice(-500);
    };

    window.addEventListener("keydown", onKey);
    const interval = window.setInterval(flush, 5 * 60_000);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearInterval(interval);
      flush();
    };
  }, [enabled]);
}
