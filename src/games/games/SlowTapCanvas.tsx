// SlowTapCanvas — a deep cinematic "time well".
// Layers, back-to-front:
//   1. Deep ink base with breathing indigo→amber vignette (heats with elapsed)
//   2. Slow-drifting star dust (60 motes, gentle parallax rotation)
//   3. Concentric rings — dual stroke (soft glow + crisp inner), individual phase
//   4. Chromatic halo around center — the "now" bloom
//   5. Central iris — grows subtly with mic agitation
//   6. Tap shockwave — triple-ring burst that freezes outward
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;       // mic 0..1
  elapsedFrac: number;    // 0..1 relative to 60s target (can exceed 1)
  active: boolean;        // waiting phase
  shockKey: number;       // increments on tap
}

export default function SlowTapCanvas({ envelope, elapsedFrac, active, shockKey }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, frac: 0, active: false, t: 0, shock: 0, lastShock: 0 });
  const motesRef = useRef<Array<{ ang: number; rad: number; r: number; a: number; tw: number; vAng: number }>>([]);

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.frac = elapsedFrac; }, [elapsedFrac]);
  useEffect(() => { stateRef.current.active = active; }, [active]);
  useEffect(() => {
    const s = stateRef.current;
    if (shockKey !== s.lastShock) { s.shock = 1; s.lastShock = shockKey; }
  }, [shockKey]);

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

    // Seed dust motes distributed around center in polar coords
    if (motesRef.current.length === 0) {
      for (let i = 0; i < 70; i++) {
        motesRef.current.push({
          ang: Math.random() * Math.PI * 2,
          rad: 20 + Math.random() * 260,
          r: 0.4 + Math.random() * 1.4,
          a: 0.10 + Math.random() * 0.25,
          tw: Math.random() * Math.PI * 2,
          vAng: (Math.random() - 0.5) * 0.04,
        });
      }
    }

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      s.shock = Math.max(0, s.shock - dt * 1.6);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // Persistent ink base — dust leaves a trail
      ctx.fillStyle = "rgba(4,6,14,0.28)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // Hue: deep indigo (calm) → amber (anticipation)
      const heat = Math.min(1, s.frac * 0.7 + s.env * 0.3);
      const r = Math.round(30 + heat * 180);
      const g = Math.round(30 + heat * 100);
      const b = Math.round(80 - heat * 50);

      // Ambient wash with breathing pulse
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      wash.addColorStop(0, `rgba(${r},${g},${b},${0.10 + s.env * 0.14})`);
      wash.addColorStop(0.55, `rgba(${r},${g},${b},${0.04 + s.env * 0.06})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      // Star dust motes — slow orbital drift around center
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += 0.02;
        const mx = cx + Math.cos(m.ang) * m.rad;
        const my = cy + Math.sin(m.ang) * m.rad;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(${180 + heat * 55}, ${190 + heat * 50}, ${210 - heat * 40}, ${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const maxR = Math.min(w, h) * 0.42;
      const ringCount = 7;

      // Concentric breathing rings — dual stroke (glow + crisp)
      for (let i = 0; i < ringCount; i++) {
        const basePhase = (i / ringCount) * Math.PI * 2;
        const breathe = 1 + Math.sin(s.t * 0.6 + basePhase) * (0.04 + s.env * 0.06);
        const radius = (maxR / ringCount) * (i + 1) * breathe;
        const alpha = 0.14 - i * 0.010 + s.env * 0.08;

        // Outer soft glow
        ctx.save();
        ctx.shadowColor = `rgba(${r},${g},${b},0.55)`;
        ctx.shadowBlur = 10 + s.env * 12;
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.max(0, alpha * 0.55)})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // Crisp inner
        ctx.strokeStyle = `rgba(${r + 30},${g + 30},${b + 30},${Math.max(0, alpha)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
      }

      // Chromatic halo — big soft glow around center that pulses with heat
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5);
      halo.addColorStop(0, `rgba(${r + 40},${g + 40},${b + 40},${0.16 + s.env * 0.14})`);
      halo.addColorStop(0.4, `rgba(${r},${g},${b},${0.06})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.5, 0, Math.PI * 2); ctx.fill();

      // Central iris — bright bead with soft glow
      const centerR = 4 + s.env * 10;
      ctx.save();
      ctx.shadowColor = `rgba(${r + 60},${g + 60},${b + 60},0.9)`;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r + 40},${g + 40},${b + 40},${0.4 + s.env * 0.3})`;
      ctx.fill();
      ctx.restore();
      // Hot core
      ctx.fillStyle = `rgba(255,255,255,${0.6 + s.env * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, centerR * 0.35), 0, Math.PI * 2);
      ctx.fill();

      // Mic disturbance — wobble in the rings
      if (s.env > 0.05) {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * 0.6 + s.env * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r + 30},${g + 30},${b + 30},${s.env * 0.24})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Tap shockwave — triple ring with white flash
      if (s.shock > 0.01) {
        const shockR = maxR * (0.3 + (1 - s.shock) * 1.2);
        // Outer glow burst
        ctx.save();
        ctx.shadowColor = "rgba(255,255,255,0.7)";
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(cx, cy, shockR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${s.shock * 0.75})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
        // Mid colored ring
        ctx.beginPath();
        ctx.arc(cx, cy, shockR * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r + 40},${g + 40},${b + 40},${s.shock * 0.6})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        // Trailing inner ring
        ctx.beginPath();
        ctx.arc(cx, cy, shockR * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${s.shock * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // No clock text — the well IS the time
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
