// ThoughtWatcherFieldCanvas — deep-space witness field. Two parallax star
// layers, a cool aurora nebula that breathes with mic envelope, faint
// "eye" iris at center (the witness), and expanding rings whenever a thought
// is noted. Cinematic 60fps canvas.
import { useEffect, useRef } from "react";

export default function ThoughtWatcherFieldCanvas({
  envelope,
  notedPulse,
}: {
  envelope: number;
  notedPulse: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastNotedRef = useRef(0);
  const ripplesRef = useRef<Array<{ r: number; a: number; x: number; y: number }>>([]);
  const motesRef = useRef<Array<{ x: number; y: number; r: number; a: number; vy: number; tw: number; depth: 0 | 1 }>>([]);
  const tRef = useRef(0);
  const envRef = useRef(envelope);
  envRef.current = envelope;

  useEffect(() => {
    if (notedPulse <= lastNotedRef.current) return;
    lastNotedRef.current = notedPulse;
    const c = canvasRef.current;
    if (!c) return;
    // Two nested rings per note — inner crisp, outer soft
    ripplesRef.current.push({
      r: 6,
      a: 0.62,
      x: c.width * (0.28 + Math.random() * 0.44),
      y: c.height * (0.32 + Math.random() * 0.36),
    });
  }, [notedPulse]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      c.width = c.clientWidth * devicePixelRatio;
      c.height = c.clientHeight * devicePixelRatio;
      // seed motes once
      if (motesRef.current.length === 0) {
        for (let i = 0; i < 140; i++) {
          const depth: 0 | 1 = Math.random() < 0.55 ? 0 : 1;
          motesRef.current.push({
            x: Math.random() * c.width,
            y: Math.random() * c.height,
            r: (depth === 1 ? 0.7 + Math.random() * 1.6 : 0.3 + Math.random() * 0.8) * devicePixelRatio,
            a: depth === 1 ? 0.28 + Math.random() * 0.4 : 0.1 + Math.random() * 0.2,
            vy: ((depth === 1 ? -0.08 : -0.03) - Math.random() * 0.12) * devicePixelRatio,
            tw: Math.random() * Math.PI * 2,
            depth,
          });
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const tick = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      const w = c.width, h = c.height;
      const env = envRef.current;
      // Deep ink base — no full clear, gives dust a soft persistence
      ctx.fillStyle = "rgba(4,6,14,0.28)";
      ctx.fillRect(0, 0, w, h);

      // ─── Aurora nebula wash — two off-center orbs breathing with envelope ─
      const cx = w / 2, cy = h / 2;
      const drift1 = Math.sin(t * 0.15) * w * 0.12;
      const drift2 = Math.cos(t * 0.11) * h * 0.09;
      const heat = 0.05 + env * 0.22;

      const g1 = ctx.createRadialGradient(cx + drift1, cy * 0.75, 0, cx + drift1, cy * 0.75, Math.max(w, h) * 0.55);
      g1.addColorStop(0, `rgba(120, 170, 220, ${heat})`);
      g1.addColorStop(0.5, `rgba(80, 130, 200, ${heat * 0.35})`);
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      const g2 = ctx.createRadialGradient(cx - drift1 * 0.6, cy + drift2, 0, cx - drift1 * 0.6, cy + drift2, Math.max(w, h) * 0.5);
      g2.addColorStop(0, `rgba(160, 130, 200, ${heat * 0.7})`);
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // ─── Witness iris — faint eye at center, opens with envelope ─────────
      const irisR = Math.min(w, h) * (0.06 + env * 0.05);
      const iris = ctx.createRadialGradient(cx, cy, 0, cx, cy, irisR * 4);
      iris.addColorStop(0, `rgba(180, 210, 255, ${0.05 + env * 0.08})`);
      iris.addColorStop(0.4, `rgba(140, 180, 230, ${0.02})`);
      iris.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.arc(cx, cy, irisR * 4, 0, Math.PI * 2);
      ctx.fill();

      // ─── FAR dust (slow, small) ─────────────────────────────────────────
      for (const m of motesRef.current) {
        if (m.depth !== 0) continue;
        m.y += m.vy;
        m.tw += 0.02;
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(200, 220, 255, ${m.a * tw * 0.75})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── NEAR stars — larger, twinkling with soft halo ───────────────────
      for (const m of motesRef.current) {
        if (m.depth !== 1) continue;
        m.y += m.vy;
        m.tw += 0.035;
        if (m.y < -10) { m.y = h + 10; m.x = Math.random() * w; }
        const tw = 0.4 + Math.sin(m.tw) * 0.6;
        // halo
        if (tw > 0.7) {
          ctx.fillStyle = `rgba(200, 220, 255, ${m.a * 0.15 * tw})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(230, 240, 255, ${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── Ripples from "noted" taps — double ring with glow ───────────────
      ripplesRef.current = ripplesRef.current.filter((r) => {
        r.r += 2.8 * devicePixelRatio;
        r.a *= 0.965;
        // Outer soft glow
        ctx.strokeStyle = `rgba(180, 210, 255, ${r.a * 0.35})`;
        ctx.lineWidth = 3 * devicePixelRatio;
        ctx.shadowColor = "rgba(180,210,255,0.6)";
        ctx.shadowBlur = 10 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Crisp inner ring
        ctx.strokeStyle = `rgba(220, 235, 255, ${r.a})`;
        ctx.lineWidth = 1.1 * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
        return r.a > 0.04;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
