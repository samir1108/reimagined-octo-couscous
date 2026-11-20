// FearLadderCanvas — animated ladder with rungs lighting up
"use client";

import { useEffect, useRef } from "react";

interface FearLadderCanvasProps {
  phase: "intro" | "climb" | "reveal" | "integrate";
  rungs: Array<{ fear: string; grip: number; lived: boolean }>;
  step: number;
  breathEnvelope: number;
}

export default function FearLadderCanvas({
  phase,
  rungs,
  step,
  breathEnvelope,
}: FearLadderCanvasProps) {
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

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(15, 10, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 2, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Ladder rails
      const railX1 = centerX - 60;
      const railX2 = centerX + 60;
      const topY = size * 0.12;
      const bottomY = size * 0.88;

      // Left rail
      ctx.beginPath();
      ctx.moveTo(railX1, topY);
      ctx.lineTo(railX1, bottomY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Right rail
      ctx.beginPath();
      ctx.moveTo(railX2, topY);
      ctx.lineTo(railX2, bottomY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rungs
      const rungCount = 7;
      const rungHeight = (bottomY - topY) / (rungCount + 1);

      for (let i = 0; i < rungCount; i++) {
        const y = bottomY - (i + 1) * rungHeight;
        const isCompleted = i < 7; // Simplified - all rungs shown

        // Rung
        ctx.beginPath();
        ctx.moveTo(railX1, y);
        ctx.lineTo(railX2, y);
        const rungColor = i < 7 ? "251, 113, 133" : "148, 163, 184";
        const alpha = i < 7 ? 0.6 : 0.15;
        ctx.strokeStyle = `rgba(${rungColor}, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Rung glow for completed rungs
        if (i < 7) {
          const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2 + i);
          ctx.beginPath();
          ctx.moveTo(railX1, y);
          ctx.lineTo(railX2, y);
          ctx.strokeStyle = `rgba(251, 113, 133, ${0.3 + pulse * 0.3})`;
          ctx.lineWidth = 6;
          ctx.stroke();
        }

        // Rung number
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${7 - i}`, railX1 - 15, y);
      }

      // Spawn particles when climbing
      if (phase === "climb" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: "251, 113, 133",
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

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 113, 133, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Current rung indicator
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`RUNG ${step + 1} / 7`, centerX, size * 0.08);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, step, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}