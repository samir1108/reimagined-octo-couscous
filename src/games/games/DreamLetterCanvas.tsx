// DreamLetterCanvas — soft hypnagogic fog. Drifting amorphous shapes that
// brighten with envelope (the dream becoming articulated).
import { useEffect, useRef } from "react";

interface Props { envelope: number; charsTyped: number; }

export default function DreamLetterCanvas({ envelope, charsTyped }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, chars: 0, t: 0 });
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.chars = charsTyped; }, [charsTyped]);

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

      const definition = Math.min(1, s.chars / 200);

      // 5 drifting blobs
      for (let i = 0; i < 5; i++) {
        const phase = i * 1.3 + s.t * 0.04;
        const cx = w * (0.5 + 0.4 * Math.sin(phase));
        const cy = h * (0.5 + 0.35 * Math.cos(phase * 0.7));
        const rad = Math.min(w, h) * (0.25 + 0.08 * Math.sin(phase * 1.7));
        const hue = 230 + i * 12 + definition * 30;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grd.addColorStop(0, `hsla(${hue}, 50%, 60%, ${0.06 + s.env * 0.10 + definition * 0.06})`);
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
