// HaraDropCanvas — animated hara orb with pressure visualization
"use client";

import { useEffect, useRef } from "react";

interface HaraDropCanvasProps {
  phase: "settle" | "hold" | "breathe" | "reflect" | "integrate";
  pressing: boolean;
  breathEnvelope: number;
  inhaleDepth: number;
  elapsed: number;
  totalPressMs: number;
}

export default function HaraDropCanvas({
  phase,
  pressing,
  breathEnvelope,
  inhaleDepth,
  elapsed,
  totalPressMs,
}: HaraDropCanvasProps) {
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
      const size = Math.min(window.innerWidth * 0.85, 380);
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
      // Hara is lower belly - position lower on canvas
      const centerY = size * 0.65;
      const maxRadius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background gradient - warm earth tones
      const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      grad.addColorStop(0, "rgba(180, 90, 30, 0.06)");
      grad.addColorStop(0.5, "rgba(120, 50, 20, 0.03)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Press visualization - expanding rings when pressing
      if (pressing) {
        for (let i = 0; i < 3; i++) {
          const ringRadius = maxRadius * (0.5 + i * 0.15) + Math.sin(timeRef.current * 0.8 + i) * 8;
          const alpha = 0.04 * (3 - i);
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Spawn particles when pressing
      if (pressing && Math.random() < 0.2) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 40,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 4,
          color: `hsl(${20 + Math.random() * 30}, 80%, ${50 + Math.random() * 20}%)`,
          life: 0,
          maxLife: 2 + Math.random() * 2,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 20 * dt; // gravity downward

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Main hara orb
      const pressPulse = pressing ? 0.5 + 0.5 * Math.sin(timeRef.current * 2) : 0;
      const breathPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.8);
      const orbRadius = maxRadius * (0.5 + pressPulse * 0.2 + breathPulse * 0.1);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(251, 191, 36, ${0.25 + pressPulse * 0.15})`);
      orbGrad.addColorStop(0.5, `rgba(240, 140, 60, ${0.15 + pressPulse * 0.1})`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(255, 220, 150, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.6)");
      coreGrad.addColorStop(1, "rgba(120, 50, 20, 0.4)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Pressure ring (grows with press duration)
      const pressProgress = Math.min(1, totalPressMs / 90000);
      if (pressProgress > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * (0.8 + pressProgress * 0.3), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.2 + pressProgress * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${breathEnvelope * 0.4})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -timeRef.current * 20;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Inhale depth visualization
      if (inhaleDepth > 0 && phase === "breathe") {
        const depthRatio = Math.min(1, inhaleDepth / 8000);
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.4 * (1 + depthRatio), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${0.3 + depthRatio * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Progress arc at bottom
      const progress = Math.min(1, elapsed / 90000);
      const arcRadius = maxRadius * 1.3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Timer text
      const remaining = Math.max(0, Math.ceil((90000 - elapsed) / 1000));
      ctx.font = "bold 32px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${remaining}s`, centerX, centerY);

      // Phase label
      ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phase === "settle" ? "PLACE HAND" : phase === "hold" ? "PRESS & HOLD" : "BREATHE DEEPER", centerX, centerY + orbRadius + 40);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, pressing, breathEnvelope, inhaleDepth, elapsed, totalPressMs]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}