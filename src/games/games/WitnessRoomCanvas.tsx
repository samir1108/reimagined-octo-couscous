// WitnessRoomCanvas — a dark room. Ambient field. When sound disturbances hit
// (envelope spikes), ripples cross the field with dual-stroke glow. Reactive
// taps bloom red flares with hot cores that persist — the user sees their own
// reactivity written into the room. Slow drifting dust motes give the field
// depth. Central witness point breathes softly with mic envelope.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  active: boolean;
  reactiveKey: number; // increments on a reactive tap
  disturbKey: number;  // increments when an external sound is fired
}

export default function WitnessRoomCanvas({ envelope, active, reactiveKey, disturbKey }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    env: 0, t: 0,
    ripples: [] as { r: number; a: number; hue: number; x: number; y: number }[],
    flares: [] as { x: number; y: number; a: number; r: number }[],
    lastReact: 0, lastDist: 0,
  });
  const motesRef = useRef<Array<{ ang: number; rad: number; r: number; a: number; tw: number; vAng: number }>>([]);

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => {
    const s = stateRef.current;
    if (reactiveKey !== s.lastReact) {
      s.lastReact = reactiveKey;
      const c = ref.current;
      if (c) s.flares.push({
        x: c.clientWidth * (0.2 + Math.random() * 0.6),
        y: c.clientHeight * (0.2 + Math.random() * 0.6),
        a: 1,
        r: 0,
      });
    }
  }, [reactiveKey]);
  useEffect(() => {
    const s = stateRef.current;
    if (disturbKey !== s.lastDist) {
      s.lastDist = disturbKey;
      const c = ref.current;
      const cx = c ? c.clientWidth / 2 : 0;
      const cy = c ? c.clientHeight / 2 : 0;
      s.ripples.push({ r: 0, a: 0.55, hue: 200 + Math.random() * 60, x: cx, y: cy });
    }
  }, [disturbKey]);

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
      for (let i = 0; i < 55; i++) {
        motesRef.current.push({
          ang: Math.random() * Math.PI * 2,
          rad: 50 + Math.random() * 340,
          r: 0.4 + Math.random() * 1.2,
          a: 0.08 + Math.random() * 0.20,
          tw: Math.random() * Math.PI * 2,
          vAng: (Math.random() - 0.5) * 0.04,
        });
      }
    }

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      // Persistent ink base — leaves faint dust/flare trails
      ctx.fillStyle = "rgba(4,6,12,0.30)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // Ambient still wash — dual breath of the witness
      const breathe = 0.07 + Math.sin(s.t * 0.3) * 0.025 + s.env * 0.05;
      const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.8);
      wash.addColorStop(0, `rgba(140,160,220,${breathe})`);
      wash.addColorStop(0.55, `rgba(90,110,180,${breathe * 0.35})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash; ctx.fillRect(0, 0, w, h);

      // Slow-drifting dust motes — orbital parallax
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += 0.02;
        const mx = cx + Math.cos(m.ang) * m.rad;
        const my = cy + Math.sin(m.ang) * m.rad * 0.9;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(200,220,255,${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sound ripples — dual-stroke with soft glow
      s.ripples = s.ripples.filter((r) => r.a > 0.01);
      for (const r of s.ripples) {
        r.r += dt * 240;
        r.a -= dt * 0.38;
        // Outer soft glow
        ctx.save();
        ctx.shadowColor = `hsla(${r.hue}, 70%, 65%, 0.6)`;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = `hsla(${r.hue}, 55%, 62%, ${r.a * 0.5})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Crisp inner ring
        ctx.strokeStyle = `hsla(${r.hue}, 75%, 78%, ${r.a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Reactive flares — the user's reactivity, with hot white core
      s.flares = s.flares.filter((f) => f.a > 0.01);
      for (const f of s.flares) {
        f.a -= dt * 0.55;
        f.r += dt * 26;
        const R = 90 + f.r;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R);
        g.addColorStop(0, `rgba(240,110,110,${f.a * 0.7})`);
        g.addColorStop(0.45, `rgba(200,60,60,${f.a * 0.35})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(f.x - R, f.y - R, R * 2, R * 2);
        // Hot white core
        ctx.save();
        ctx.shadowColor = "rgba(255,230,220,0.85)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = `rgba(255,240,235,${f.a * 0.9})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(0.8, 2.6 - f.r * 0.05), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Center "witness" point — soft halo + crisp core
      const wr = 4 + s.env * 14;
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, wr * 6);
      halo.addColorStop(0, `rgba(200,215,245,${0.18 + s.env * 0.22})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, wr * 6, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.shadowColor = "rgba(220,230,255,0.9)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(220,230,250,${0.4 + s.env * 0.4})`;
      ctx.beginPath();
      ctx.arc(cx, cy, wr, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
