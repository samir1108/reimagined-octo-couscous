// TitikshaSitCanvas — animated duality visualization with shift tracking
"use client";

import { useEffect, useRef } from "react";

interface TitikshaSitCanvasProps {
  phase: "intro" | "pair" | "sit" | "report" | "integrate";
  heat: string;
  cold: string;
  movedBefore: number;
  movedAfter: number;
  breathEnvelope: number;
}

export default function TitikshaSitCanvas({
  phase,
  heat,
  cold,
  movedBefore,
  movedAfter,
  breathEnvelope,
}: TitikshaSitCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    side: "heat" | "cold";
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
      bgGrad.addColorStop(0, "rgba(20, 10, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 2, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Two sides - heat (left) and cold (right)
      const leftX = centerX - 80;
      const rightX = centerX + 80;
      const positions = {
        heat: { x: leftX, y: centerY, color: "251, 113, 133", label: "HEAT" },
        cold: { x: rightX, y: centerY, color: "45, 212, 191", label: "COLD" },
      };

      // Draw connection line between them
      if (phase === "sit" || phase === "report") {
        const p1 = positions.heat;
        const p2 = positions.cold;
        
        // Connection line with pulse
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 + pulse * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -timeRef.current * 30;
        ctx.stroke();
        ctx.setLineDash([]);

        // Particles flowing between them
        if (phase === "sit" && Math.random() < 0.05) {
          particlesRef.current.push({
            x: p1.x,
            y: p1.y,
            vx: (p2.x - p1.x) * 0.02,
            vy: (p2.y - p1.y) * 0.02,
            size: 3 + Math.random() * 3,
            color: p1.color,
            life: 0,
            maxLife: 2 + Math.random() * 1,
            side: "heat",
          });
        }
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

      // Draw heat and cold orbs
      Object.entries(positions).forEach(([side, pos]) => {
        const isActive = (phase === "sit" && pos.x === leftX) || phase === "report";
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * (phase === "sit" ? 2 : 0.8));
        const orbRadius = 50 * (0.8 + pulse * 0.2);
        
        // Orb glow
        const orbGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, orbRadius * 2);
        orbGrad.addColorStop(0, `rgba(${pos.color}, ${isActive ? 0.3 : 0.1})`);
        orbGrad.addColorStop(1, "transparent");
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, orbRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Orb core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, orbRadius, 0, Math.PI * 2);
        const coreGrad = ctx.createRadialGradient(pos.x - orbRadius * 0.3, pos.y - orbRadius * 0.3, 0, pos.x, pos.y, orbRadius);
        coreGrad.addColorStop(0, `rgba(${pos.color}, 0.9)`);
        coreGrad.addColorStop(0.5, `rgba(${pos.color}, 0.5)`);
        coreGrad.addColorStop(1, `rgba(${pos.color}, 0.1)`);
        ctx.fillStyle = coreGrad;
        ctx.fill();

        // Label
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${pos.color}, 0.8)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pos.label, pos.x, pos.y - orbRadius - 25);

        // Active indicator
        if (isActive) {
          const pulseAlpha = 0.5 + 0.5 * Math.sin(timeRef.current * 3);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, orbRadius + 15, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${pos.color}, ${pulseAlpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

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

      // Timer display during sit phase
      if (phase === "sit") {
        const size = canvas.width / (window.devicePixelRatio || 1);
        ctx.font = "bold 64px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(seconds), size / 2, size / 2);
      }

      // Round indicators
      const dotY = size - 60;
      const dotSpacing = 18;
      const startX = size / 2 - 3 * dotSpacing / 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(startX + i * dotSpacing, dotY, i < 4 ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i < 4 ? "rgba(251, 113, 133, 0.8)" : "rgba(255, 255, 255, 0.15)";
        if (i === 0) {
          ctx.shadowColor = "rgba(251, 113, 133, 0.6)";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Moved before indicator
      if (movedBefore > 0) {
        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${movedBefore} before`, size / 2, size - 100);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}