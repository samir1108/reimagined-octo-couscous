// YawnFieldCanvas — drifting amber halos that breathe with mic envelope.
// Pulses on tap; flares wide on detected yawn (long exhale).
import { useEffect, useRef } from "react";

export default function YawnFieldCanvas({
  envelope,
  tapPulse,
  yawnPulse,
  intensity = 0.5,
}: {
  envelope: number;
  tapPulse: number;
  yawnPulse: number;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number }>>([]);
  const flaresRef = useRef<Array<{ x: number; y: number; r: number; a: number; max: number }>>([]);
  const lastTapRef = useRef(0);
  const lastYawnRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (orbsRef.current.length) return;
    for (let i = 0; i < 7; i++) {
      orbsRef.current.push({
        x: Math.random(), y: Math.random(),
        r: 40 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
        a: 0.1 + Math.random() * 0.18,
      });
    }
  }, []);

  useEffect(() => {
    if (tapPulse <= lastTapRef.current) return;
    lastTapRef.current = tapPulse;
    const c = canvasRef.current; if (!c) return;
    flaresRef.current.push({ x: c.width / 2, y: c.height / 2, r: 20, a: 0.5, max: Math.min(c.width, c.height) * 0.35 });
  }, [tapPulse]);

  useEffect(() => {
    if (yawnPulse <= lastYawnRef.current) return;
    lastYawnRef.current = yawnPulse;
    const c = canvasRef.current; if (!c) return;
    for (let i = 0; i < 3; i++) {
      flaresRef.current.push({ x: c.width / 2, y: c.height / 2, r: 30 + i * 20, a: 0.6 - i * 0.1, max: Math.min(c.width, c.height) * 0.7 });
    }
  }, [yawnPulse]);

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

      // Drifting orbs
      orbsRef.current.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -0.1) o.x = 1.1; if (o.x > 1.1) o.x = -0.1;
        if (o.y < -0.1) o.y = 1.1; if (o.y > 1.1) o.y = -0.1;
        const px = o.x * w, py = o.y * h;
        const breath = 1 + Math.sin(tRef.current * 0.5 + o.r) * 0.08 + envelope * 0.4;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r * devicePixelRatio * breath);
        grad.addColorStop(0, `rgba(255, 200, 130, ${o.a * (0.6 + intensity * 0.6)})`);
        grad.addColorStop(1, `rgba(120, 60, 0, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, o.r * devicePixelRatio * breath, 0, Math.PI * 2);
        ctx.fill();
      });

      // Flares
      flaresRef.current = flaresRef.current.filter(f => {
        f.r += 6 * devicePixelRatio;
        f.a *= 0.95;
        ctx.strokeStyle = `rgba(255, 220, 160, ${f.a})`;
        ctx.lineWidth = 2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.stroke();
        return f.a > 0.03 && f.r < f.max;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [envelope, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
