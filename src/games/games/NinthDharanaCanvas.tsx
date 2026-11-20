// NinthDharanaCanvas — a single orb that grows on inhale and shrinks on exhale.
// At the apex (kumbhaka), a thin ring of light appears — the gap to tap.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  phase: "inhale" | "hold" | "exhale" | "rest" | "settle";
  apexKey: number;
  active: boolean;
}

export default function NinthDharanaCanvas({ envelope, phase, apexKey, active }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, phase: "settle" as Props["phase"], t: 0, gap: 0, lastApex: 0 });
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.phase = phase; }, [phase]);
  useEffect(() => {
    const s = stateRef.current;
    if (apexKey !== s.lastApex) { s.gap = 1; s.lastApex = apexKey; }
  }, [apexKey]);

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
      s.gap = Math.max(0, s.gap - dt * 0.8);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.18;

      // Orb size pulses with envelope, hold = max
      const isHold = s.phase === "hold";
      const target = isHold ? 1.4 : 0.8 + s.env * 0.6;
      const radius = baseR * target;

      // Wash
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 4);
      wash.addColorStop(0, `rgba(150,200,255,${isHold ? 0.16 : 0.08})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      // Orb
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grd.addColorStop(0, `rgba(220,235,255,${isHold ? 0.85 : 0.55})`);
      grd.addColorStop(1, `rgba(60,90,150,0)`);
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

      // Apex ring — appears during hold
      if (isHold) {
        const r = radius * (1.15 + Math.sin(s.t * 4) * 0.04);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,240,210,0.55)`;
        ctx.lineWidth = 1.2; ctx.stroke();
      }

      // Apex tap ripple
      if (s.gap > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * (1.6 + (1 - s.gap) * 1.2), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${s.gap * 0.7})`;
        ctx.lineWidth = 1.4; ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
