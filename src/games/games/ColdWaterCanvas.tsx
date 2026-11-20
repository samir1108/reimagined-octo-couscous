// ColdWaterCanvas — cinematic still pool of dark water.
// Layers, back-to-front:
//   1. Deep abyss vignette (ink black → faint teal)
//   2. Caustic light shafts drifting across the pool surface
//   3. Cold mist particles rising with mic envelope
//   4. Meniscus rim — glowing edge where water meets darkness
//   5. Ambient breath waves — three refined rings with dual stroke
//   6. Splash ripples (dual stroke: soft outer glow + crisp inner)
//   7. Droplets — arcing with gravity, leaving a trail glow
//   8. Camera brightness halo (subtle, warm counterpoint)
import { useEffect, useRef } from "react";

export default function ColdWaterCanvas({
  micLevel,
  brightness,
  splashPulse,
  intensity = 0,
}: {
  micLevel: number;
  brightness: number | null;
  splashPulse: number;
  intensity?: number; // 0..1 ambient anticipation
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; a: number; w: number }>>([]);
  const dropsRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
  const mistRef = useRef<Array<{ x: number; y: number; vy: number; r: number; a: number; life: number }>>([]);
  const lastPulseRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (splashPulse <= lastPulseRef.current) return;
    lastPulseRef.current = splashPulse;
    const c = canvasRef.current;
    if (!c) return;
    const cx = c.width / 2;
    const cy = c.height / 2;
    // Spawn 5 layered ripples for richer bloom
    for (let i = 0; i < 5; i++) {
      ripplesRef.current.push({ x: cx, y: cy, r: 8 + i * 5, a: 0.62 - i * 0.09, w: 2.4 });
    }
    // Spawn droplets (denser burst)
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 8;
      dropsRef.current.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 3,
        life: 1,
      });
    }
    // Cool mist puff on splash
    for (let i = 0; i < 22; i++) {
      const ang = Math.random() * Math.PI * 2;
      mistRef.current.push({
        x: cx + Math.cos(ang) * (10 + Math.random() * 40),
        y: cy + Math.sin(ang) * (10 + Math.random() * 40),
        vy: -(0.4 + Math.random() * 1.2),
        r: 8 + Math.random() * 22,
        a: 0.18 + Math.random() * 0.14,
        life: 1,
      });
    }
  }, [splashPulse]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      c.width = c.clientWidth * devicePixelRatio;
      c.height = c.clientHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      const w = c.width, h = c.height;
      // Deep ink base with soft persistence
      ctx.fillStyle = "rgba(3,6,14,0.35)";
      ctx.fillRect(0, 0, w, h);

      // Abyss vignette
      const cx = w / 2, cy = h / 2;
      const baseR = Math.min(w, h) * 0.42;
      const abyss = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      abyss.addColorStop(0, `rgba(20, 40, 60, ${0.22 + intensity * 0.14})`);
      abyss.addColorStop(0.6, "rgba(6, 12, 22, 0.35)");
      abyss.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = abyss;
      ctx.fillRect(0, 0, w, h);

      // Caustic light shafts — slow sinuous streaks across pool surface
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const phase = t * 0.25 + i * 1.7;
        const yy = cy + Math.sin(phase) * baseR * 0.5;
        const grd = ctx.createLinearGradient(0, yy - 3, 0, yy + 3);
        grd.addColorStop(0, "rgba(0,0,0,0)");
        grd.addColorStop(0.5, `rgba(140, 200, 240, ${0.05 + micLevel * 0.06})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(cx - baseR, yy - 3, baseR * 2, 6);
      }
      ctx.restore();

      // Pool gradient (main disc)
      const grad = ctx.createRadialGradient(cx, cy, baseR * 0.1, cx, cy, baseR);
      const calmA = 0.38 + intensity * 0.22;
      grad.addColorStop(0, `rgba(150, 200, 235, ${calmA})`);
      grad.addColorStop(0.5, `rgba(60, 120, 170, ${calmA * 0.55})`);
      grad.addColorStop(1, "rgba(5, 15, 30, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx.fill();

      // Meniscus rim — cold light where water meets void
      ctx.save();
      ctx.shadowColor = "rgba(180, 220, 255, 0.5)";
      ctx.shadowBlur = 20 * devicePixelRatio;
      ctx.strokeStyle = `rgba(180, 220, 255, ${0.28 + intensity * 0.18})`;
      ctx.lineWidth = 1.2 * devicePixelRatio;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * (1 + Math.sin(t * 0.5) * 0.008), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ambient breathing waves — dual stroke each
      const breath = 1 + Math.sin(t * 0.7) * 0.04;
      for (let i = 0; i < 3; i++) {
        const rr = baseR * (0.4 + i * 0.18) * breath;
        // outer soft glow
        ctx.strokeStyle = `rgba(150, 210, 240, ${0.05 + micLevel * 0.25})`;
        ctx.lineWidth = 3 * devicePixelRatio;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
        // crisp inner
        ctx.strokeStyle = `rgba(200, 230, 255, ${0.10 + micLevel * 0.35})`;
        ctx.lineWidth = 0.8 * devicePixelRatio;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      }

      // Cold mist particles (rise, fade)
      mistRef.current = mistRef.current.filter((m) => {
        m.y += m.vy * devicePixelRatio;
        m.life -= 0.008;
        m.r += 0.15 * devicePixelRatio;
        if (m.life <= 0) return false;
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(200, 230, 255, ${m.a * m.life * 0.9})`);
        mg.addColorStop(1, "rgba(200, 230, 255, 0)");
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        return true;
      });

      // Live ripples — dual stroke, softer glow
      ripplesRef.current = ripplesRef.current.filter(rp => {
        rp.r += 4.4 * devicePixelRatio;
        rp.a *= 0.965;
        rp.w *= 1.008;
        // outer glow
        ctx.save();
        ctx.shadowColor = "rgba(180, 220, 255, 0.55)";
        ctx.shadowBlur = 14 * devicePixelRatio;
        ctx.strokeStyle = `rgba(180, 220, 255, ${rp.a * 0.55})`;
        ctx.lineWidth = (rp.w + 1.5) * devicePixelRatio;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        // crisp inner
        ctx.strokeStyle = `rgba(230, 245, 255, ${rp.a})`;
        ctx.lineWidth = rp.w * devicePixelRatio;
        ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
        return rp.a > 0.02 && rp.r < baseR * 1.7;
      });

      // Droplets — with soft glow trail
      dropsRef.current = dropsRef.current.filter(d => {
        d.x += d.vx * devicePixelRatio;
        d.y += d.vy * devicePixelRatio;
        d.vy += 0.28 * devicePixelRatio; // gravity
        d.life -= 0.016;
        if (d.life <= 0) return false;
        // Glow
        ctx.save();
        ctx.shadowColor = "rgba(200, 230, 255, 0.7)";
        ctx.shadowBlur = 8 * devicePixelRatio;
        ctx.fillStyle = `rgba(230, 245, 255, ${d.life})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2.2 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // Hot core
        ctx.fillStyle = `rgba(255, 255, 255, ${d.life * 0.9})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 0.9 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      // Brightness halo (camera glow)
      if (brightness != null) {
        const b = Math.max(0, Math.min(1, brightness));
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
        halo.addColorStop(0, `rgba(255, 245, 210, ${b * 0.05})`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [micLevel, brightness, intensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
