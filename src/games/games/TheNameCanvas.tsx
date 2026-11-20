// TheNameCanvas — a 108-bead mala arranged in a ring. Each whisper lights one
// bead. The center pulses with mic envelope (the breath of the name).
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  count: number; // 0..108
  active: boolean;
}

export default function TheNameCanvas({ envelope, count, active }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, count: 0, t: 0 });
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.count = count; }, [count]);

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
      const cx = w / 2, cy = h / 2;
      const radius = Math.min(w, h) * 0.32;

      // Center glow
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.6);
      wash.addColorStop(0, `rgba(180,140,255,${0.06 + s.env * 0.18})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      // 108 beads
      for (let i = 0; i < 108; i++) {
        const angle = (i / 108) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const lit = i < s.count;
        const isActive = i === s.count - 1;
        const pulse = isActive ? 1 + Math.sin(s.t * 6) * 0.4 : 1;
        const r = lit ? 2.4 * pulse : 1.2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = lit ? `rgba(220,200,255,${0.85})` : `rgba(255,255,255,0.12)`;
        ctx.fill();
      }

      // Center seed point
      const cr = 6 + s.env * 22;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,180,255,${0.3 + s.env * 0.5})`;
      ctx.fill();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
