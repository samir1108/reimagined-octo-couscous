// StrangerSongCanvas — concentric sound rings emanating from a distant
// singer. Rings pulse with TTS-perceived phrasing (a slow 0.7Hz lull) plus
// the listener's own mic envelope (sigh / hum / breath catch). Color drifts
// across stanzas (warm → cool → silver) to suggest moving through tongues.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  stanza: number; // 0..n
  intensity: number; // 0..1 attention/charge
}

const PALETTE = [
  { a: "255,210,140", b: "180,90,60" },   // warm amber (longing)
  { a: "180,210,255", b: "60,90,180" },   // cool indigo (loss)
  { a: "230,230,240", b: "150,150,170" }, // silver (hope)
  { a: "255,180,200", b: "180,80,120" },  // rose (tenderness)
];

export default function StrangerSongCanvas({ envelope, stanza, intensity }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, intensity: 0, stanza: 0, t: 0 });

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.intensity = intensity; }, [intensity]);
  useEffect(() => { stateRef.current.stanza = stanza; }, [stanza]);

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
      const cx = w / 2, cy = h * 0.55;
      const palette = PALETTE[s.stanza % PALETTE.length];

      // Backdrop wash
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      bg.addColorStop(0, `rgba(${palette.a},${0.10 + s.intensity * 0.10})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

      // Phrasing pulse (TTS proxy) + mic envelope
      const phrase = 0.5 + 0.5 * Math.sin(s.t * 0.7);
      const energy = phrase * 0.5 + s.env * 0.6;

      // Concentric rings
      const ringCount = 7;
      for (let i = 0; i < ringCount; i++) {
        const phase = (s.t * 0.35 + i / ringCount) % 1;
        const r = phase * Math.min(w, h) * 0.55;
        const alpha = (1 - phase) * (0.08 + energy * 0.18);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${palette.a},${alpha})`;
        ctx.lineWidth = 1 + energy * 1.2;
        ctx.stroke();
      }

      // Distant singer — soft glowing core
      const coreR = 18 + energy * 22;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 4);
      core.addColorStop(0, `rgba(${palette.a},${0.35 + s.env * 0.3})`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx, cy, coreR * 4, 0, Math.PI * 2); ctx.fill();

      // Inner bead
      ctx.fillStyle = `rgba(${palette.a},0.8)`;
      ctx.beginPath(); ctx.arc(cx, cy, 2 + energy * 2, 0, Math.PI * 2); ctx.fill();

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
