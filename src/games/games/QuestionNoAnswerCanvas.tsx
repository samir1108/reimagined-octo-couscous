// QuestionNoAnswerCanvas — a single still circle in the void. The mind wants
// to fill it. We don't. As the user sits with the kōan, the circle slowly
// dissolves into a soft halo, then nothing, then re-emerges. Mic envelope
// (any inner agitation that leaks to breath/voice) ripples a faint outer
// ring. Urge-taps briefly flash a sharp ring (the grasp), then fade. Hue
// shifts from white-gold (mind active) toward deep violet (settled).
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;   // mic 0..1
  dwellSec: number;   // seconds the user has been sitting
  totalSec: number;   // target dwell duration
  urgePulse: number;  // increments on each urge-tap (we flash on change)
  intensity: number;  // 0..1 overall presence
}

export default function QuestionNoAnswerCanvas({ envelope, dwellSec, totalSec, urgePulse, intensity }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, dwell: 0, total: 90, intensity: 0, urge: 0, lastUrge: 0, flash: 0, t: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.dwell = dwellSec; }, [dwellSec]);
  useEffect(() => { stateRef.current.total = totalSec; }, [totalSec]);
  useEffect(() => { stateRef.current.intensity = intensity; }, [intensity]);
  useEffect(() => {
    const s = stateRef.current;
    if (urgePulse !== s.lastUrge) { s.flash = 1; s.lastUrge = urgePulse; }
  }, [urgePulse]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true }); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      s.flash = Math.max(0, s.flash - dt * 1.4);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      const settle = Math.min(1, s.dwell / Math.max(1, s.total));

      // Hue: white-gold (active mind) -> violet (settled)
      const r = Math.round(255 * (1 - settle * 0.55));
      const g = Math.round(220 * (1 - settle * 0.75));
      const b = Math.round(180 + 75 * settle);

      // Backdrop wash
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      bg.addColorStop(0, `rgba(${r},${g},${b},${0.06 + s.intensity * 0.10})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // The kōan circle — a single ring that breathes very slowly
      const baseR = Math.min(w, h) * 0.18;
      const breath = 1 + Math.sin(s.t * 0.35) * 0.03 + s.env * 0.08;
      const dissolveCycle = 0.5 + 0.5 * Math.sin(s.t * 0.18); // slow breathe in/out of being
      const ringAlpha = (0.18 + 0.32 * dissolveCycle) * (1 - settle * 0.35);
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * breath, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${ringAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Soft inner halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.6);
      halo.addColorStop(0, `rgba(${r},${g},${b},${0.10 + s.env * 0.15})`);
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, baseR * 1.6, 0, Math.PI * 2); ctx.fill();

      // Outer mic ripple — very faint
      const ripple = baseR * 1.9 + s.env * baseR * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, ripple, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.06 + s.env * 0.18})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Urge flash — sharp white ring that fades
      if (s.flash > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * (1.05 + (1 - s.flash) * 0.6), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${s.flash * 0.7})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Center stillness — a single bright dot, almost nothing
      ctx.fillStyle = `rgba(255,255,255,${0.55 + settle * 0.25})`;
      ctx.beginPath(); ctx.arc(cx, cy, 1.6 + settle * 1.2, 0, Math.PI * 2); ctx.fill();

      // Slow drifting motes — sparse, fewer as user settles
      const motes = Math.floor(18 * (1 - settle * 0.6));
      for (let i = 0; i < motes; i++) {
        const seed = (i * 137.5) % 1;
        const y = ((s.t * (0.02 + seed * 0.03) + seed) % 1);
        const x = ((seed * 11.31 + Math.sin(s.t * 0.15 + i) * 0.05) % 1 + 1) % 1;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.10 + s.intensity * 0.15})`;
        ctx.fillRect(x * w, y * h, 1, 1.2);
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
