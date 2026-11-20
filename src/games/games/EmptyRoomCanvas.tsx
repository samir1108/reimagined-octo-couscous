// EmptyRoomCanvas — breathing void with settling particles
"use client";

import { useEffect, useRef } from "react";

interface EmptyRoomCanvasProps {
  phase: "settle" | "room" | "exit" | "integrate";
  settled: boolean;
  breathEnvelope: number;
  progress: number;
  seconds: number;
}

export default function EmptyRoomCanvas({
  phase,
  settled,
  breathEnvelope,
  progress,
  seconds,
}: EmptyRoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; life: number; maxLife: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.9, 400);
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

      // Background - deep void
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.1)");
      bgGrad.addColorStop(1, "rgba(5, 5, 15, 1)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Breathing central void
      const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.5);
      const voidRadius = maxRadius * (0.15 + pulse * 0.1 + breathEnvelope * 0.2);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, voidRadius * 3);
      glowGrad.addColorStop(0, `rgba(100, 120, 180, ${0.05 + pulse * 0.03})`);
      glowGrad.addColorStop(0.5, "transparent");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, voidRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Main void circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, voidRadius, 0, Math.PI * 2);
      const voidGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, voidRadius);
      voidGrad.addColorStop(0, "rgba(30, 40, 80, 0.8)");
      voidGrad.addColorStop(0.5, "rgba(15, 20, 40, 0.6)");
      voidGrad.addColorStop(1, "rgba(5, 5, 15, 1)");
      ctx.fillStyle = voidGrad;
      ctx.fill();

      // Settling particles
      if (phase === "room") {
        // Spawn particles
        if (Math.random() < 0.03) {
          const angle = Math.random() * Math.PI * 2;
          const distance = maxRadius * 0.5 + Math.random() * maxRadius * 0.4;
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: 1 + Math.random() * 2,
            opacity: 0.05 + Math.random() * 0.1,
            life: 0,
            maxLife: 8 + Math.random() * 4,
          });
        }

        // Update and draw particles
        particlesRef.current = particlesRef.current.filter(p => {
          p.life += dt;
          if (p.life >= p.maxLife) return false;

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Settled particles slow down and fade
          const slowdown = settled ? 0.95 : 1;
          p.vx *= slowdown;
          p.vy *= slowdown;

          const prog = p.life / p.maxLife;
          const alpha = p.opacity * (1 - prog);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - prog * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
          ctx.fill();

          return true;
        });
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, voidRadius * 2 + breathEnvelope * 60, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 120, 180, ${breathEnvelope * 0.4})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Progress ring (5 min)
      if (progress > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = "rgba(125, 211, 252, 0.4)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Timer text
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(180, 200, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${mins}:${String(secs).padStart(2, "0")}`, centerX, centerY);

      // Status text
      ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = `rgba(180, 200, 255, ${settled ? 0.7 : 0.4})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(settled ? "SETTLED" : "SETTLING", centerX, centerY + maxRadius * 0.5);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, settled, breathEnvelope, progress, seconds]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}