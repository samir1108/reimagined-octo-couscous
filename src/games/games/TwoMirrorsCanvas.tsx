// TwoMirrorsCanvas — cinematic altar around the face frame.
// Layers, back-to-front:
//   1. Deep ink base with soft persistence
//   2. Slow-drifting dust motes (orbital parallax around the face)
//   3. Warm amber halo — breathes with mic envelope, brightens with steady gaze
//   4. Faint aura rays radiating outward (candle-light behind the mirror)
//   5. Outer vignette
//   6. Look-away ripples — dual-stroke with soft glow, warm rose
import { useEffect, useRef } from "react";

export default function TwoMirrorsCanvas({
  envelope,
  awayPulse,
  steady,    // 0..1 sustained gaze (face presence ratio)
}: {
  envelope: number;
  awayPulse: number;
  steady: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastAwayRef = useRef(0);
  const ripplesRef = useRef<Array<{ r: number; a: number }>>([]);
  const motesRef = useRef<Array<{ ang: number; rad: number; r: number; a: number; tw: number; vAng: number }>>([]);
  const tRef = useRef(0);
  const envRef = useRef(envelope);
  const steadyRef = useRef(steady);
  envRef.current = envelope;
  steadyRef.current = steady;

  useEffect(() => {
    if (awayPulse <= lastAwayRef.current) return;
    lastAwayRef.current = awayPulse;
    // Two nested rings per look-away — inner sharp, outer soft
    ripplesRef.current.push({ r: 20, a: 0.65 });
    ripplesRef.current.push({ r: 6, a: 0.5 });
  }, [awayPulse]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
    resize();
    window.addEventListener("resize", resize);

    if (motesRef.current.length === 0) {
      for (let i = 0; i < 55; i++) {
        motesRef.current.push({
          ang: Math.random() * Math.PI * 2,
          rad: (0.5 + Math.random() * 0.9) * Math.min(c.width, c.height) * 0.5,
          r: (0.4 + Math.random() * 1.4) * devicePixelRatio,
          a: 0.10 + Math.random() * 0.22,
          tw: Math.random() * Math.PI * 2,
          vAng: (Math.random() - 0.5) * 0.04,
        });
      }
    }

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      tRef.current += dt;
      const t = tRef.current;
      const envelope = envRef.current;
      const steady = steadyRef.current;
      const w = c.width, h = c.height;
      // Persistent ink base — leaves faint dust trails
      ctx.fillStyle = "rgba(6,5,10,0.32)";
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.42;

      // Slow-drifting dust motes — orbital parallax around the face
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += 0.02;
        const mx = cx + Math.cos(m.ang) * m.rad;
        const my = cy + Math.sin(m.ang) * m.rad * 0.95;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(255,220,180,${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Halo around the face — dual gradient, breathes with mic + steady gaze
      const breath = 1 + Math.sin(t * 0.7) * 0.05;
      const halo = ctx.createRadialGradient(cx, cy, baseR * 0.55, cx, cy, baseR * 1.7 * breath);
      const heat = 0.06 + steady * 0.22 + envelope * 0.10;
      halo.addColorStop(0, `rgba(255, 220, 180, ${heat})`);
      halo.addColorStop(0.55, `rgba(230, 160, 110, ${heat * 0.45})`);
      halo.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Aura rays — candle-light behind the mirror (only when steady is meaningful)
      if (steady > 0.15) {
        ctx.save();
        ctx.translate(cx, cy);
        const rays = 18;
        for (let i = 0; i < rays; i++) {
          const a = (i / rays) * Math.PI * 2 + t * 0.05;
          const flick = 0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7);
          const alpha = (0.04 + steady * 0.09) * flick;
          const g = ctx.createLinearGradient(0, 0, Math.cos(a) * baseR * 1.9, Math.sin(a) * baseR * 1.9);
          g.addColorStop(0, `rgba(255,210,160,${alpha})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.2 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * baseR * 0.9, Math.sin(a) * baseR * 0.9);
          ctx.lineTo(Math.cos(a) * baseR * 1.9, Math.sin(a) * baseR * 1.9);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Outer vignette darken
      const vig = ctx.createRadialGradient(cx, cy, baseR * 0.95, cx, cy, Math.max(w, h) * 0.7);
      vig.addColorStop(0, `rgba(0, 0, 0, 0)`);
      vig.addColorStop(1, `rgba(0, 0, 0, 0.88)`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Look-away ripples — dual-stroke with soft glow
      ripplesRef.current = ripplesRef.current.filter((rp) => {
        rp.r += 3.2 * devicePixelRatio;
        rp.a *= 0.955;
        // Outer soft glow
        ctx.save();
        ctx.shadowColor = "rgba(255,150,120,0.6)";
        ctx.shadowBlur = 14 * devicePixelRatio;
        ctx.strokeStyle = `rgba(255, 170, 130, ${rp.a * 0.5})`;
        ctx.lineWidth = 2.4 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR + rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Crisp inner ring
        ctx.strokeStyle = `rgba(255, 210, 180, ${rp.a})`;
        ctx.lineWidth = 1.0 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR + rp.r, 0, Math.PI * 2);
        ctx.stroke();
        return rp.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
