// NonDualDoorCanvas — a single vertical seam of light. The longer the user
// stays idle, the brighter and wider it grows. Each tap collapses it.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  openness: number;   // 0..1
  resetKey: number;   // increments on tap
}

export default function NonDualDoorCanvas({ envelope, openness, resetKey }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, open: 0, t: 0, lastReset: 0, shake: 0 });
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.open = openness; }, [openness]);
  useEffect(() => {
    const s = stateRef.current;
    if (resetKey !== s.lastReset) { s.lastReset = resetKey; s.shake = 1; }
  }, [resetKey]);

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
      const s = stateRef.current; s.t += dt; s.shake = Math.max(0, s.shake - dt * 1.5);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2 + (Math.random() - 0.5) * s.shake * 8;
      const cy = h / 2;

      // Door frame (faint, present even when closed)
      const doorW = w * 0.18;
      const doorH = h * 0.6;
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + s.open * 0.08})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - doorW / 2, cy - doorH / 2);
      ctx.lineTo(cx - doorW / 2, cy + doorH / 2);
      ctx.moveTo(cx + doorW / 2, cy - doorH / 2);
      ctx.lineTo(cx + doorW / 2, cy + doorH / 2);
      ctx.stroke();

      // Seam of light (grows with openness)
      const seamW = 1 + s.open * doorW;
      const grd = ctx.createLinearGradient(cx - seamW, 0, cx + seamW, 0);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(0.5, `rgba(255,255,240,${0.4 + s.open * 0.6})`);
      grd.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(cx - seamW, cy - doorH / 2, seamW * 2, doorH);

      // Glow
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      wash.addColorStop(0, `rgba(255,250,220,${s.open * 0.18})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
