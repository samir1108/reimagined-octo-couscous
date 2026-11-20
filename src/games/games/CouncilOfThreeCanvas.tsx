// CouncilOfThreeCanvas — cinematic council of three masters.
// Three hot-core orbs in a triangle around a central "you" bloom, drifting
// dust motes, filament lines that pulse when a master is speaking, and
// concentric ripples from the active speaker.
import { useEffect, useRef } from "react";

interface Props {
  envelope: number;
  speakerIdx: number; // 0..2 active speaker, -1 none
}

type Mote = { ang: number; rad: number; r: number; a: number; tw: number; vAng: number };
type Ripple = { idx: number; r: number; a: number };

export default function CouncilOfThreeCanvas({ envelope, speakerIdx }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ env: 0, idx: -1, t: 0, lastIdx: -1 });
  const motesRef = useRef<Mote[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => { stateRef.current.env = envelope; }, [envelope]);
  useEffect(() => { stateRef.current.idx = speakerIdx; }, [speakerIdx]);

  useEffect(() => {
    if (motesRef.current.length === 0) {
      motesRef.current = Array.from({ length: 55 }, () => ({
        ang: Math.random() * Math.PI * 2,
        rad: 60 + Math.random() * 260,
        r: 0.4 + Math.random() * 1.4,
        a: 0.08 + Math.random() * 0.22,
        tw: Math.random() * Math.PI * 2,
        vAng: (Math.random() - 0.5) * 0.06,
      }));
    }

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

    const HUES = [40, 200, 330]; // stoic amber, mystic blue, warrior magenta

    let raf = 0; let last = performance.now();
    const render = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      const s = stateRef.current; s.t += dt;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const ringR = Math.min(w, h) * 0.28;

      // Spawn ripple when speaker changes
      if (s.idx !== s.lastIdx) {
        if (s.idx >= 0) ripplesRef.current.push({ idx: s.idx, r: 20, a: 0.55 });
        s.lastIdx = s.idx;
      }

      // Drifting dust motes
      for (const m of motesRef.current) {
        m.ang += m.vAng * dt;
        m.tw += dt * 0.7;
        const x = cx + Math.cos(m.ang) * m.rad;
        const y = cy + Math.sin(m.ang) * m.rad;
        const tw = 0.55 + 0.45 * Math.sin(m.tw);
        ctx.beginPath();
        ctx.arc(x, y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,220,255,${m.a * tw})`;
        ctx.fill();
      }

      // 3 master orbs
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * ringR;
        const y = cy + Math.sin(angle) * ringR;
        const active = i === s.idx;
        const pulse = active ? 1 + Math.sin(s.t * 3.2) * 0.22 : 0.55 + Math.sin(s.t * 0.7 + i) * 0.05;

        // Filament from center to node
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = `hsla(${HUES[i]}, 70%, 68%, ${active ? 0.42 : 0.08})`;
        ctx.lineWidth = active ? 1.2 : 0.6;
        ctx.stroke();

        // Outer soft halo via shadow
        const rad = 70 * pulse;
        ctx.save();
        ctx.shadowColor = `hsla(${HUES[i]}, 85%, 65%, ${active ? 0.85 : 0.35})`;
        ctx.shadowBlur = active ? 55 : 24;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, `hsla(${HUES[i]}, 85%, 70%, ${active ? 0.7 : 0.22})`);
        grd.addColorStop(0.5, `hsla(${HUES[i]}, 75%, 55%, ${active ? 0.28 : 0.08})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Hot core
        ctx.beginPath();
        ctx.arc(x, y, active ? 6 : 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${HUES[i]}, 90%, ${active ? 88 : 72}%, ${active ? 0.95 : 0.6})`;
        ctx.fill();

        // Dual-stroke ring
        ctx.beginPath();
        ctx.arc(x, y, 14 + (active ? Math.sin(s.t * 3) * 3 : 0), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${HUES[i]}, 75%, 70%, ${active ? 0.5 : 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Speaker ripples
      ripplesRef.current = ripplesRef.current.filter(rp => rp.a > 0.02);
      for (const rp of ripplesRef.current) {
        const angle = (rp.idx / 3) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * ringR;
        const y = cy + Math.sin(angle) * ringR;
        ctx.save();
        ctx.strokeStyle = `hsla(${HUES[rp.idx]}, 80%, 72%, ${rp.a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, rp.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        rp.r += 55 * dt;
        rp.a *= 0.965;
      }

      // Center "you" bloom pulses with envelope
      const cr = 6 + s.env * 22;
      ctx.save();
      ctx.shadowColor = "rgba(255,240,220,0.8)";
      ctx.shadowBlur = 30 + s.env * 40;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 2.5);
      cg.addColorStop(0, `rgba(255,248,232,${0.55 + s.env * 0.4})`);
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,248,232,${0.55 + s.env * 0.35})`;
      ctx.fill();

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />;
}
