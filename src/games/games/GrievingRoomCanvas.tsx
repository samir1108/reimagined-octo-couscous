// GrievingRoomCanvas — a darkened room with a single low candle that
// breathes with the user's mic envelope. Slow downward motes (ash / rain
// of grief). On each "wave" pulse, a soft ripple expands from the candle.
// Visuals stay deliberately minimal — grief should not be entertained.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;      // 0..1 mic
  wave: number;          // increments to trigger a ripple
  intensity: number;     // 0..1 — overall presence (rises with stayed time)
}

export default function GrievingRoomCanvas({ envelope, wave, intensity }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, intensity: 0, t: 0, lastWave: 0, ripples: [] as { t: number }[], motes: [] as { x: number; y: number; vy: number; a: number }[] });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.intensity = intensity; }, [intensity]);
  useEffect(() => {
    if (wave !== stateRef.current.lastWave) {
      stateRef.current.lastWave = wave;
      stateRef.current.ripples.push({ t: 0 });
    }
  }, [wave]);

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

    // seed motes
    const s = stateRef.current;
    for (let i = 0; i < 80; i++) {
      s.motes.push({
        x: Math.random(),
        y: Math.random(),
        vy: 0.005 + Math.random() * 0.012,
        a: 0.05 + Math.random() * 0.15,
      });
    }

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      s.t += dt;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h * 0.55;

      // Room vignette — deep grief blue
      const room = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.9);
      room.addColorStop(0, `rgba(30,40,70,${0.22 + s.intensity * 0.12})`);
      room.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = room;
      ctx.fillRect(0, 0, w, h);

      // Falling motes
      for (const m of s.motes) {
        m.y += m.vy * dt * 60 / 60;
        if (m.y > 1) { m.y = -0.02; m.x = Math.random(); }
        const px = m.x * w;
        const py = m.y * h;
        ctx.fillStyle = `rgba(200,210,230,${m.a * (0.5 + s.intensity * 0.5)})`;
        ctx.fillRect(px, py, 1, 1.4);
      }

      // Ripples
      s.ripples = s.ripples.filter((r) => {
        r.t += dt;
        const radius = r.t * 220;
        const alpha = Math.max(0, 0.35 - r.t * 0.3);
        if (alpha <= 0.01) return false;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,170,150,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return true;
      });

      // Candle glow — breath modulated
      const breath = 1 + Math.sin(s.t * 0.9) * 0.06 + s.env * 0.35;
      const baseR = Math.min(w, h) * 0.08 * breath;

      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 6);
      aura.addColorStop(0, `rgba(255,200,140,${0.18 + s.env * 0.15})`);
      aura.addColorStop(0.4, `rgba(220,150,90,${0.08})`);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(cx, cy, baseR * 6, 0, Math.PI * 2); ctx.fill();

      // Candle flame
      const flameH = baseR * 2.4;
      const grad = ctx.createLinearGradient(cx, cy - flameH, cx, cy + baseR * 0.4);
      grad.addColorStop(0, "rgba(255,240,200,0.0)");
      grad.addColorStop(0.4, "rgba(255,200,120,0.85)");
      grad.addColorStop(1, "rgba(180,80,30,0.7)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - flameH);
      ctx.quadraticCurveTo(cx + baseR * 0.7, cy - flameH * 0.3, cx, cy + baseR * 0.4);
      ctx.quadraticCurveTo(cx - baseR * 0.7, cy - flameH * 0.3, cx, cy - flameH);
      ctx.closePath();
      ctx.fill();

      // Wick base (thin line below)
      ctx.fillStyle = "rgba(40,30,20,0.8)";
      ctx.fillRect(cx - 1, cy + baseR * 0.4, 2, baseR * 0.5);

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
