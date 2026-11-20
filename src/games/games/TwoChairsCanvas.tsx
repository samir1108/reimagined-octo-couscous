// TwoChairsCanvas — two soft glowing wells (left/right), pulsing gently.
// The currently-hovered side brightens. A center oscillation line wobbles
// faster as the user flips between sides (ego oscillation).
import { useEffect, useRef } from "react";

interface Props { envelope: number; hover: -1 | 0 | 1; flips: number; }

export default function TwoChairsCanvas({ envelope, hover, flips }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, hover: 0 as -1 | 0 | 1, flips: 0, t: 0, lhi: 0, rhi: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.hover = hover; }, [hover]);
  useEffect(() => { stateRef.current.flips = flips; }, [flips]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d", { alpha: true }); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { c.width = Math.floor(c.clientWidth*dpr); c.height = Math.floor(c.clientHeight*dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      // ease hover intensity per side
      const targetL = s.hover === -1 ? 1 : 0;
      const targetR = s.hover === 1 ? 1 : 0;
      s.lhi += (targetL - s.lhi) * Math.min(1, dt * 6);
      s.rhi += (targetR - s.rhi) * Math.min(1, dt * 6);
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0,0,w,h);

      const drawWell = (cx: number, hi: number, hue: [number,number,number]) => {
        const baseR = Math.min(w,h) * 0.18;
        const breathe = 1 + Math.sin(s.t * 0.6) * 0.05 + s.env * 0.06;
        const g = ctx.createRadialGradient(cx, h/2, 0, cx, h/2, baseR * 2.2 * breathe);
        g.addColorStop(0, `rgba(${hue[0]},${hue[1]},${hue[2]},${0.18 + hi * 0.35})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, h/2, baseR * 2.2 * breathe, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, h/2, baseR * (1 + hi * 0.05) * breathe, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${0.35 + hi * 0.45})`;
        ctx.lineWidth = 1.0; ctx.stroke();
      };

      drawWell(w * 0.30, s.lhi, [120, 180, 220]);
      drawWell(w * 0.70, s.rhi, [220, 180, 120]);

      // Oscillation seam (center) — wobble proportional to flips
      const wobble = Math.sin(s.t * (1.2 + Math.min(8, s.flips * 0.4))) * (4 + s.flips);
      ctx.beginPath();
      ctx.moveTo(w/2 + wobble, 80);
      for (let y = 80; y <= h - 80; y += 12) {
        const wob = Math.sin(s.t * (0.8 + s.flips * 0.2) + y * 0.04) * (2 + Math.min(10, s.flips * 0.3));
        ctx.lineTo(w/2 + wob, y);
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.05 + Math.min(0.25, s.flips * 0.012)})`;
      ctx.lineWidth = 0.5; ctx.stroke();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{mixBlendMode:"screen"}} />;
}
