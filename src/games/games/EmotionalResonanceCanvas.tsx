// EmotionalResonanceCanvas — soft heart-field that quiets when you stay silent
// and ripples sharply on each interruption.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;       // live mic envelope 0..1
  interruptPulse: number; // increments on each interruption
  speaking: boolean;      // true while the storyteller speaks
}

export default function EmotionalResonanceCanvas({ envelope, interruptPulse, speaking }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, t: 0, pulses: [] as number[], lastPulse: 0, speaking: false });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.speaking = speaking; }, [speaking]);
  useEffect(() => {
    if (interruptPulse !== stateRef.current.lastPulse) {
      stateRef.current.lastPulse = interruptPulse;
      stateRef.current.pulses.push(performance.now());
    }
  }, [interruptPulse]);

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
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.28;

      const breath = 1 + Math.sin(s.t * 0.6) * 0.05;
      const speak = s.speaking ? 0.25 : 0;
      const env = Math.max(0, s.env - 0.05);

      // Soft warm aura
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 2.6);
      aura.addColorStop(0, `rgba(255,200,170,${0.16 + speak * 0.2})`);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura; ctx.fillRect(0, 0, w, h);

      // Concentric heart rings
      const rings = 5;
      for (let i = 0; i < rings; i++) {
        const r = baseR * (0.55 + i * 0.12) * breath;
        ctx.beginPath();
        const segs = 90;
        for (let j = 0; j <= segs; j++) {
          const a = (j / segs) * Math.PI * 2;
          const wob = Math.sin(a * 3 + s.t * 0.9 + i) * (2 + speak * 6);
          const x = cx + Math.cos(a) * (r + wob);
          const y = cy + Math.sin(a) * (r + wob);
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255,210,190,${0.08 + (rings - i) * 0.02 + speak * 0.05})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      // Center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.45 * breath);
      cg.addColorStop(0, `rgba(255,235,215,${0.4 + speak * 0.3})`);
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, baseR * 0.45 * breath, 0, Math.PI * 2); ctx.fill();

      // Interruption ripples — sharp, scarlet
      s.pulses = s.pulses.filter((p) => now - p < 1600);
      for (const p of s.pulses) {
        const age = (now - p) / 1600;
        const r = baseR * (0.4 + age * 1.4);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,90,80,${(1 - age) * 0.6})`;
        ctx.lineWidth = 1.6 * (1 - age) + 0.4; ctx.stroke();
      }

      // Live envelope ring (when listener vocalizes — stays subtle)
      if (env > 0) {
        ctx.beginPath(); ctx.arc(cx, cy, baseR * (1.05 + env * 0.4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,140,120,${env * 0.4})`;
        ctx.lineWidth = 1; ctx.stroke();
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
