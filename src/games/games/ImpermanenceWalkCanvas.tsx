// ImpermanenceWalkCanvas — animated flow visualization with chime particles
"use client";

import { useEffect, useRef } from "react";

interface ImpermanenceWalkCanvasProps {
  phase: "intro" | "walk" | "reveal" | "integrate";
  chimes: number;
  entries: Array<{ t: number; text: string; spoken: boolean }>;
  remaining: number;
  breathEnvelope: number;
}

export default function ImpermanenceWalkCanvas({
  phase,
  chimes,
  entries,
  remaining,
  breathEnvelope,
}: ImpermanenceWalkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const chimeRingsRef = useRef<Array<{ radius: number; alpha: number; maxRadius: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.85, 400);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(10, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Chime rings expanding
      chimeRingsRef.current = chimeRingsRef.current.filter(r => {
        r.radius += 80 * dt;
        r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
        if (r.alpha <= 0.01) return false;

        ctx.beginPath();
        ctx.arc(centerX, centerY, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${r.alpha * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        return true;
      });

      // Spawn particles for new entries
      if (phase === "walk" && entries.length > 0 && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "125, 211, 252",
          life: 0,
          maxLife: 3 + Math.random() * 2,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // Central flow orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.2 * (0.8 + orbPulse * 0.3);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(125, 211, 252, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(180, 220, 255, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(125, 211, 252, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 220, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Progress ring (5 min)
      const progress = 1 - remaining / DURATION_S;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Timer text
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      ctx.font = "bold 32px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`, centerX, centerY);

      // Chime count
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${chimes} / ${TOTAL_CHIMES}`, centerX, centerY + maxRadius * 0.3);

      // Entry count
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${entries.length} changes`, centerX, centerY + maxRadius * 0.5);

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, chimes, entries, remaining, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const DURATION_S = 5 * 60;
const CHIME_EVERY_S = 30;
const TOTAL_CHIMES = DURATION_S / CHIME_EVERY_S; // 10