// MirrorRealmCanvas — reactive silver liquid mirror.
// Layers, back-to-front:
//   1. Deep ink base with soft persistence (dust trails linger)
//   2. Phase-tinted radial vignette (warm gold for praise, cool tarnish for shadow)
//   3. Slow-drifting silver dust motes (orbital parallax)
//   4. Concentric mirror rings — wobble with typing intensity, dual-stroke with glow
//   5. Center orb — dual gradient with hot core, breathes with typing
//   6. Fracture cracks during shadow — hot rim + trailing glow
import { useEffect, useRef } from "react";

interface Props {
  phase: "praise" | "insult" | "done";
  // 0..1 typing intensity (recent inter-key activity), 0 idle
  intensity: number;
  // 0..1 shadow severity; ramps as user types in shadow phase
  fracture: number;
}

export default function MirrorRealmCanvas({ phase, intensity, fracture }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ intensity: 0, fracture: 0, t: 0 });
  const motesRef = useRef<Array<{ ang: number; rad: number; r: number; a: number; tw: number; vAng: number }>>([]);

  useEffect(() => {
    stateRef.current.intensity = intensity;
    stateRef.current.fracture = fracture;
  }, [intensity, fracture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (motesRef.current.length === 0) {
      for (let i = 0; i < 55; i++) {
        motesRef.current.push({
          ang: Math.random() * Math.PI * 2,
          rad: 50 + Math.random() * 320,
          r: 0.4 + Math.random() * 1.3,
          a: 0.08 + Math.random() * 0.20,
          tw: Math.random() * Math.PI * 2,
          vAng: (Math.random() - 0.5) * 0.04,
        });
      }
    }

    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      s.t += dt;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Persistent ink base — leaves faint dust trails
      ctx.fillStyle = "rgba(6,5,8,0.30)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.32;

      // Background radial vignette tinted by phase
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.2);
      if (phase === "praise") {
        bg.addColorStop(0, "rgba(230,215,185,0.20)");
        bg.addColorStop(0.55, "rgba(180,150,110,0.06)");
        bg.addColorStop(1, "rgba(0,0,0,0)");
      } else {
        bg.addColorStop(0, `rgba(${180 + 40 * s.fracture},${160 - 40 * s.fracture},${150 - 40 * s.fracture},${0.16 + 0.1 * s.fracture})`);
        bg.addColorStop(0.55, `rgba(${120 + 40 * s.fracture},${100 - 20 * s.fracture},${90 - 20 * s.fracture},${0.05 + 0.05 * s.fracture})`);
        bg.addColorStop(1, "rgba(0,0,0,0)");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Slow-drifting silver dust motes — orbital parallax
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += 0.02;
        const mx = cx + Math.cos(m.ang) * m.rad;
        const my = cy + Math.sin(m.ang) * m.rad * 0.9;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        const tint = phase === "praise" ? "245,235,215" : `${230 - 30 * s.fracture},${220 - 40 * s.fracture},${210 - 50 * s.fracture}`;
        ctx.fillStyle = `rgba(${tint},${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Concentric mirror rings — wobble with intensity
      const rings = 7;
      for (let i = 0; i < rings; i++) {
        const r = baseR * (0.55 + i * 0.09);
        const wobble = (1 + s.intensity * 1.6) * (4 + i * 1.2);
        ctx.beginPath();
        const segments = 96;
        for (let j = 0; j <= segments; j++) {
          const a = (j / segments) * Math.PI * 2;
          // fracture: introduce sharp angular jolts
          const jolt = s.fracture > 0.05
            ? Math.sin(a * 9 + s.t * 3) * s.fracture * 18
            : 0;
          const ripple =
            Math.sin(a * 3 + s.t * 1.4 + i * 0.7) * wobble * 0.4 +
            Math.sin(a * 5 - s.t * 0.9 + i * 0.3) * wobble * 0.25;
          const rr = r + ripple + jolt;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const alpha = 0.06 + (rings - i) * 0.02 + s.intensity * 0.05;
        const stroke = phase === "praise"
          ? `rgba(245,235,215,${alpha})`
          : `rgba(${230 - 40 * s.fracture},${220 - 60 * s.fracture},${210 - 70 * s.fracture},${alpha})`;
        // Outer soft glow for outermost rings only
        if (i < 3) {
          ctx.save();
          ctx.shadowColor = phase === "praise" ? "rgba(255,235,200,0.6)" : `rgba(255,${180 - 40 * s.fracture},${160 - 40 * s.fracture},0.55)`;
          ctx.shadowBlur = 10 + s.intensity * 8;
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1 + (rings - i) * 0.15;
          ctx.stroke();
          ctx.restore();
        } else {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1 + (rings - i) * 0.15;
          ctx.stroke();
        }
      }

      // Center glyph — soft orb that pulses with breathing
      const pulse = 1 + Math.sin(s.t * 0.8) * 0.04 + s.intensity * 0.12;
      const glyphR = baseR * 0.42 * pulse;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glyphR);
      grad.addColorStop(0, `rgba(255,250,235,${0.55 + s.intensity * 0.15})`);
      grad.addColorStop(0.4, "rgba(220,200,170,0.20)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glyphR, 0, Math.PI * 2);
      ctx.fill();
      // Hot core
      ctx.save();
      ctx.shadowColor = "rgba(255,245,220,0.85)";
      ctx.shadowBlur = 14 + s.intensity * 10;
      ctx.fillStyle = `rgba(255,250,235,${0.5 + s.intensity * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4 + s.intensity * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Fracture cracks during shadow phase — with hot rim glow
      if (s.fracture > 0.1) {
        const cracks = Math.floor(3 + s.fracture * 5);
        ctx.save();
        ctx.shadowColor = "rgba(255,180,140,0.55)";
        ctx.shadowBlur = 8;
        for (let k = 0; k < cracks; k++) {
          const seed = k * 1.337 + s.t * 0.05;
          const a = seed * 2.3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          let x = cx;
          let y = cy;
          for (let step = 0; step < 6; step++) {
            const len = baseR * (0.3 + Math.sin(seed + step) * 0.15);
            const dir = a + Math.sin(seed + step * 0.7) * 0.6;
            x += Math.cos(dir) * len * 0.25;
            y += Math.sin(dir) * len * 0.25;
            ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255,225,190,${0.08 + s.fracture * 0.22})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [phase]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
