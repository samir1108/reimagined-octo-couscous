// TheOtherSideCanvas — two opposing fields (left/right) that breathe with mic
// envelope. The active side glows; the other dims. Asymmetric "lean" reflects
// total dwell so far.
import { useEffect, useRef } from "react";

interface Props {
  side: "a" | "b";
  envelope: number;     // 0..1 mic
  leanA: number;        // 0..1 share of dwell on side A so far
}

export default function TheOtherSideCanvas({ side, envelope, leanA }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ side: "a" as "a" | "b", env: 0, lean: 0.5, t: 0 });

  useEffect(() => { stateRef.current.side = side; }, [side]);
  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.lean = leanA; }, [leanA]);

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

      const breath = 1 + Math.sin(s.t * 0.7) * 0.04 + s.env * 0.18;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.32;

      // Left field (side A) — cool indigo
      const cxA = w * (0.32 - (s.lean - 0.5) * 0.06);
      const intensityA = (s.side === "a" ? 0.9 : 0.35) * breath;
      drawField(ctx, cxA, cy, baseR * (0.85 + s.lean * 0.3), intensityA, "rgba(120,150,230,", s.t);

      // Right field (side B) — warm amber
      const cxB = w * (0.68 + (s.lean - 0.5) * 0.06);
      const intensityB = (s.side === "b" ? 0.9 : 0.35) * breath;
      drawField(ctx, cxB, cy, baseR * (0.85 + (1 - s.lean) * 0.3), intensityB, "rgba(230,180,130,", s.t + 1.7);

      // Center seam — vesica
      ctx.beginPath();
      ctx.moveTo(w / 2, cy - baseR * 0.8);
      ctx.lineTo(w / 2, cy + baseR * 0.8);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.6; ctx.stroke();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

function drawField(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  intensity: number, colorPrefix: string, t: number,
) {
  // Aura
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
  grad.addColorStop(0, `${colorPrefix}${0.18 * intensity})`);
  grad.addColorStop(1, `${colorPrefix}0)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2); ctx.fill();

  // Concentric rings
  for (let i = 0; i < 4; i++) {
    const rr = r * (0.55 + i * 0.13);
    ctx.beginPath();
    const segs = 70;
    for (let j = 0; j <= segs; j++) {
      const a = (j / segs) * Math.PI * 2;
      const wob = Math.sin(a * 3 + t + i * 0.5) * (2 + intensity * 4);
      const x = cx + Math.cos(a) * (rr + wob);
      const y = cy + Math.sin(a) * (rr + wob);
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `${colorPrefix}${0.05 + (4 - i) * 0.02 + intensity * 0.06})`;
    ctx.lineWidth = 1; ctx.stroke();
  }

  // Center glow
  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.4);
  cg.addColorStop(0, `${colorPrefix}${0.45 * intensity})`);
  cg.addColorStop(1, `${colorPrefix}0)`);
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2); ctx.fill();
}
