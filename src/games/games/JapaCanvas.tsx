// JapaCanvas — animated mala beads circulating
"use client";

import { useEffect, useRef } from "react";

interface JapaCanvasProps {
  count: number;
  target: number;
  mantra: string;
  isActive: boolean;
}

export default function JapaCanvas({ count, target, mantra, isActive }: JapaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const beadPositionsRef = useRef<Array<{ angle: number; phase: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.7, 320);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize bead positions
    const BEAD_COUNT = 108;
    if (beadPositionsRef.current.length === 0) {
      for (let i = 0; i < BEAD_COUNT; i++) {
        beadPositionsRef.current.push({
          angle: (i / BEAD_COUNT) * Math.PI * 2,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const center = size / 2;
      const malaRadius = size * 0.38;

      ctx.clearRect(0, 0, size, size);

      // Background glow
      const grad = ctx.createRadialGradient(center, center, 0, center, center, size * 0.6);
      grad.addColorStop(0, "rgba(251, 191, 36, 0.03)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Mala string (subtle)
      ctx.beginPath();
      ctx.arc(center, center, malaRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Beads
      const completed = count;
      const BEAD_COUNT = 108;

      for (let i = 0; i < BEAD_COUNT; i++) {
        const bead = beadPositionsRef.current[i];
        // Subtle orbital drift
        const drift = Math.sin(timeRef.current * 0.15 + bead.phase) * 0.02;
        const angle = bead.angle + drift;

        // Completed beads move slightly inward
        const radiusOffset = i < completed ? -3 : 0;
        const r = malaRadius + radiusOffset;

        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;

        // Bead size
        const beadSize = 6 + (i < completed ? 1 : 0);

        // Bead gradient
        const beadGrad = ctx.createRadialGradient(x - beadSize * 0.3, y - beadSize * 0.3, 0, x, y, beadSize);
        if (i < completed) {
          beadGrad.addColorStop(0, "#fde68a");
          beadGrad.addColorStop(0.5, "#fbbf24");
          beadGrad.addColorStop(1, "#d97706");
        } else {
          beadGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
          beadGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
          beadGrad.addColorStop(1, "rgba(255, 255, 255, 0.02)");
        }

        ctx.beginPath();
        ctx.arc(x, y, beadSize, 0, Math.PI * 2);
        ctx.fillStyle = beadGrad;
        ctx.fill();

        // Glow for completed beads
        if (i < completed) {
          ctx.beginPath();
          ctx.arc(x, y, beadSize * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${0.08 + Math.sin(timeRef.current * 2 + i * 0.05) * 0.04})`;
          ctx.fill();
        }

        // Highlight current bead
        if (i === completed && completed < BEAD_COUNT) {
          const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 4);
          ctx.beginPath();
          ctx.arc(x, y, beadSize * (1.5 + pulse * 0.5), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 191, 36, ${0.5 + pulse * 0.3})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Center mantra text
      if (mantra) {
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
        ctx.font = "bold 28px 'Cormorant Garamond', 'Playfair Display', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.85 + pulse * 0.1})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mantra, center, center);

        // Subtle glow
        ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
        ctx.shadowBlur = 20;
        ctx.fillText(mantra, center, center);
        ctx.shadowBlur = 0;
      }

      // Progress ring
      const progress = count / target;
      ctx.beginPath();
      ctx.arc(center, center, malaRadius + 18, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, target, mantra, isActive]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}