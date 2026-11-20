// useFaceCam — front-camera frame analyzer.
// Returns frame brightness, motion (frame-to-frame delta), and faceLikely heuristic
// (high center-region skin-tone variance). Used by Two Mirrors, Heart Coherence Bridge,
// Cold Water, Witness gaze stability, etc. No external models = zero install footprint.
import { useEffect, useRef, useState } from "react";

export interface FaceCamSignals {
  ready: boolean;
  error: string | null;
  brightness: number;   // 0..1 mean luminance
  motion: number;       // 0..1 frame delta
  faceLikely: number;   // 0..1 heuristic
  videoEl: HTMLVideoElement | null;
}

export function useFaceCam(active: boolean) {
  const [sig, setSig] = useState<FaceCamSignals>({
    ready: false,
    error: null,
    brightness: 0,
    motion: 0,
    faceLikely: 0,
    videoEl: null,
  });
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPxRef = useRef<Uint8ClampedArray | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 320, height: 240 },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        await video.play();
        videoRef.current = video;
        const canvas = document.createElement("canvas");
        canvas.width = 80;
        canvas.height = 60;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        let lastSet = 0;
        const tick = () => {
          if (cancelled) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let lum = 0;
          let skinHits = 0;
          let motionSum = 0;
          const last = lastPxRef.current;
          for (let i = 0; i < frame.length; i += 4) {
            const r = frame[i], g = frame[i + 1], b = frame[i + 2];
            const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            lum += l;
            // Naive skin heuristic
            if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skinHits++;
            if (last) {
              motionSum += Math.abs(frame[i] - last[i]) + Math.abs(frame[i + 1] - last[i + 1]) + Math.abs(frame[i + 2] - last[i + 2]);
            }
          }
          const px = canvas.width * canvas.height;
          const brightness = lum / px;
          const motion = last ? Math.min(1, motionSum / (px * 90)) : 0;
          const faceLikely = Math.min(1, skinHits / (px * 0.25));
          lastPxRef.current = new Uint8ClampedArray(frame);

          const now = performance.now();
          if (now - lastSet > 80) {
            lastSet = now;
            setSig({ ready: true, error: null, brightness, motion, faceLikely, videoEl: video });
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e: any) {
        setSig((s) => ({ ...s, error: e?.message || "Camera unavailable" }));
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      videoRef.current = null;
      lastPxRef.current = null;
    };
  }, [active]);

  return sig;
}
