// HeartCoherenceBridgeCanvas — luminous bridge spanning two heart-shores.
// Left shore = SELF (rose), right shore = OTHER (gold). A glowing arc rises
// on inhale, settles on exhale; particles cross the span on each exhale.
// Bridge solidity grows with `coherence` (0..1).
//
// Pure canvas. No DOM nodes per particle.

import { useEffect, useRef } from "react";

interface Props {
  /** 0..1 pacer — 1 crest (full inhale), 0 trough (full exhale) */
  pacer: number;
  /** 0..1 smoothed mic envelope */
  envelope: number;
  /** 0..1 coherence with target 5.5 bpm */
  coherence: number;
  /** Phase emphasis */
  phase: "settle" | "name" | "calibrate" | "rounds" | "send" | "integrate";
  /** Trigger a "send" pulse — increment number to fire a wave */
  sendPulse: number;
}

interface Crosser {
  /** progress 0..1 along the arc */
  t: number;
  /** speed */
  v: number;
  /** vertical lift offset */
  lift: number;
  /** size */
  s: number;
  /** 0 = self->other, 1 = other->self */
  dir: 0 | 1;
  alive: boolean;
}

const MAX_CROSSERS = 80;

export default function HeartCoherenceBridgeCanvas({
  pacer, envelope, coherence, phase, sendPulse,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const crossersRef = useRef<Crosser[]>([]);
  const motesRef = useRef<Array<{ x: number; y: number; r: number; a: number; vx: number; tw: number }>>([]);
  const rafRef = useRef<number | null>(null);
  const pacerRef = useRef(pacer);
  const envRef = useRef(envelope);
  const cohRef = useRef(coherence);
  const phaseRef = useRef(phase);
  const lastPacerRef = useRef(pacer);
  const lastSendRef = useRef(sendPulse);
  pacerRef.current = pacer;
  envRef.current = envelope;
  cohRef.current = coherence;
  phaseRef.current = phase;

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

      // Seed motes once we know dimensions
      if (motesRef.current.length === 0) {
        for (let i = 0; i < 55; i++) {
          motesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h * 0.85,
            r: 0.4 + Math.random() * 1.3,
            a: 0.08 + Math.random() * 0.22,
            vx: (Math.random() - 0.5) * 0.15,
            tw: Math.random() * Math.PI * 2,
          });
        }
      }

      // motion blur
      ctx.fillStyle = "rgba(4,3,8,0.22)";
      ctx.fillRect(0, 0, w, h);

      const p = pacerRef.current;
      const env = envRef.current;
      const coh = cohRef.current;
      const ph = phaseRef.current;

      // Shore positions
      const shoreY = h * 0.62;
      const selfX = w * 0.18;
      const otherX = w * 0.82;
      const midX = (selfX + otherX) / 2;
      // Arc apex lifts on inhale
      const apexY = shoreY - (h * 0.18 + p * h * 0.18 + env * 8);

      // Drifting dust motes — rose→gold gradient across the field
      for (const m of motesRef.current) {
        m.x += m.vx;
        m.tw += 0.02;
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        const mix = m.x / w; // 0..1 rose→gold
        const r = Math.round(244 + (253 - 244) * mix);
        const g = Math.round(114 + (224 - 114) * mix);
        const b = Math.round(182 + (71 - 182) * mix);
        ctx.fillStyle = `rgba(${r},${g},${b},${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Water shimmer band beneath the bridge — subtle horizontal streaks
      ctx.save();
      const bandY = shoreY + 40;
      for (let i = 0; i < 6; i++) {
        const y = bandY + i * 6;
        const phase = (t * 0.02 + i * 1.7);
        const offset = Math.sin(phase) * 12;
        ctx.strokeStyle = `rgba(180,140,90,${0.04 + (i === 2 ? 0.05 : 0) + env * 0.02})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(selfX - 20 + offset, y);
        ctx.lineTo(otherX + 20 + offset, y);
        ctx.stroke();
      }
      ctx.restore();

      // Bridge bezier — quadratic from self → apex → other
      const drawArc = (offset: number, alpha: number, lineWidth: number) => {
        ctx.beginPath();
        ctx.moveTo(selfX, shoreY + offset);
        ctx.quadraticCurveTo(midX, apexY + offset, otherX, shoreY + offset);
        ctx.strokeStyle = `rgba(253, 224, 71, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();
      };

      // Glow layers — count grows with coherence
      const layers = 3 + Math.floor(coh * 4);
      ctx.save();
      ctx.shadowColor = "rgba(253,224,71,0.55)";
      ctx.shadowBlur = 14 + coh * 20;
      for (let i = layers; i > 0; i--) {
        drawArc(0, (0.04 + coh * 0.06) * i, i * 2.5);
      }
      ctx.restore();
      // Core line — solidity tied to coherence
      drawArc(0, 0.45 + coh * 0.45, 1.2 + coh * 1.2);

      // Inhale pulse rings around each shore (grow with inhale peak)
      if (p > 0.15) {
        const pr = 90 + p * 30;
        ctx.strokeStyle = `rgba(244,114,182,${0.06 + p * 0.12})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(selfX, shoreY, pr, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(253,224,71,${0.06 + p * 0.12})`;
        ctx.beginPath(); ctx.arc(otherX, shoreY, pr, 0, Math.PI * 2); ctx.stroke();
      }

      // Self shore — rose heart glow
      const selfGlow = ctx.createRadialGradient(selfX, shoreY, 0, selfX, shoreY, 90);
      selfGlow.addColorStop(0, "rgba(244,114,182,0.55)");
      selfGlow.addColorStop(0.5, "rgba(190,24,93,0.2)");
      selfGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = selfGlow;
      ctx.beginPath(); ctx.arc(selfX, shoreY, 90, 0, Math.PI * 2); ctx.fill();

      // Other shore — gold heart glow
      const otherGlow = ctx.createRadialGradient(otherX, shoreY, 0, otherX, shoreY, 90);
      otherGlow.addColorStop(0, "rgba(253,224,71,0.55)");
      otherGlow.addColorStop(0.5, "rgba(245,158,11,0.2)");
      otherGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = otherGlow;
      ctx.beginPath(); ctx.arc(otherX, shoreY, 90, 0, Math.PI * 2); ctx.fill();

      // Shore cores — with hot shadow bloom
      const drawCore = (x: number, hue: string) => {
        ctx.save();
        ctx.shadowColor = hue;
        ctx.shadowBlur = 18;
        ctx.fillStyle = hue;
        ctx.beginPath();
        ctx.arc(x, shoreY, 8 + env * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCore(selfX, "rgba(255,228,240,0.95)");
      drawCore(otherX, "rgba(255,250,220,0.95)");

      // Detect exhale start (pacer crosses below 0.5 from above) → spawn crossers
      const crossing = lastPacerRef.current > 0.5 && p <= 0.5;
      lastPacerRef.current = p;
      if ((crossing && (ph === "rounds" || ph === "send")) || lastSendRef.current !== sendPulse) {
        const burst = lastSendRef.current !== sendPulse ? 28 : 8 + Math.floor(coh * 12);
        lastSendRef.current = sendPulse;
        for (let i = 0; i < burst; i++) {
          const slot = crossersRef.current.find((c) => !c.alive);
          const c: Crosser = {
            t: 0,
            v: 0.004 + Math.random() * 0.006,
            lift: (Math.random() - 0.5) * 12,
            s: 1.2 + Math.random() * 2,
            dir: Math.random() < 0.85 ? 0 : 1,
            alive: true,
          };
          if (slot) Object.assign(slot, c);
          else if (crossersRef.current.length < MAX_CROSSERS) crossersRef.current.push(c);
        }
      }

      // Render crossers along the bezier
      for (let i = 0; i < crossersRef.current.length; i++) {
        const c = crossersRef.current[i];
        if (!c.alive) continue;
        c.t += c.v;
        if (c.t >= 1) { c.alive = false; continue; }
        const u = c.dir === 0 ? c.t : 1 - c.t;
        // quadratic bezier point
        const x = (1 - u) * (1 - u) * selfX + 2 * (1 - u) * u * midX + u * u * otherX;
        const y = (1 - u) * (1 - u) * shoreY + 2 * (1 - u) * u * apexY + u * u * shoreY + c.lift;
        const fade = Math.sin(c.t * Math.PI); // bright in middle
        ctx.fillStyle = c.dir === 0
          ? `rgba(253,224,71,${0.3 + fade * 0.65})`
          : `rgba(244,114,182,${0.3 + fade * 0.65})`;
        ctx.beginPath();
        ctx.arc(x, y, c.s + fade * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Coherence ribbon underneath the bridge — fills as score climbs
      if (ph === "rounds" || ph === "send" || ph === "integrate") {
        ctx.beginPath();
        ctx.moveTo(selfX, shoreY + 24);
        const fillX = selfX + (otherX - selfX) * coh;
        ctx.lineTo(fillX, shoreY + 24);
        ctx.strokeStyle = `rgba(253,224,71,${0.4 + coh * 0.4})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(253,224,71,0.6)";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Send burst halo
      if (ph === "send") {
        const pulse = (Math.sin(t / 18) + 1) * 0.5;
        ctx.strokeStyle = `rgba(253,224,71,${0.15 + pulse * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(otherX, shoreY, 60 + pulse * 40, 0, Math.PI * 2);
        ctx.stroke();
      }

      t += 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sendPulse]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
