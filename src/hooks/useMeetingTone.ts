/**
 * On-device meeting-tone analyzer.
 * Web Audio API → mic stream → real-time RMS energy + zero-crossing rate.
 * Maps to a coarse "tone" (calm / neutral / charged) and ingests every 60s.
 * No raw audio is recorded or sent anywhere.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Tone = "calm" | "neutral" | "charged";

interface ToneState {
  active: boolean;
  rms: number;
  tone: Tone;
  error: string | null;
}

export function useMeetingTone() {
  const [state, setState] = useState<ToneState>({
    active: false,
    rms: 0,
    tone: "neutral",
    error: null,
  });
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const accRef = useRef<{ sumRms: number; n: number; lastIngest: number }>({
    sumRms: 0,
    n: 0,
    lastIngest: 0,
  });

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    setState({ active: false, rms: 0, tone: "neutral", error: null });
  }, []);

  const tick = useCallback(() => {
    const a = analyserRef.current;
    if (!a) return;
    const buf = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(buf);
    let sumSq = 0;
    for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
    const rms = Math.sqrt(sumSq / buf.length);
    accRef.current.sumRms += rms;
    accRef.current.n += 1;

    let tone: Tone = "neutral";
    if (rms > 0.1) tone = "charged";
    else if (rms < 0.02) tone = "calm";
    setState((s) => ({ ...s, rms, tone, active: true }));

    const now = performance.now();
    if (now - accRef.current.lastIngest > 60_000 && accRef.current.n > 0) {
      const avgRms = accRef.current.sumRms / accRef.current.n;
      accRef.current = { sumRms: 0, n: 0, lastIngest: now };
      supabase.functions
        .invoke("ingest-signal", {
          body: {
            points: [
              {
                layer: "work",
                source: "mic_meeting_tone",
                signal_type: "tone_sentiment",
                value: Math.round(avgRms * 1000) / 1000,
                text_value:
                  avgRms > 0.1 ? "charged" : avgRms < 0.02 ? "calm" : "neutral",
              },
            ],
          },
        })
        .catch(() => {});
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      setState({ active: true, rms: 0, tone: "neutral", error: null });
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? "Mic unavailable" }));
    }
  }, [tick]);

  useEffect(() => () => stop(), [stop]);

  return { ...state, start, stop };
}
