// ShadowInterviewCanvas — animated shadow visualization with dwell tracking
"use client";

import { useEffect, useRef } from "react";

interface ShadowInterviewCanvasProps {
  phase: "intro" | "ask" | "rate" | "verdict" | "integrate";
  idx: number;
  answers: Array<{ q: string; a: string; dwell: number }>;
  breathEnvelope: number;
}

export default function ShadowInterviewCanvas({
  phase,
  idx,
  answers,
  breathEnvelope,
}: ShadowInterviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const shadowDepthRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(20, 10, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Shadow depth
      if (phase === "ask") {
        shadowDepthRef.current = Math.min(1, shadowDepthRef.current + dt * 0.5);
      } else if (phase === "rate" || phase === "verdict" || phase === "integrate") {
        shadowDepthRef.current = Math.max(0, shadowDepthRef.current - dt * 0.2);
      } else {
        shadowDepthRef.current = Math.max(0, shadowDepthRef.current - dt * 0.1);
      }

      // Central shadow orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.25 * (0.8 + orbPulse * 0.2);

      // Shadow depth glow
      const depthGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.8);
      depthGrad.addColorStop(0, `rgba(120, 80, 180, ${0.08 + shadowDepthRef.current * 0.1})`);
      depthGrad.addColorStop(0.5, "rgba(180, 140, 220, 0.04)");
      depthGrad.addColorStop(1, "transparent");
      ctx.fillStyle = depthGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(165, 180, 252, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 200, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Shadow rings
      for (let i = 1; i <= 4; i++) {
        const ringRadius = maxRadius * (0.4 + i * 0.15) + Math.sin(timeRef.current * 0.5 + i) * 5;
        const alpha = 0.03 * (5 - i) * (1 + shadowDepthRef.current);
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spawn particles when answering
      if (phase === "ask" && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: `hsl(${260 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`,
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
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Question progress indicator
      const progress = (idx + 1) / 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.8, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(165, 180, 252, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Timer text (dwell)
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1} / 6`, centerX, centerY);

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Answer count
      ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${answers.length} answered`, centerX, centerY + maxRadius * 0.4);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, idx, answers, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}