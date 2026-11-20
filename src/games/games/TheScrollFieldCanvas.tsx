// TheScrollFieldCanvas — slow drifting ribbons that brighten with scroll velocity
// and pulse with mic envelope (sub-vocal stress). Sits behind the feed.
import { useEffect, useRef } from "react";

export default function TheScrollFieldCanvas({
  velocity,
  envelope,
  pullPulse,
}: {
  velocity: number;   // 0..1 normalized scroll velocity
  envelope: number;   // 0..1 mic envelope
  pullPulse: number;  // increments on refresh attempt
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonsRef = useRef<Array<{ y: number; phase: number; speed: number; amp: number }>>([]);
  const flaresRef = useRef<Array<{ y: number; r: number; a: number }>>([]);
  const lastPullRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (ribbonsRef.current.length) return;
    for (let i = 0; i < 5; i++) {
      ribbonsRef.current.push({
        y: 0.15 + i * 0.18,
        phase: Math.random() * Math.PI * 2,
        speed: 0.0004 + Math.random() * 0.0006,
        amp: 30 + Math.random() * 40,
      });
    }
  }, []);

  useEffect(() => {
    if (pullPulse <= lastPullRef.current) return;
    lastPullRef.current = pullPulse;
    const c = canvasRef.current; if (!c) return;
    flaresRef.current.push({ y: c.height * 0.1, r: 30, a: 0.5 });
  }, [pullPulse]);

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

      // Background gradient — warms with mic envelope (stress signal)
      const stress = Math.min(1, envelope * 1.6);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, `rgba(${30 + stress * 60}, 10, ${20 + stress * 20}, 0.35)`);
      bg.addColorStop(1, `rgba(0, 0, 0, 0.0)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Ribbons
      ribbonsRef.current.forEach((r, idx) => {
        r.phase += r.speed * (1 + velocity * 4);
        const baseY = r.y * h;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12 * devicePixelRatio) {
          const k = x / w;
          const wave = Math.sin(k * 6 + r.phase + tRef.current * 0.4) * r.amp * devicePixelRatio * (0.6 + velocity * 1.4);
          const y = baseY + wave;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        const a = 0.05 + velocity * 0.18 + (idx % 2 ? envelope * 0.1 : 0);
        ctx.strokeStyle = `rgba(255, 200, 160, ${a})`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.stroke();
      });

      // Flares (refresh attempts)
      flaresRef.current = flaresRef.current.filter(f => {
        f.r += 5 * devicePixelRatio;
        f.a *= 0.94;
        ctx.strokeStyle = `rgba(255, 180, 120, ${f.a})`;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(w / 2, f.y, f.r, 0, Math.PI * 2);
        ctx.stroke();
        return f.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [velocity, envelope]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
