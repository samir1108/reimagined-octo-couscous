// WhoseVoiceCanvas — four orbiting voice nodes (mom/dad/teacher/self) around
// a central self. The active node (most recent pick) flares; mic envelope
// modulates the breath of the whole field. Each pulse emits a soft ring.
import { useEffect, useRef } from "react";

type Tag = "mom" | "dad" | "teacher" | "self" | null;

const TAG_RGB: Record<Exclude<Tag, null>, [number, number, number]> = {
  mom:     [255, 180, 200], // soft rose
  dad:     [180, 200, 255], // cool blue
  teacher: [220, 200, 130], // warm amber
  self:    [200, 235, 220], // luminous mint
};

export default function WhoseVoiceCanvas({
  envelope,
  pulse,
  active,
}: {
  envelope: number;
  pulse: number;
  active: Tag;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPulseRef = useRef(0);
  const ringsRef = useRef<Array<{ r: number; a: number; tag: Exclude<Tag, null> }>>([]);
  const tRef = useRef(0);
  const flareRef = useRef(0);

  useEffect(() => {
    if (pulse <= lastPulseRef.current) return;
    lastPulseRef.current = pulse;
    flareRef.current = 1;
    if (active) ringsRef.current.push({ r: 0.18, a: 0.5, tag: active });
  }, [pulse, active]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      c.width = c.clientWidth * devicePixelRatio;
      c.height = c.clientHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      tRef.current += 0.016;
      flareRef.current *= 0.96;
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const orbitR = Math.min(w, h) * 0.22;
      const breath = 1 + Math.sin(tRef.current * 0.7) * 0.05 + envelope * 0.3;

      // Background halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR * 3);
      halo.addColorStop(0, `rgba(220,200,160,${0.08 + envelope * 0.15})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Central self core
      const selfR = Math.min(w, h) * 0.022 * breath;
      ctx.fillStyle = `rgba(255,240,210,${0.85 + envelope * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx, cy, selfR, 0, Math.PI * 2);
      ctx.fill();

      // Four orbiting voice nodes
      const tags: Exclude<Tag, null>[] = ["mom", "dad", "teacher", "self"];
      tags.forEach((tag, i) => {
        const ang = tRef.current * 0.18 + (i * Math.PI) / 2;
        const x = cx + Math.cos(ang) * orbitR;
        const y = cy + Math.sin(ang) * orbitR;
        const isActive = active === tag;
        const flare = isActive ? flareRef.current : 0;
        const r = Math.min(w, h) * (0.018 + flare * 0.025) * breath;
        const [R, G, B] = TAG_RGB[tag];

        // Glow
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
        g.addColorStop(0, `rgba(${R},${G},${B},${0.5 + flare * 0.4})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);

        // Core
        ctx.fillStyle = `rgba(${R},${G},${B},${0.7 + flare * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Thread back to self
        ctx.strokeStyle = `rgba(${R},${G},${B},${0.12 + flare * 0.25})`;
        ctx.lineWidth = (0.6 + flare * 0.8) * devicePixelRatio;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Outward rings on each pick
      ringsRef.current = ringsRef.current.filter((rg) => {
        rg.r += 0.013;
        rg.a *= 0.985;
        const [R, G, B] = TAG_RGB[rg.tag];
        ctx.strokeStyle = `rgba(${R},${G},${B},${rg.a})`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR * 2.4 * rg.r, 0, Math.PI * 2);
        ctx.stroke();
        return rg.r < 1.0 && rg.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [envelope, active]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
