// ForgivenessDoorCanvas — animated door visualization with weight tracking
"use client";

import { useEffect, useRef } from "react";

interface ForgivenessDoorCanvasProps {
  phase: "intro" | "who" | "cost" | "keep" | "release" | "integrate";
  who: string;
  cost: string;
  keep: string;
  release: string;
  weightBefore: number;
  weightAfter: number;
  breathEnvelope: number;
}

export default function ForgivenessDoorCanvas({
  phase,
  who,
  cost,
  keep,
  release,
  weightBefore,
  weightAfter,
  breathEnvelope,
}: ForgivenessDoorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const doorOpenRef = useRef(0);

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
      const doorWidth = size * 0.3;
      const doorHeight = size * 0.55;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(20, 15, 20, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 5, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Door animation
      const targetOpen = phase === "integrate" ? 1 : phase === "release" ? 0.7 : phase === "keep" ? 0.4 : phase === "cost" ? 0.3 : 0;
      doorOpenRef.current += (targetOpen - doorOpenRef.current) * 0.03;

      // Door frame
      const doorX = centerX - doorWidth / 2;
      const doorY = centerY - doorHeight / 2;

      // Door shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(doorX + 8, doorY + 8, doorWidth, doorHeight);

      // Door gradient
      const doorGrad = ctx.createLinearGradient(doorX, doorY, doorX + doorWidth, doorY + doorHeight);
      doorGrad.addColorStop(0, "rgba(80, 40, 120, 0.4)");
      doorGrad.addColorStop(0.5, "rgba(120, 60, 180, 0.3)");
      doorGrad.addColorStop(1, "rgba(60, 30, 100, 0.4)");
      ctx.fillStyle = doorGrad;

      // Door opening animation
      const openWidth = doorWidth * doorOpenRef.current;
      ctx.fillRect(doorX + doorWidth - openWidth, doorY, openWidth, doorHeight);

      // Door frame
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

      // Door hinge
      ctx.beginPath();
      ctx.arc(doorX, doorY + doorHeight / 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.fill();

      // Particles flowing through door
      if (doorOpenRef.current > 0.2 && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "196, 181, 253",
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

      // Weight indicators
      // Before weight (left)
      ctx.beginPath();
      ctx.arc(centerX - 100, centerY - 80, 25, 0, Math.PI * 2);
      const beforeGrad = ctx.createRadialGradient(centerX - 100, centerY - 80, 0, centerX - 100, centerY - 80, 25);
      beforeGrad.addColorStop(0, `rgba(251, 113, 133, ${weightBefore / 10 * 0.4})`);
      beforeGrad.addColorStop(1, "rgba(251, 113, 133, 0.1)");
      ctx.fillStyle = beforeGrad;
      ctx.fill();

      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${weightBefore}/10`, centerX - 100, centerY - 80);

      ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("WEIGHT BEFORE", centerX - 100, centerY - 50);

      // After weight (right)
      if (phase === "release" || phase === "integrate") {
        ctx.beginPath();
        ctx.arc(centerX + 100, centerY - 80, 25, 0, Math.PI * 2);
        const afterGrad = ctx.createRadialGradient(centerX + 100, centerY - 80, 0, centerX + 100, centerY - 80, 25);
        afterGrad.addColorStop(0, `rgba(110, 231, 183, ${weightAfter / 10 * 0.4})`);
        afterGrad.addColorStop(1, "rgba(110, 231, 183, 0.1)");
        ctx.fillStyle = afterGrad;
        ctx.fill();

        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${weightAfter}/10`, centerX + 100, centerY - 80);

        ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("WEIGHT AFTER", centerX + 100, centerY - 50);
      }

      // Delta visualization
      if (phase === "release" || phase === "integrate") {
        const delta = weightBefore - weightAfter;
        if (delta > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX - 100, centerY - 80);
          ctx.lineTo(centerX + 100, centerY - 80);
          ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
          ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`released ${delta}`, centerX, centerY - 100);
        }
      }

      // Who name
      if (who) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(196, 181, 253, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`for ${who}`, centerX, size * 0.12);
      }

      // Phase labels
      const phaseLabels = { who: "WHO", cost: "COST", keep: "KEEP", release: "RELEASE", integrate: "REST" };
      if (phaseLabels[phase]) {
        ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(196, 181, 253, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(phaseLabels[phase], centerX, size * 0.08);
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196, 181, 253, ${breathEnvelope * 0.3})`;
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
  }, [phase, who, weightBefore, weightAfter, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}