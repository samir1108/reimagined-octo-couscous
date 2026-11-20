// GratitudeStormCanvas — animated storm visualization with word particles
"use client";

import { useEffect, useRef } from "react";

interface GratitudeStormCanvasProps {
  phase: "intro" | "storm" | "reveal" | "integrate";
  items: Array<{ text: string; t: number; spoken: boolean }>;
  remaining: number;
  breathEnvelope: number;
}

export default function GratitudeStormCanvas({
  phase,
  items,
  remaining,
  breathEnvelope,
}: GratitudeStormCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    word: string;
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
      bgGrad.addColorStop(0, "rgba(10, 20, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 8, 3, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Central storm orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.5);
      const orbRadius = maxRadius * 0.2 * (0.7 + orbPulse * 0.3);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(110, 231, 183, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(180, 255, 200, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(110, 231, 183, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 255, 200, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 130, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Spawn particles for new items
      if (phase === "storm" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 50;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "110, 231, 183",
          life: 0,
          maxLife: 3 + Math.random() * 2,
          word: "",
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

      // Word particles - show item words floating outward
      if (phase === "storm" || phase === "reveal") {
        items.forEach((item, i) => {
          if (!item.text) return;
          const angle = (i / Math.max(1, items.length)) * Math.PI * 2 + timeRef.current * 0.2;
          const radius = maxRadius * 0.5 + i * 20;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
          ctx.fillStyle = `rgba(110, 231, 183, ${0.7 + Math.sin(timeRef.current * 0.8 + i) * 0.2})`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(item.text.substring(0, 20), x, y);
        });
      }

      // Progress ring (90s)
      const progress = 1 - remaining / 90;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Timer text
      ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${remaining}s`, centerX, centerY);

      // Item count
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${items.length} things`, centerX, centerY + maxRadius * 0.3);

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${breathEnvelope * 0.3})`;
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
  }, [phase, items, remaining, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}