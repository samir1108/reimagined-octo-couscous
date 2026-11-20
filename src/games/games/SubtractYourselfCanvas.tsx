// SubtractYourselfCanvas — a slowly contracting field of light.
// Starts as a wide warm aura representing the constructed self.
// Each identity dropped tightens the field and cools it toward silver,
// until what remains is a single still bead — the witness.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;     // mic 0..1 — gives the bead a living pulse
  remaining: number;    // 0..1 fraction of identities still present
  drop: number;         // increments on each drop → ripple
}

export default function SubtractYourselfCanvas({ envelope, remaining, drop }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, remaining: 1, t: 0, lastDrop: 0, ripples: [] as { t: number }[] });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.remaining = remaining; }, [remaining]);
  useEffect(() => {
    if (drop !== stateRef.current.lastDrop) {
      stateRef.current.lastDrop = drop;
      stateRef.current.ripples.push({ t: 0 });
    }
  }, [drop]);

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

      // Color drifts warm → silver as identities fall away
      const warmth = s.remaining; // 1 = full self, 0 = witness
      const r = Math.round(255 * (0.85 + 0.15 * (1 - warmth)));
      const g = Math.round(200 * warmth + 220 * (1 - warmth));
      const b = Math.round(140 * warmth + 235 * (1 - warmth));

      // Outer field — contracts as remaining shrinks
      const fieldR = Math.min(w, h) * (0.12 + 0.45 * warmth);
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldR);
      aura.addColorStop(0, `rgba(${r},${g},${b},${0.18 + 0.12 * warmth})`);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(cx, cy, fieldR, 0, Math.PI * 2); ctx.fill();

      // Drop ripples
      s.ripples = s.ripples.filter((rp) => {
        rp.t += dt;
        const radius = rp.t * 240;
        const alpha = Math.max(0, 0.4 - rp.t * 0.35);
        if (alpha <= 0.01) return false;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        return true;
      });

      // Witness bead — always present, breathes with mic
      const beadR = 3 + s.env * 6 + (1 - warmth) * 4 + Math.sin(s.t * 1.1) * 0.6;
      const beadGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, beadR * 8);
      beadGlow.addColorStop(0, `rgba(255,255,255,${0.3 + s.env * 0.3})`);
      beadGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = beadGlow;
      ctx.beginPath(); ctx.arc(cx, cy, beadR * 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
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
