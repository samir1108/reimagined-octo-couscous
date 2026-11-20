// VairagyaTestCanvas — animated grip/release visualization
"use client";

import { useEffect, useRef } from "react";

interface VairagyaTestCanvasProps {
  phase: "intro" | "grip" | "gone" | "verdict" | "integrate";
  grip: number[];
  gone: number[];
  idx: number;
  breathEnvelope: number;
}

export default function VairagyaTestCanvas({
  phase,
  grip,
  gone,
  idx,
  breathEnvelope,
}: VairagyaTestCanvasProps) {
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
      bgGrad.addColorStop(0, "rgba(20, 15, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Current item visualization
      const currentGrip = grip[idx];
      const currentGone = gone[idx];
      const delta = Math.max(0, grip[idx] - gone[idx]);

      // Two circles: grip (left) and gone (right)
      const leftX = centerX - 80;
      const rightX = centerX + 80;
      const circleRadius = 60;

      // Grip circle (left)
      ctx.beginPath();
      ctx.arc(centerX - 80, centerY, circleRadius * (0.3 + currentGrip / 10 * 0.7), 0, Math.PI * 2);
      const gripGrad = ctx.createRadialGradient(centerX - 80, centerY, 0, centerX - 80, centerY, circleRadius);
      gripGrad.addColorStop(0, "rgba(251, 191, 36, 0.6)");
      gripGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.4)");
      gripGrad.addColorStop(1, "rgba(120, 50, 20, 0.2)");
      ctx.fillStyle = gripGrad;
      ctx.fill();

      // Gone circle (right)
      ctx.beginPath();
      ctx.arc(centerX + 80, centerY, circleRadius * (0.3 + gone[idx] / 10 * 0.7), 0, Math.PI * 2);
      const goneGrad = ctx.createRadialGradient(centerX + 80, centerY, 0, centerX + 80, centerY, circleRadius);
      goneGrad.addColorStop(0, "rgba(110, 231, 183, 0.6)");
      goneGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.4)");
      goneGrad.addColorStop(1, "rgba(20, 100, 80, 0.2)");
      ctx.fillStyle = goneGrad;
      ctx.fill();

      // Delta visualization - arrow between circles
      const deltaWidth = Math.abs(grip[idx] - gone[idx]) * 4;
      if (grip[idx] > gone[idx]) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + (grip[idx] - gone[idx]) * 4, centerY);
        ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Labels
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GRIP", centerX - 80, centerY - circleRadius - 20);

      ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
      ctx.fillText("GONE", centerX + 80, centerY - circleRadius - 20);

      // Value labels
      ctx.font = "bold 24px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(grip[idx]), centerX - 80, centerY);

      ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
      ctx.fillText(String(gone[idx]), centerX + 80, centerY);

      // Delta label
      if (grip[idx] > gone[idx]) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`release ${grip[idx] - gone[idx]}`, centerX, centerY + circleRadius + 30);
      }

      // Spawn particles
      if (phase === "grip" || phase === "gone") {
        if (Math.random() < 0.05) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 20 + Math.random() * 40;
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 100,
            y: centerY + (Math.random() - 0.5) * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: "251, 191, 36",
            life: 0,
            maxLife: 3 + Math.random() * 2,
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

      // Progress indicator
      const progress = (idx + 1) / 9;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.85, 80, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Item number
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${idx + 1} / 9`, centerX, size * 0.95);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [idx, grip, gone]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}