// WillForgeCanvas — central ember ring that brightens as the user holds.
// Pulses red on deviations (blur/touch); breathes amber with mic envelope.
import { useEffect, useRef } from "react";

export default function WillForgeCanvas({
  progress,    // 0..1 hold completion
  envelope,    // 0..1 mic
  deviationPulse,
}: {
  progress: number;
  envelope: number;
  deviationPulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flaresRef = useRef<Array<{ r: number; a: number }>>([]);
  const lastDevRef = useRef(0);
  const tRef = useRef(0);
  const sparksRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; a: number }>>([]);

  useEffect(() => {
    if (deviationPulse <= lastDevRef.current) return;
    lastDevRef.current = deviationPulse;
    flaresRef.current.push({ r: 40, a: 0.7 });
  }, [deviationPulse]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const resize = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      tRef.current += 0.016;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.18;

      // Forge floor glow
      const floor = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 4);
      const heat = 0.15 + progress * 0.55 + envelope * 0.2;
      floor.addColorStop(0, `rgba(255, 160, 60, ${heat * 0.6})`);
      floor.addColorStop(0.4, `rgba(180, 60, 20, ${heat * 0.25})`);
      floor.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, w, h);

      // Outer progress ring
      ctx.strokeStyle = `rgba(255, 200, 100, 0.18)`;
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 220, 140, 0.85)`;
      ctx.lineWidth = 3 * devicePixelRatio;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      ctx.stroke();

      // Ember core
      const breath = 1 + Math.sin(tRef.current * 1.4) * 0.06 + envelope * 0.25;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * breath);
      core.addColorStop(0, `rgba(255, 240, 200, ${0.7 + progress * 0.3})`);
      core.addColorStop(0.4, `rgba(255, 150, 60, ${0.5 + progress * 0.4})`);
      core.addColorStop(1, `rgba(120, 30, 0, 0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * breath, 0, Math.PI * 2);
      ctx.fill();

      // Spawn occasional sparks based on progress
      if (Math.random() < 0.05 + progress * 0.2) {
        const ang = Math.random() * Math.PI * 2;
        sparksRef.current.push({
          x: cx + Math.cos(ang) * baseR * 0.4,
          y: cy + Math.sin(ang) * baseR * 0.4,
          vx: Math.cos(ang) * (1 + Math.random() * 2) * devicePixelRatio,
          vy: Math.sin(ang) * (1 + Math.random() * 2) * devicePixelRatio - 1,
          a: 0.9,
        });
      }
      sparksRef.current = sparksRef.current.filter((s) => {
        s.x += s.vx; s.y += s.vy; s.vy += 0.08; s.a *= 0.96;
        ctx.fillStyle = `rgba(255, 220, 150, ${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
        return s.a > 0.04;
      });

      // Deviation flares (red ripples)
      flaresRef.current = flaresRef.current.filter((f) => {
        f.r += 5 * devicePixelRatio;
        f.a *= 0.93;
        ctx.strokeStyle = `rgba(255, 90, 70, ${f.a})`;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, f.r, 0, Math.PI * 2);
        ctx.stroke();
        return f.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [progress, envelope]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
