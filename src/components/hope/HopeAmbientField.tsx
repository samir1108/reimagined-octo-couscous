import { useEffect, useRef } from "react";

/**
 * Persistent ambient particle field. Soft floating embers across the entire page.
 * Lightweight canvas — runs at ~30fps, pauses when tab hidden.
 */
export const HopeAmbientField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Ember = { x: number; y: number; vy: number; r: number; o: number; drift: number };
    const embers: Ember[] = Array.from({ length: 38 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: 0.08 + Math.random() * 0.18,
      r: 0.6 + Math.random() * 1.6,
      o: 0.15 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.15,
    }));

    let last = 0;
    const tick = (t: number) => {
      if (!running) return;
      if (t - last < 33) {
        raf = requestAnimationFrame(tick);
        return;
      }
      last = t;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const e of embers) {
        e.y -= e.vy;
        e.x += Math.sin(t * 0.0003 + e.y * 0.01) * e.drift;
        if (e.y < -10) {
          e.y = canvas.height + 10;
          e.x = Math.random() * canvas.width;
        }
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        grad.addColorStop(0, `rgba(255, 196, 110, ${e.o})`);
        grad.addColorStop(1, "rgba(255, 196, 110, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70 mix-blend-screen"
    />
  );
};
