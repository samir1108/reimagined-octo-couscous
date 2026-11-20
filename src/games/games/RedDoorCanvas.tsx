// RedDoorCanvas — a closed crimson door that very slowly brightens as the
// wait progresses. A faint heat haze responds to mic envelope. No clock.
import { useEffect, useRef } from "react";

interface Props { envelope: number; waitFrac: number; agitationKey: number; }

export default function RedDoorCanvas({ envelope, waitFrac, agitationKey }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, frac: 0, t: 0, agit: 0, lastAgit: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.frac = waitFrac; }, [waitFrac]);
  useEffect(() => {
    const s = stateRef.current;
    if (agitationKey !== s.lastAgit) { s.agit = 1; s.lastAgit = agitationKey; }
  }, [agitationKey]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d", { alpha: true }); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { c.width = Math.floor(c.clientWidth * dpr); c.height = Math.floor(c.clientHeight * dpr); ctx.setTransform(dpr,0,0,dpr,0,0); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);
    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt; s.agit = Math.max(0, s.agit - dt * 0.8);
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0,0,w,h);
      const cx = w/2, cy = h/2;

      // Background warm wash
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w,h));
      bg.addColorStop(0, `rgba(120,30,30,${0.10 + s.frac * 0.10 + s.env * 0.06})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

      // Door rectangle
      const dw = Math.min(w * 0.5, 280);
      const dh = Math.min(h * 0.7, 480);
      const dx = cx - dw/2, dy = cy - dh/2;
      const heat = 0.4 + s.frac * 0.5 + s.agit * 0.3;
      const grad = ctx.createLinearGradient(dx, dy, dx, dy + dh);
      grad.addColorStop(0, `rgba(${Math.round(140 + heat * 80)}, 30, 30, 0.55)`);
      grad.addColorStop(1, `rgba(${Math.round(100 + heat * 60)}, 20, 20, 0.85)`);
      ctx.fillStyle = grad;
      ctx.fillRect(dx, dy, dw, dh);

      // Door frame outline
      ctx.strokeStyle = `rgba(220,${Math.round(140 + heat * 60)},80,${0.25 + s.frac * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dw, dh);

      // Knob
      const kx = dx + dw - 28, ky = cy + 10;
      ctx.beginPath();
      ctx.arc(kx, ky, 5 + s.env * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${Math.round(180 + heat * 60)},120,${0.5 + s.frac * 0.4})`;
      ctx.fill();

      // Center seam
      ctx.beginPath();
      ctx.moveTo(cx, dy + 12);
      ctx.lineTo(cx, dy + dh - 12);
      ctx.strokeStyle = `rgba(255,200,140,${0.10 + s.frac * 0.2})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Heat haze ripple from mic
      if (s.env > 0.05) {
        ctx.beginPath();
        ctx.arc(cx, cy, dw * 0.7 + s.env * 30, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(220,80,60,${s.env * 0.18})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{mixBlendMode:"screen"}} />;
}
