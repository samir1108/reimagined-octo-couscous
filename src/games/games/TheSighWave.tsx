// TheSighWave — cinematic breath oscilloscope.
// Layers, back-to-front:
//   1. Deep amber vignette + drifting dust motes (persistent, breathes with env)
//   2. Subtle horizon grid (three faint rules) — anchors the wave in space
//   3. Target waveform (dashed amber) with a soft under-glow fill
//   4. Playhead — vertical beam + glowing bead at target curve
//   5. User envelope (gold) — dual-stroke: soft outer halo + crisp inner line
//   6. Sigh-detected wash (radial gold burst) on pulse

import { useEffect, useRef } from "react";

interface Props {
  envelope: number;       // 0..1 live mic envelope
  cycleProgress: number;  // 0..1 progress within the current guided cycle
  showTarget: boolean;
  pulse: number;          // increment for a "sigh detected" pulse highlight
}

const WIDTH_SAMPLES = 240;

export default function TheSighWave({ envelope, cycleProgress, showTarget, pulse }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samplesRef = useRef<number[]>(new Array(WIDTH_SAMPLES).fill(0));
  const rafRef = useRef<number | null>(null);
  const envRef = useRef(envelope);
  const cpRef = useRef(cycleProgress);
  const showRef = useRef(showTarget);
  const lastPulseRef = useRef(pulse);
  const flashRef = useRef(0);
  const motesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number; tw: number }>>([]);
  const tRef = useRef(0);
  envRef.current = envelope;
  cpRef.current = cycleProgress;
  showRef.current = showTarget;

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
      if (motesRef.current.length === 0) {
        for (let i = 0; i < 60; i++) {
          motesRef.current.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -(0.05 + Math.random() * 0.18),
            r: 0.4 + Math.random() * 1.4,
            a: 0.10 + Math.random() * 0.25,
            tw: Math.random() * Math.PI * 2,
          });
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // Cyclic-sigh target shape — two short inhale spikes + long exhale fall.
    // u in [0..1] → amplitude in [0..1]
    const target = (u: number) => {
      if (u < 0.12) return Math.sin((u / 0.12) * Math.PI) * 0.8;            // inhale 1
      if (u < 0.20) return 0.6;                                              // hold
      if (u < 0.32) return 0.6 + Math.sin(((u - 0.20) / 0.12) * Math.PI) * 0.4; // inhale 2 → 1.0
      if (u < 0.95) return 1.0 - ((u - 0.32) / 0.63);                        // long exhale
      return 0;
    };

    const draw = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const midY = h * 0.55;

      // Deep ink base — soft persistence, gives motes a trail
      ctx.fillStyle = "rgba(6,4,2,0.30)";
      ctx.fillRect(0, 0, w, h);

      // Ambient amber vignette breathing with envelope
      const env = envRef.current;
      const vign = ctx.createRadialGradient(w / 2, midY, 0, w / 2, midY, Math.max(w, h) * 0.65);
      vign.addColorStop(0, `rgba(245,158,11,${0.05 + env * 0.06})`);
      vign.addColorStop(0.6, `rgba(180,90,20,${0.02 + env * 0.03})`);
      vign.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = vign;
      ctx.fillRect(0, 0, w, h);

      // Drifting dust motes
      for (const m of motesRef.current) {
        m.x += m.vx;
        m.y += m.vy;
        m.tw += 0.02;
        if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
        if (m.x < -4) m.x = w + 4;
        if (m.x > w + 4) m.x = -4;
        const tw = 0.5 + Math.sin(m.tw) * 0.5;
        ctx.fillStyle = `rgba(253,224,171,${m.a * tw})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle horizon grid — three barely-there rules
      for (const off of [-0.28, 0, 0.28]) {
        ctx.strokeStyle = `rgba(253,224,171,${off === 0 ? 0.08 : 0.03})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, midY + off * h * 0.5);
        ctx.lineTo(w, midY + off * h * 0.5);
        ctx.stroke();
      }

      // shift sample buffer
      const samples = samplesRef.current;
      samples.shift();
      samples.push(envRef.current);

      // pulse flash
      if (lastPulseRef.current !== pulse) { flashRef.current = 1; lastPulseRef.current = pulse; }
      flashRef.current = Math.max(0, flashRef.current - 0.02);

      // Target waveform — soft under-glow fill + dashed stroke on top
      if (showRef.current) {
        const N = 220;
        // Build path once, reuse for fill + stroke
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          const x = u * w;
          const yAmp = target(u);
          const y = midY - yAmp * (h * 0.32);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        // extend down to midY for fill
        ctx.lineTo(w, midY);
        ctx.lineTo(0, midY);
        ctx.closePath();
        const fill = ctx.createLinearGradient(0, midY - h * 0.32, 0, midY);
        fill.addColorStop(0, `rgba(245,158,11,${0.10 + flashRef.current * 0.06})`);
        fill.addColorStop(1, "rgba(245,158,11,0)");
        ctx.fillStyle = fill;
        ctx.fill();

        // Dashed target stroke
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = `rgba(253,200,90,${0.42 + flashRef.current * 0.3})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const u = i / (N - 1);
          const x = u * w;
          const yAmp = target(u);
          const y = midY - yAmp * (h * 0.32);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Playhead — vertical beam + glowing bead exactly on the target curve
        const cp = Math.max(0, Math.min(1, cpRef.current));
        const px = cp * w;
        const beam = ctx.createLinearGradient(px, 0, px, h);
        beam.addColorStop(0, "rgba(253,224,71,0)");
        beam.addColorStop(0.5, "rgba(253,224,71,0.35)");
        beam.addColorStop(1, "rgba(253,224,71,0)");
        ctx.strokeStyle = beam;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, 0); ctx.lineTo(px, h);
        ctx.stroke();

        const by = midY - target(cp) * (h * 0.32);
        ctx.save();
        ctx.shadowColor = "rgba(253,224,71,0.8)";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "rgba(253,224,71,0.95)";
        ctx.beginPath(); ctx.arc(px, by, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath(); ctx.arc(px, by, 1.1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // User envelope — dual-stroke: outer wide soft halo + crisp inner line
      const buildPath = () => {
        ctx.beginPath();
        for (let i = 0; i < samples.length; i++) {
          const x = (i / (samples.length - 1)) * w;
          const y = midY - samples[i] * (h * 0.32);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      };
      // Outer halo
      ctx.save();
      ctx.strokeStyle = `rgba(253,224,71,${0.22 + flashRef.current * 0.2})`;
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(253,224,71,0.55)";
      ctx.shadowBlur = 12 + flashRef.current * 18;
      buildPath();
      ctx.stroke();
      ctx.restore();
      // Crisp inner
      ctx.strokeStyle = `rgba(255,240,180,${0.9 + flashRef.current * 0.1})`;
      ctx.lineWidth = 1.3;
      buildPath();
      ctx.stroke();

      // Head-of-wave bead — reads the last sample
      const lastY = midY - samples[samples.length - 1] * (h * 0.32);
      ctx.save();
      ctx.shadowColor = "rgba(253,224,71,0.8)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(255,240,180,0.95)";
      ctx.beginPath(); ctx.arc(w - 2, lastY, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // sigh-detected halo
      if (flashRef.current > 0.05) {
        const grad = ctx.createRadialGradient(w / 2, midY, 10, w / 2, midY, w * 0.45);
        grad.addColorStop(0, `rgba(253,224,71,${0.24 * flashRef.current})`);
        grad.addColorStop(0.5, `rgba(245,158,11,${0.10 * flashRef.current})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

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
