import { useEffect, useRef, useState } from "react";

/**
 * Mic level hook. Returns { level: 0..1, ready, error }.
 * level is smoothed RMS amplitude. Auto-cleans on unmount.
 */
export function useMicLevel(active: boolean) {
  const [level, setLevel] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        ctxRef.current = ctx;
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        let smoothed = 0;
        const tick = () => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          smoothed = smoothed * 0.7 + rms * 0.3;
          setLevel(Math.min(1, smoothed * 4));
          rafRef.current = requestAnimationFrame(tick);
        };
        setReady(true);
        tick();
      } catch (e: any) {
        setError(e?.message || "Microphone unavailable");
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

  return { level, ready, error };
}
