// TheApologyCanvas — a slow-burning hearth that intensifies with words written
// and flickers on deletion. Mic envelope breathes the flame body.
import { useEffect, useRef } from "react";

export default function TheApologyCanvas({
  envelope,
  intensity,    // 0..1 driven by chars typed
  flickerPulse, // increments on deletion
}: {
  envelope: number;
  intensity: number;
  flickerPulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFlickerRef = useRef(0);
  const flickerRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (flickerPulse <= lastFlickerRef.current) return;
    lastFlickerRef.current = flickerPulse;
    flickerRef.current = 1;
  }, [flickerPulse]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      c.width = c.clientWidth * devicePixelRatio;
      c.height = c.clientHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      tRef.current += 0.016;
      flickerRef.current *= 0.93;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h * 0.62;
      const baseR = Math.min(w, h) * (0.06 + intensity * 0.18);
      const breath = 1 + Math.sin(tRef.current * 1.2) * 0.06 + envelope * 0.3 - flickerRef.current * 0.25;
      const r = baseR * breath;

      // Outer halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 4.5);
      halo.addColorStop(0, `rgba(255,150,80,${0.18 + intensity * 0.25})`);
      halo.addColorStop(0.5, `rgba(255,90,40,${0.06 + intensity * 0.1})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Flame body
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      core.addColorStop(0, `rgba(255,235,200,${0.85 - flickerRef.current * 0.4})`);
      core.addColorStop(0.45, `rgba(255,170,90,${0.55})`);
      core.addColorStop(1, "rgba(120,40,20,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // A few drifting embers
      const emberCount = Math.floor(4 + intensity * 10);
      for (let i = 0; i < emberCount; i++) {
        const seed = i * 12.9898;
        const off = (Math.sin(seed + tRef.current * 0.4) + 1) * 0.5;
        const ex = cx + Math.sin(tRef.current * 0.6 + i) * r * 1.6;
        const ey = cy - off * r * 3.2 - r * 0.4;
        const ea = (1 - off) * 0.55 * (0.4 + intensity);
        ctx.fillStyle = `rgba(255,200,140,${ea})`;
        ctx.beginPath();
        ctx.arc(ex, ey, 1.8 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [envelope, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
