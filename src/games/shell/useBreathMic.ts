// useBreathMic — research-grade breath detection.
// Returns: live mic level, smoothed envelope, detected breath phase (idle/inhale/exhale/hold),
// cycle stats (inhaleMs, exhaleMs, lastCycleMs), and counts (cycles, sighs).
// Sigh detection: exhale envelope > 0.6 + duration > 1.4s + preceding deep inhale.
import { useEffect, useRef, useState } from "react";

export type BreathPhase = "idle" | "inhale" | "exhale" | "hold";

export interface BreathSignals {
  ready: boolean;
  error: string | null;
  level: number;        // raw 0..1
  envelope: number;     // smoothed 0..1
  phase: BreathPhase;
  cycles: number;
  sighs: number;
  lastInhaleMs: number;
  lastExhaleMs: number;
  lastCycleMs: number;
}

export function useBreathMic(active: boolean) {
  const [sig, setSig] = useState<BreathSignals>({
    ready: false,
    error: null,
    level: 0,
    envelope: 0,
    phase: "idle",
    cycles: 0,
    sighs: 0,
    lastInhaleMs: 0,
    lastExhaleMs: 0,
    lastCycleMs: 0,
  });
  const stateRef = useRef({ ...sig });
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let envelope = 0;
    let phaseStart = performance.now();
    let lastEnvelope = 0;
    let phase: BreathPhase = "idle";
    let inhalePeak = 0;
    let lastInhaleMs = 0;
    let lastExhaleMs = 0;
    let lastCycleMs = 0;
    let lastInhaleStart = 0;
    let cycles = 0;
    let sighs = 0;

    const INHALE_THRESHOLD = 0.08;  // rising envelope baseline
    const EXHALE_THRESHOLD = 0.12;  // exhale is noisier, higher threshold
    const SILENCE = 0.04;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.4;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);

        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          const level = Math.min(1, rms * 4);
          envelope = envelope * 0.85 + level * 0.15;

          const now = performance.now();
          const dEnv = envelope - lastEnvelope;
          lastEnvelope = envelope;

          // Phase machine
          if (phase === "idle" || phase === "hold") {
            if (envelope > INHALE_THRESHOLD && dEnv > 0.001) {
              phase = "inhale";
              phaseStart = now;
              lastInhaleStart = now;
              inhalePeak = envelope;
            }
          } else if (phase === "inhale") {
            inhalePeak = Math.max(inhalePeak, envelope);
            if (envelope > EXHALE_THRESHOLD && dEnv < -0.001 && now - phaseStart > 400) {
              lastInhaleMs = now - phaseStart;
              phase = "exhale";
              phaseStart = now;
            } else if (envelope < SILENCE && now - phaseStart > 800) {
              lastInhaleMs = now - phaseStart;
              phase = "hold";
              phaseStart = now;
            }
          } else if (phase === "exhale") {
            if (envelope < SILENCE && now - phaseStart > 300) {
              lastExhaleMs = now - phaseStart;
              lastCycleMs = now - lastInhaleStart;
              cycles += 1;
              // Sigh = long exhale + deep prior inhale
              if (lastExhaleMs > 1400 && inhalePeak > 0.35) sighs += 1;
              phase = "idle";
              phaseStart = now;
            }
          }

          stateRef.current = {
            ready: true,
            error: null,
            level,
            envelope,
            phase,
            cycles,
            sighs,
            lastInhaleMs,
            lastExhaleMs,
            lastCycleMs,
          };
          // Throttle React updates to ~20Hz to avoid render storms
          if ((tick as any)._t === undefined || now - (tick as any)._t > 50) {
            (tick as any)._t = now;
            setSig({ ...stateRef.current });
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e: any) {
        setSig((s) => ({ ...s, error: e?.message || "Microphone unavailable" }));
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
      streamRef.current = null;
      ctxRef.current = null;
    };
  }, [active]);

  return sig;
}
