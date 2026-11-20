// ThirtySecondMindCanvas — single luminous dot that breathes with mic envelope
// and emits a soft ripple at each probe ping during the SIT phase.
import { useEffect, useRef } from "react";

export default function ThirtySecondMindCanvas({
  envelope,
  probePulse,
}: {
  envelope: number;
  probePulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastProbeRef = useRef(0);
  const ripplesRef = useRef<Array<{ r: number; a: number }>>([]);
  const tRef = useRef(0);

  useEffect(() => {
    if (probePulse <= lastProbeRef.current) return;
    lastProbeRef.current = probePulse;
    ripplesRef.current.push({ r: 10, a: 0.55 });
  }, [probePulse]);

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
      const baseR = Math.min(w, h) * 0.06;
      const breath = 1 + Math.sin(tRef.current * 1.1) * 0.18 + envelope * 0.6;

      // Soft halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 8);
      halo.addColorStop(0, `rgba(220, 230, 255, ${0.18 + envelope * 0.2})`);
      halo.addColorStop(1, `rgba(0, 0, 0, 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Core dot
      ctx.fillStyle = `rgba(245, 250, 255, ${0.7 + envelope * 0.25})`;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * breath, 0, Math.PI * 2);
      ctx.fill();

      // Probe ripples
      ripplesRef.current = ripplesRef.current.filter((rp) => {
        rp.r += 4 * devicePixelRatio;
        rp.a *= 0.94;
        ctx.strokeStyle = `rgba(220, 230, 255, ${rp.a})`;
        ctx.lineWidth = 1.4 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR + rp.r, 0, Math.PI * 2);
        ctx.stroke();
        return rp.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [envelope]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
