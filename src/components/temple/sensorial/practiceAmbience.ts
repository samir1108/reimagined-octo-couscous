/**
 * practiceAmbience — procedurally generated ambient audio bed for any
 * sensorial practice. No external assets; uses WebAudio oscillators + a
 * gentle bell every ~25s. The narration TTS *ducks* this bed automatically.
 *
 * Design rules:
 *   • Never fail loudly — if WebAudio is unavailable, all functions noop.
 *   • Volume tops out at ~0.06 (very subtle, must not drown the master).
 *   • Stop everything on unmount.
 */
import { useEffect, useRef, useCallback } from "react";

type Ambience = {
  start: () => void;
  duck: () => void;   // narration is playing — drop bed to ~30%
  swell: () => void;  // silence/breath step — bring bed back fully
  stop: () => void;
};

export function usePracticeAmbience(): Ambience {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const bellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const fullVolRef = useRef(0.06);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const Ctor: typeof AudioContext =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      return ctx;
    } catch {
      return null;
    }
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    startedRef.current = true;

    // Two detuned low drones (root + perfect fifth) — warm, cave-like.
    const drone = (freq: number, gain: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g).connect(masterRef.current!);
      o.start();
      return { o, g };
    };
    drone(110, 0.5);          // A2
    drone(164.81, 0.32);      // E3
    drone(55, 0.28);           // A1 sub

    // Slow LFO on master gain for a breathing feel.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(masterRef.current!.gain);
    lfo.start();

    // Fade in.
    const now = ctx.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(0, now);
    masterRef.current.gain.linearRampToValueAtTime(fullVolRef.current, now + 4);

    // Occasional soft singing-bowl strike.
    const strike = () => {
      if (!ctxRef.current || !masterRef.current) return;
      const c = ctxRef.current;
      const t0 = c.currentTime;
      const partials = [261.63, 523.25, 783.99]; // C4, C5, G5
      partials.forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(0.025 / (i + 1), t0 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 5);
        o.connect(g).connect(masterRef.current!);
        o.start(t0);
        o.stop(t0 + 5.2);
      });
    };
    bellTimerRef.current = setInterval(strike, 25000 + Math.random() * 8000);
  }, [ensure]);

  const setVol = useCallback((v: number, time = 1.2) => {
    if (!ctxRef.current || !masterRef.current) return;
    const now = ctxRef.current.currentTime;
    masterRef.current.gain.cancelScheduledValues(now);
    masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, now);
    masterRef.current.gain.linearRampToValueAtTime(v, now + time);
  }, []);

  const duck = useCallback(() => setVol(fullVolRef.current * 0.3, 0.6), [setVol]);
  const swell = useCallback(() => setVol(fullVolRef.current, 1.6), [setVol]);

  const stop = useCallback(() => {
    if (bellTimerRef.current) clearInterval(bellTimerRef.current);
    bellTimerRef.current = null;
    if (ctxRef.current && masterRef.current) {
      const now = ctxRef.current.currentTime;
      masterRef.current.gain.cancelScheduledValues(now);
      masterRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
    }
    setTimeout(() => {
      try { ctxRef.current?.close(); } catch { /* ignore */ }
      ctxRef.current = null;
      masterRef.current = null;
      startedRef.current = false;
    }, 1000);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, duck, swell, stop };
}

/* ─── Haptics: gentle breath pacing on mobile ─── */
export function breathHaptic(phase: "in" | "out") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    // Inhale = single soft pulse; exhale = two even softer.
    navigator.vibrate(phase === "in" ? 40 : [25, 80, 25]);
  } catch { /* ignore */ }
}
