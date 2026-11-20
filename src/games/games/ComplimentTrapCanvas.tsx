// ComplimentTrapCanvas — a luminous "ego sphere" that swells on praise,
// constricts on insult, and idles on neutral statements. Microphone
// envelope adds live somatic shimmer; each round emits a soft pulse ring.
import { useEffect, useRef } from "react";

type Kind = "praise" | "insult" | "neutral" | "idle";

export default function ComplimentTrapCanvas({
  envelope,
  pulse,
  kind,
}: {
  envelope: number;
  pulse: number;
  kind: Kind;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPulseRef = useRef(0);
  const ringsRef = useRef<Array<{ r: number; a: number; tone: Kind }>>([]);
  const tRef = useRef(0);
  const targetScaleRef = useRef(1);
  const scaleRef = useRef(1);

  // Drive the sphere target by kind
  useEffect(() => {
    if (kind === "praise") targetScaleRef.current = 1.55;
    else if (kind === "insult") targetScaleRef.current = 0.55;
    else if (kind === "neutral") targetScaleRef.current = 1.0;
    else targetScaleRef.current = 0.95;
  }, [kind]);

  // Emit a ring on each new pulse
  useEffect(() => {
    if (pulse <= lastPulseRef.current) return;
    lastPulseRef.current = pulse;
    ringsRef.current.push({ r: 0.18, a: 0.55, tone: kind });
  }, [pulse, kind]);

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
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const maxR = Math.min(w, h) * 0.32;

      // Ease scale toward target
      scaleRef.current += (targetScaleRef.current - scaleRef.current) * 0.06;
      const breath = 1 + Math.sin(tRef.current * 0.8) * 0.05 + envelope * 0.35;
      const r = maxR * scaleRef.current * breath;

      // Tone palette
      const toneRGB =
        kind === "praise" ? [255, 210, 140] :
        kind === "insult" ? [180, 140, 220] :
        kind === "neutral" ? [200, 200, 210] :
        [220, 195, 160];

      // Outer halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4);
      halo.addColorStop(0, `rgba(${toneRGB[0]},${toneRGB[1]},${toneRGB[2]}, ${0.16 + envelope * 0.2})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Core sphere
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      core.addColorStop(0, `rgba(${toneRGB[0]},${toneRGB[1]},${toneRGB[2]}, ${0.55 + envelope * 0.35})`);
      core.addColorStop(0.6, `rgba(${toneRGB[0]},${toneRGB[1]},${toneRGB[2]}, 0.18)`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Outward-rippling rings
      ringsRef.current = ringsRef.current.filter((rg) => {
        rg.r += 0.012;
        rg.a *= 0.985;
        const rgb =
          rg.tone === "praise" ? [255, 210, 140] :
          rg.tone === "insult" ? [180, 140, 220] :
          [200, 200, 210];
        ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]}, ${rg.a})`;
        ctx.lineWidth = 1.2 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * 2.2 * rg.r, 0, Math.PI * 2);
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
  }, [envelope, kind]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
