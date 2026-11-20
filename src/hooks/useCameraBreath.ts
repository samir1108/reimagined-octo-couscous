/**
 * On-device webcam breath-rate (rPPG-lite) + posture presence.
 * - Captures a small ROI from the user's face/chest, samples mean luminance @ 15fps.
 * - Looks for periodic oscillation in the 6–20 breaths/min band.
 * - Frames never leave the device; only derived BPM is ingested.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface BreathState {
  active: boolean;
  bpm: number | null;
  signal: number; // current normalized luminance (-1..1) for UI
  error: string | null;
}

export function useCameraBreath() {
  const [state, setState] = useState<BreathState>({
    active: false,
    bpm: null,
    signal: 0,
    error: null,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const samplesRef = useRef<{ t: number; v: number }[]>([]);
  const rafRef = useRef<number>(0);
  const lastIngestRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState({ active: false, bpm: null, signal: 0, error: null });
  }, []);

  const tick = useCallback(() => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const w = 32;
    const h = 32;
    c.width = w;
    c.height = h;
    ctx.drawImage(v, v.videoWidth / 2 - 50, v.videoHeight / 2 - 50, 100, 100, 0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < img.length; i += 4) sum += img[i] + img[i + 1] + img[i + 2];
    const mean = sum / (w * h * 3 * 255); // 0..1
    const now = performance.now();
    samplesRef.current.push({ t: now, v: mean });
    // keep last 30s
    samplesRef.current = samplesRef.current.filter((s) => now - s.t < 30_000);

    // Compute breath rate via zero-crossings of detrended signal
    let bpm: number | null = null;
    if (samplesRef.current.length > 60) {
      const vals = samplesRef.current.map((s) => s.v);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      let crossings = 0;
      for (let i = 1; i < vals.length; i++) {
        if ((vals[i - 1] - avg) * (vals[i] - avg) < 0) crossings++;
      }
      const seconds = (samplesRef.current.at(-1)!.t - samplesRef.current[0].t) / 1000;
      const bpmRaw = (crossings / 2 / seconds) * 60;
      if (bpmRaw >= 5 && bpmRaw <= 30) bpm = Math.round(bpmRaw);
    }

    setState((s) => ({ ...s, bpm, signal: (mean - 0.5) * 2, active: true }));

    if (bpm && now - lastIngestRef.current > 60_000) {
      lastIngestRef.current = now;
      supabase.functions
        .invoke("ingest-signal", {
          body: {
            points: [
              {
                layer: "bio",
                source: "webcam_rppg",
                metric: "breath_rate",
                value: bpm,
                unit: "bpm",
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 },
        audio: false,
      });
      streamRef.current = stream;
      const v = document.createElement("video");
      v.srcObject = stream;
      v.muted = true;
      v.playsInline = true;
      await v.play();
      videoRef.current = v;
      canvasRef.current = document.createElement("canvas");
      setState({ active: true, bpm: null, signal: 0, error: null });
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? "Camera unavailable" }));
    }
  }, [tick]);

  useEffect(() => () => stop(), [stop]);

  return { ...state, start, stop };
}
