// WhoIsThinkingCanvas — an inward-collapsing concentric ring system that
// breathes with mic envelope. Each "inquiryPulse" sends a ring collapsing
// toward the center (the "I" returning to its source).
import { useEffect, useRef } from "react";

export default function WhoIsThinkingCanvas({
  envelope,
  inquiryPulse,
}: {
  envelope: number;
  inquiryPulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPulseRef = useRef(0);
  const ringsRef = useRef<Array<{ r: number; a: number }>>([]);
  const tRef = useRef(0);

  useEffect(() => {
    if (inquiryPulse <= lastPulseRef.current) return;
    lastPulseRef.current = inquiryPulse;
    // outward-then-inward ring starting wide
    ringsRef.current.push({ r: 1.0, a: 0.55 });
  }, [inquiryPulse]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
    resize(); window.addEventListener("resize", resize);
    let raf = 0;
    const tick = () => {
      tRef.current += 0.016;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const maxR = Math.min(w, h) * 0.42;
      const breath = 1 + Math.sin(tRef.current * 0.9) * 0.12 + envelope * 0.4;

      // Background halo — warm amber for self-inquiry
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.4);
      halo.addColorStop(0, `rgba(255, 205, 140, ${0.10 + envelope * 0.18})`);
      halo.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Core point — the "I"
      const coreR = Math.min(w, h) * 0.012 * breath;
      ctx.fillStyle = `rgba(255, 235, 200, ${0.85 + envelope * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Inward-collapsing rings (each inquiry pulse)
      ringsRef.current = ringsRef.current.filter((rg) => {
        rg.r *= 0.985;            // collapse inward
        rg.a *= 0.992;
        const radius = maxR * rg.r;
        ctx.strokeStyle = `rgba(255, 200, 130, ${rg.a})`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        return rg.r > 0.04 && rg.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [envelope]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
