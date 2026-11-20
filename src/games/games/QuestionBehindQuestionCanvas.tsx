// QuestionBehindQuestionCanvas — a vertical well of light. Each layer the
// user reaches descends a ring deeper and shifts the hue from surface gold
// toward deep indigo. Mic envelope ripples each ring. Lateral motes drift
// downward, suggesting the descent of attention from symptom toward root.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;   // mic 0..1
  layer: number;      // 0..N
  total: number;      // N
  intensity: number;  // 0..1
}

export default function QuestionBehindQuestionCanvas({ envelope, layer, total, intensity }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, layer: 0, total: 5, intensity: 0, t: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.layer = layer; }, [layer]);
  useEffect(() => { stateRef.current.total = total; }, [total]);
  useEffect(() => { stateRef.current.intensity = intensity; }, [intensity]);

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
      const depth = Math.min(1, s.layer / Math.max(1, s.total - 1));

      // Hue drift: gold (surface) -> indigo (root)
      const r = Math.round(255 * (1 - depth * 0.6));
      const g = Math.round(200 * (1 - depth * 0.7));
      const b = Math.round(100 + 155 * depth);

      // Backdrop wash
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      bg.addColorStop(0, `rgba(${r},${g},${b},${0.10 + s.intensity * 0.10})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Concentric well — N rings, the current layer brightens
      const ringMax = Math.min(w, h) * 0.42;
      for (let i = 0; i < s.total; i++) {
        const f = (i + 1) / s.total;
        const ringR = ringMax * (1 - f * 0.7);
        const active = i <= s.layer;
        const reached = i < s.layer;
        const isCurrent = i === s.layer;
        const breath = 1 + Math.sin(s.t * 0.8 + i) * 0.04 + (isCurrent ? s.env * 0.3 : 0);
        const alpha = active
          ? (reached ? 0.35 : 0.55 + s.env * 0.25)
          : 0.10;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR * breath, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = isCurrent ? 1.4 : 0.7;
        ctx.stroke();
      }

      // Falling motes — descent of attention
      // Use t-based pseudo-random so we don't allocate
      for (let i = 0; i < 24; i++) {
        const seed = (i * 97.13) % 1;
        const y = ((s.t * (0.04 + seed * 0.05) + seed) % 1);
        const x = ((seed * 7.31 + Math.sin(s.t * 0.2 + i) * 0.04) % 1 + 1) % 1;
        const py = y * h;
        const px = x * w;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.15 + s.intensity * 0.2})`;
        ctx.fillRect(px, py, 1, 1.4);
      }

      // Center bead — the unspoken root
      const beadR = 2 + s.env * 4 + depth * 2;
      const beadGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, beadR * 8);
      beadGlow.addColorStop(0, `rgba(255,255,255,${0.25 + s.env * 0.3 + depth * 0.15})`);
      beadGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beadGlow;
      ctx.beginPath(); ctx.arc(cx, cy, beadR * 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath(); ctx.arc(cx, cy, beadR, 0, Math.PI * 2); ctx.fill();

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
