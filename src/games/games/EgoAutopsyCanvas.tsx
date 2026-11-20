// EgoAutopsyCanvas — animated autopsy visualization with cutting metaphor
"use client";

import { useEffect, useRef } from "react";

interface EgoAutopsyCanvasProps {
  phase: "intro" | "write" | "read" | "verdict" | "integrate";
  round: number;
  entries: string[];
  grips: boolean[];
  breathEnvelope: number;
}

export default function EgoAutopsyCanvas({
  phase,
  round,
  entries,
  grips,
  breathEnvelope,
}: EgoAutopsyCanvasProps) {
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
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Autopsy table visualization
      const tableY = size * 0.6;
      const tableWidth = size * 0.7;
      const tableX = (size - tableWidth) / 2;

      // Table surface
      ctx.fillStyle = "rgba(30, 30, 40, 0.15)";
      ctx.fillRect(tableX, tableY, tableWidth, 40);

      // Table edge
      ctx.beginPath();
      ctx.moveTo(tableX, tableY);
      ctx.lineTo(tableX + tableWidth, tableY);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Drawn lines (entries) on the table
      const entries = state.context.entries || [];
      entries.forEach((text, i) => {
        const y = tableY + 15 + i * 30;
        const x = tableX + 20;
        const width = tableWidth - 40;

        // Line background
        ctx.fillStyle = "rgba(15, 15, 25, 0.3)";
        ctx.fillRect(x, y, width, 25);

        // Line text (truncated)
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text.substring(0, 60) + (text.length > 60 ? "…" : ""), x + 10, y + 12.5);

        // Grip indicator
        if (state.context.grips[i]) {
          ctx.beginPath();
          ctx.arc(tableX + tableWidth - 20, y + 12, 6, 0, Math.PI * 2);
          const gripGrad = ctx.createRadialGradient(tableX + tableWidth - 20, y + 12, 0, tableX + tableWidth - 20, y + 12, 6);
          gripGrad.addColorStop(0, "rgba(251, 191, 36, 0.9)");
          gripGrad.addColorStop(1, "rgba(180, 120, 30, 0.6)");
          ctx.fillStyle = gripGrad;
          ctx.fill();
        }
      }

      );

      // Spawn particles when writing
      if (phase === "write" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: size / 2,
          y: size / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "148, 163, 184",
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

      // Progress indicator (cuts completed)
      const cutsCompleted = state.context.entries.length;
      const totalCuts = 5;
      const cutSpacing = 40;
      const startX = size / 2 - (totalCuts - 1) * 15;
      for (let i = 0; i < totalCuts; i++) {
        ctx.beginPath();
        ctx.arc(startX + i * 30, size - 60, i < state.context.entries.length ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i < state.context.entries.length ? "rgba(148, 163, 184, 0.8)" : "rgba(255, 255, 255, 0.15)";
        if (i === state.context.entries.length) {
          ctx.shadowColor = "rgba(148, 163, 184, 0.6)";
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Scalpel visualization during write phase
      if (phase === "write") {
        const scalpelX = size / 2 + Math.sin(timeRef.current * 2) * 60;
        const scalpelY = size / 2 - 80 + Math.cos(timeRef.current * 1.5) * 20;
        
        ctx.beginPath();
        ctx.moveTo(scalpelX - 40, scalpelY);
        ctx.lineTo(scalpelX + 40, scalpelY - 20);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Scalpel tip
        ctx.beginPath();
        ctx.arc(scalpelX + 40, scalpelY - 20, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.fill();
      }

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Progress dots
      const progress = state.context.entries.length / 5;
      ctx.beginPath();
      ctx.arc(size / 2, size * 0.9, size * 0.3, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

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