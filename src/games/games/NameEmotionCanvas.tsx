// NameEmotionCanvas — animated emotion storm particles
"use client";

import { useEffect, useRef, useState } from "react";

interface NameEmotionCanvasProps {
  phase: "pick" | "rate" | "breathe" | "reflect" | "integrate";
  picked: string[];
  intensity: number | null;
  breathEnvelope: number;
}

export default function NameEmotionCanvas({
  phase,
  picked,
  intensity,
  breathEnvelope,
}: NameEmotionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    word?: string;
  }>>([]);
  const [wordParticles, setWordParticles] = useState<Array<{ word: string; x: number; y: number; opacity: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const size = Math.min(window.innerWidth * 0.85, 420);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx?.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize word particles when picked changes
    if (picked.length > 0 && wordParticles.length === 0) {
      const centerX = canvas.width / (window.devicePixelRatio || 1) / 2;
      const centerY = canvas.height / (window.devicePixelRatio || 1) / 2;
      setWordParticles(picked.map((w, i) => ({
        word: w,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        opacity: 1,
      })));
    }

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;

      ctx.clearRect(0, 0, size, size);

      // Background glow based on phase
      if (phase === "pick") {
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.7);
        grad.addColorStop(0, "rgba(99, 102, 241, 0.04)");
        grad.addColorStop(0.5, "rgba(251, 191, 36, 0.02)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      } else if (phase === "rate" && intensity) {
        const heat = intensity / 10;
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.6);
        grad.addColorStop(0, `rgba(251, 113, 133, ${0.06 * heat})`);
        grad.addColorStop(0.5, `rgba(251, 191, 36, ${0.04 * heat})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      } else if (phase === "breathe") {
        const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 0.8);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.5);
        grad.addColorStop(0, `rgba(165, 180, 252, ${0.03 + pulse * 0.02})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }

      // Spawn particles based on phase
      if (phase === "pick" && Math.random() < 0.15) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 40,
          y: centerY + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: `hsl(${240 + Math.random() * 60}, 70%, 60%)`,
          life: 0,
          maxLife: 3 + Math.random() * 2,
        });
      } else if (phase === "rate" && intensity && Math.random() < intensity * 0.04) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 40 + Math.random() * 60;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
          color: `hsl(${Math.random() * 20}, 80%, 55%)`,
          life: 0,
          maxLife: 2 + Math.random() * 1.5,
        });
      } else if (phase === "breathe" && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 25;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: `hsl(${210 + Math.random() * 30}, 60%, 65%)`,
          life: 0,
          maxLife: 4 + Math.random() * 2,
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 10 * dt; // gravity

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.6;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Draw word particles
      wordParticles.forEach((wp, i) => {
        // Gentle orbital drift
        const angle = timeRef.current * 0.15 + i * 0.5;
        const radius = 60 + Math.sin(timeRef.current * 0.3 + i) * 20;
        wp.x = centerX + Math.cos(angle) * radius;
        wp.y = centerY + Math.sin(angle) * radius + Math.sin(timeRef.current * 0.7 + i) * 15;
        wp.opacity = 0.7 + Math.sin(timeRef.current * 1.2 + i) * 0.2;

        ctx.font = "italic 16px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(165, 180, 252, ${wp.opacity})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(wp.word, wp.x, wp.y);

        // Glow
        ctx.shadowColor = "rgba(165, 180, 252, 0.4)";
        ctx.shadowBlur = 15;
        ctx.fillText(wp.word, wp.x, wp.y);
        ctx.shadowBlur = 0;
      });

      // Breath envelope visualization
      if (phase === "breathe" && breathEnvelope > 0.1) {
        const ringRadius = size * 0.35 + breathEnvelope * 40;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${breathEnvelope * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Intensity rings
      if (phase === "rate" && intensity) {
        for (let i = 0; i < intensity; i++) {
          const r = size * 0.2 + i * 8 + Math.sin(timeRef.current * 2 + i) * 3;
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251, 113, 133, ${0.08 / (i + 1)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, picked, intensity, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}