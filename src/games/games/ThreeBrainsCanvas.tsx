// ThreeBrainsCanvas — three luminous pillars (head / heart / gut).
// Each pillar's height = `levels[b]` 0..1; intensity = `active === b`.
// Particles rise inside the active pillar based on `pulse` increments
// (one per keystroke / mic spike). On REVEAL, the winning pillar erupts.

import { useEffect, useRef } from "react";

export type Brain = "head" | "heart" | "gut";

interface Props {
  active: Brain | null;
  levels: Record<Brain, number>;
  pulse: number;
  reveal: Brain | null;
}

const COLORS: Record<Brain, [string, string, string]> = {
  // [bright, mid, halo-rgb]
  head:  ["rgba(196,181,253,1)", "rgba(139,92,246,0.85)", "139,92,246"],   // violet
  heart: ["rgba(253,164,175,1)", "rgba(244,63,94,0.85)",  "244,63,94"],    // rose
  gut:   ["rgba(253,230,138,1)", "rgba(245,158,11,0.85)", "245,158,11"],   // amber
};

const ORDER: Brain[] = ["head", "heart", "gut"];

interface Spark { b: Brain; y: number; v: number; s: number; alive: boolean; }

export default function ThreeBrainsCanvas({ active, levels, pulse, reveal }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const lastPulseRef = useRef(pulse);
  const activeRef = useRef(active);
  const levelsRef = useRef(levels);
  const revealRef = useRef(reveal);
  activeRef.current = active;
  levelsRef.current = levels;
  revealRef.current = reveal;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // motion blur
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.fillRect(0, 0, w, h);

      const baseY = h * 0.86;     // pillar floor
      const topY = h * 0.18;      // max pillar top
      const maxH = baseY - topY;
      const colW = w / 3;
      const pillarW = Math.min(colW * 0.42, 92);

      // Floor line
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.moveTo(0, baseY); ctx.lineTo(w, baseY);
      ctx.stroke();

      // Spawn sparks on pulse
      const ac = activeRef.current;
      if (lastPulseRef.current !== pulse && ac) {
        lastPulseRef.current = pulse;
        for (let i = 0; i < 4; i++) {
          const slot = sparksRef.current.find((s) => !s.alive);
          const s: Spark = { b: ac, y: baseY - 4, v: 1.4 + Math.random() * 1.6, s: 1 + Math.random() * 2, alive: true };
          if (slot) Object.assign(slot, s); else if (sparksRef.current.length < 200) sparksRef.current.push(s);
        }
      }
      // Reveal mode: continuous eruption from winner
      if (revealRef.current) {
        for (let i = 0; i < 3; i++) {
          const slot = sparksRef.current.find((s) => !s.alive);
          const s: Spark = { b: revealRef.current, y: baseY - 4, v: 1.8 + Math.random() * 2.4, s: 1.2 + Math.random() * 2.4, alive: true };
          if (slot) Object.assign(slot, s); else if (sparksRef.current.length < 200) sparksRef.current.push(s);
        }
      }

      // Render pillars
      ORDER.forEach((b, i) => {
        const cx = colW * (i + 0.5);
        const lvl = Math.max(0.05, Math.min(1, levelsRef.current[b]));
        const ph = maxH * lvl;
        const top = baseY - ph;
        const isActive = ac === b || revealRef.current === b;
        const [bright, mid, halo] = COLORS[b];

        // Halo behind pillar
        const haloR = pillarW * (isActive ? 2.4 : 1.4);
        const grad = ctx.createRadialGradient(cx, baseY - ph * 0.55, 0, cx, baseY - ph * 0.55, haloR);
        grad.addColorStop(0, `rgba(${halo},${isActive ? 0.45 : 0.18})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, baseY - ph * 0.55, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Pillar gradient (top bright → bottom mid)
        const pg = ctx.createLinearGradient(cx, top, cx, baseY);
        pg.addColorStop(0, bright);
        pg.addColorStop(1, mid);
        ctx.fillStyle = pg;
        ctx.shadowColor = `rgba(${halo},0.8)`;
        ctx.shadowBlur = isActive ? 28 : 10;
        // rounded rect
        const r = pillarW / 2;
        ctx.beginPath();
        ctx.moveTo(cx - r, baseY);
        ctx.lineTo(cx - r, top + r);
        ctx.quadraticCurveTo(cx - r, top, cx - r + r, top);
        ctx.lineTo(cx + r - r, top);
        ctx.quadraticCurveTo(cx + r, top, cx + r, top + r);
        ctx.lineTo(cx + r, baseY);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Active shimmer band
        if (isActive) {
          const bandY = top + (Math.sin(t / 22) + 1) * 0.5 * ph;
          ctx.fillStyle = `rgba(255,255,255,${0.18})`;
          ctx.fillRect(cx - r, bandY, pillarW, 2);
        }

        // Label below
        ctx.fillStyle = isActive ? `rgba(${halo},0.95)` : "rgba(255,255,255,0.35)";
        ctx.font = "10px ui-sans-serif, system-ui";
        const label = b.toUpperCase();
        ctx.textAlign = "center";
        ctx.fillText(label, cx, baseY + 22);
      });

      // Render sparks (rising inside pillars)
      ctx.textAlign = "left";
      for (let i = 0; i < sparksRef.current.length; i++) {
        const s = sparksRef.current[i];
        if (!s.alive) continue;
        s.y -= s.v;
        const idx = ORDER.indexOf(s.b);
        const cx = colW * (idx + 0.5) + (Math.random() - 0.5) * (pillarW * 0.6);
        const lvl = Math.max(0.05, Math.min(1, levelsRef.current[s.b]));
        const ph = maxH * lvl;
        const top = baseY - ph;
        if (s.y < top) { s.alive = false; continue; }
        const [, , halo] = COLORS[s.b];
        const fade = (s.y - top) / ph;
        ctx.fillStyle = `rgba(${halo},${0.4 + fade * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, s.y, s.s, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pulse]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
