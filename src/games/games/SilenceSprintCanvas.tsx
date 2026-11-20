// SilenceSprintCanvas — animated silence visualization
"use client";

import { useEffect, useRef } from "react";

interface SilenceSprintCanvasProps {
  phase: "ready" | "run" | "reveal" | "reflect" | "integrate";
  level: number;
  breaks: number;
  silentPct: number;
  remainingSec: number;
  breathEnvelope: number;
}

export default function SilenceSprintCanvas({
  phase,
  level,
  breaks,
  silentPct,
  remainingSec,
  breathEnvelope,
}: SilenceSprintCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);

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
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Central silence orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const silenceScale = 0.8 + (silentPct / 100) * 0.4;
      const orbRadius = maxRadius * 0.25 * silenceScale * (0.8 + orbPulse * 0.2);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(148, 163, 184, ${0.3 + silentPct / 200})`);
      orbGrad.addColorStop(0.5, `rgba(125, 211, 252, ${0.1 + silentPct / 300})`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(148, 163, 184, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(125, 211, 252, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.2)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Silence rings
      for (let i = 1; i <= 5; i++) {
        const ringRadius = orbRadius * 1.5 * i;
        const alpha = 0.03 * (6 - i) * (silentPct / 100);
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spawn break particles
      if (phase === "run" && Math.random() < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 50;
        particlesRef.current.push({
          x: size / 2,
          y: size / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: "251, 113, 133",
          life: 0,
          maxLife: 2 + Math.random() * 1.5,
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

      // Silence percentage ring
      const progress = silentPct / 100;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Timer text
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      ctx.font = "bold 32px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`, centerX, centerY);

      // Stats
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${breaks} breaks`, centerX, centerY + maxRadius * 0.5);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, level, breaks, silentPct, remainingSec, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}