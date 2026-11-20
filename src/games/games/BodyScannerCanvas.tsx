// BodyScannerCanvas — cinematic interoceptive chamber.
// Layers, back-to-front:
//   1. Deep ink base with soft persistence (dust leaves faint trails)
//   2. Warm amber radial aura that breathes with mic envelope
//   3. Slow-drifting dust motes (60 seeds, orbital parallax)
//   4. Sweep line — dual band with glowing leading edge, trailing scan history
//   5. Central meridian — faint vertical spine of light
//   6. Felt blooms — dual-stroke halos with hot white core + slow ember drift
import { useEffect, useRef } from "react";

export interface FeltPoint { x: number; y: number; t: number; }

interface Props {
  envelope: number;
  felt: FeltPoint[];
  scanFrac: number; // 0..1 sweep position top→bottom
}

export default function BodyScannerCanvas({ envelope, felt, scanFrac }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, scan: 0, felt: [] as FeltPoint[], t: 0 });
  const motesRef = useRef<Array<{ ang: number; rad: number; r: number; a: number; tw: number; vAng: number }>>([]);

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.scan = scanFrac; }, [scanFrac]);
  useEffect(() => { stateRef.current.felt = felt; }, [felt]);

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

    if (motesRef.current.length === 0) {
      for (let i = 0; i < 60; i++) {
        motesRef.current.push({
          ang: Math.random() * Math.PI * 2,
          rad: 40 + Math.random() * 320,
          r: 0.4 + Math.random() * 1.3,
          a: 0.10 + Math.random() * 0.22,
          tw: Math.random() * Math.PI * 2,
          vAng: (Math.random() - 0.5) * 0.05,
        });
      }
    }

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // Persistent ink base — leaves faint dust trails
      ctx.fillStyle = "rgba(6,5,10,0.32)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      // Warm breathing aura (mic-reactive)
      const breath = 1 + Math.sin(s.t * 0.7) * 0.05;
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6 * breath);
      aura.addColorStop(0, `rgba(200,150,90,${0.08 + s.env * 0.14})`);
      aura.addColorStop(0.55, `rgba(160,110,70,${0.03 + s.env * 0.05})`);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura; ctx.fillRect(0, 0, w, h);

      // Slow-drifting dust motes — orbital parallax
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += 0.02;
        const mx = cx + Math.cos(m.ang) * m.rad;
        const my = cy + Math.sin(m.ang) * m.rad * 0.9;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(240, 210, 170, ${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central meridian — faint vertical spine of light
      const spine = ctx.createLinearGradient(cx, 40, cx, h - 40);
      spine.addColorStop(0, "rgba(251,191,36,0)");
      spine.addColorStop(0.5, `rgba(251,191,36,${0.05 + s.env * 0.05})`);
      spine.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = spine;
      ctx.fillRect(cx - 0.6, 40, 1.2, h - 80);

      // Sweep line — glowing leading edge with trailing history band
      const sy = 60 + (h - 120) * s.scan;
      // Trailing history (above the sweep) — where we've been
      const trail = ctx.createLinearGradient(0, 60, 0, sy);
      trail.addColorStop(0, "rgba(251,191,36,0)");
      trail.addColorStop(1, "rgba(251,191,36,0.06)");
      ctx.fillStyle = trail;
      ctx.fillRect(cx - 120, 60, 240, Math.max(0, sy - 60));
      // Broad soft glow band
      const grad = ctx.createLinearGradient(0, sy - 44, 0, sy + 44);
      grad.addColorStop(0, "rgba(251,191,36,0)");
      grad.addColorStop(0.5, `rgba(251,191,36,${0.18 + s.env * 0.10})`);
      grad.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 130, sy - 44, 260, 88);
      // Crisp leading edge with glow
      ctx.save();
      ctx.shadowColor = "rgba(255,230,160,0.7)";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(255,235,180,${0.55 + s.env * 0.25})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx - 130, sy);
      ctx.lineTo(cx + 130, sy);
      ctx.stroke();
      ctx.restore();
      // Anchor beads at the ends of the line
      for (const dx of [-130, 130]) {
        ctx.save();
        ctx.shadowColor = "rgba(255,230,160,0.9)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgba(255,240,200,${0.7 + s.env * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx + dx, sy, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Felt blooms — dual-stroke halo with hot core, slow ember drift
      for (const p of s.felt) {
        const age = (Date.now() - p.t) / 1000;
        if (age > 7) continue;
        const alpha = Math.max(0, 0.6 - age * 0.08);
        const r = 16 + age * 22;
        // Outer amber halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(251,191,36,${alpha})`);
        g.addColorStop(0.5, `rgba(230,140,60,${alpha * 0.55})`);
        g.addColorStop(1, "rgba(180,80,30,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        // Thin ring outline
        ctx.strokeStyle = `rgba(255,220,160,${alpha * 0.55})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.6, 0, Math.PI * 2); ctx.stroke();
        // Hot white core
        ctx.save();
        ctx.shadowColor = "rgba(255,240,200,0.85)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgba(255,250,230,${Math.max(0, 0.85 - age * 0.16)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, 2.4 - age * 0.25), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

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
