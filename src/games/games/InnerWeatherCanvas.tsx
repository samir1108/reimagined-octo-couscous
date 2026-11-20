// InnerWeatherCanvas — a slow, painterly weather front. Color drifts with
// envelope (agitation = warmer/redder, calm = cool blue). Soft drifting clouds.
import { useEffect, useRef } from "react";

interface Props { envelope: number; iterations: number; }

export default function InnerWeatherCanvas({ envelope, iterations }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, iter: 0, t: 0 });
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.iter = iterations; }, [iterations]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true }); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Iteration → calmer, more saturated
      const calm = Math.min(1, s.iter / 5);
      const heat = Math.max(0, 1 - calm) * 0.5 + s.env * 0.5;
      const r = Math.round(60 + heat * 140);
      const g = Math.round(80 + (1 - heat) * 60);
      const b = Math.round(140 + (1 - heat) * 60);

      // 3 drifting clouds
      for (let i = 0; i < 3; i++) {
        const phase = i * 1.7 + s.t * 0.06;
        const cx = w * (0.3 + 0.4 * Math.sin(phase));
        const cy = h * (0.4 + 0.25 * Math.cos(phase * 0.8));
        const rad = Math.min(w, h) * (0.35 + 0.05 * Math.sin(phase * 1.3));
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grd.addColorStop(0, `rgba(${r},${g},${b},${0.10 + s.env * 0.10})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
