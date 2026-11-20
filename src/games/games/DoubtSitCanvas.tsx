// DoubtSitCanvas — animated doubt visualization with truth emergence
"use client";

import { useEffect, useRef } from "react";

interface DoubtSitCanvasProps {
  phase: "intro" | "name" | "sit" | "true" | "integrate";
  doubt: string;
  grip: number;
  truth: string;
  seconds: number;
  breathEnvelope: number;
}

export default function DoubtSitCanvas({
  phase,
  doubt,
  grip,
  truth,
  seconds,
  breathEnvelope,
}: DoubtSitCanvasProps) {
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
      const maxRadius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Central doubt orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.25 * (0.8 + orbPulse * 0.2);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(125, 211, 252, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(180, 220, 255, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(125, 211, 252, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 220, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Grip visualization - rings around orb
      for (let i = 0; i < 10; i++) {
        if (i < grip) {
          const ringRadius = orbRadius * 1.5 + i * 8;
          const alpha = 0.08 * (grip - i);
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Spawn particles during sit phase
      if (phase === "sit" && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "125, 211, 252",
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

      // Truth visualization - emerges from center
      if (truth && (phase === "true" || phase === "integrate")) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = truth.split(" ");
        let line = "";
        let y = centerY + maxRadius + 30;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Progress ring (90s)
      if (phase === "sit") {
        const progress = 1 - seconds / SIT_SECONDS;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.9, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = "rgba(125, 211, 252, 0.6)";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.stroke();

        // Timer text
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        ctx.font = "bold 32px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${String(mins).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`, centerX, centerY);
      }

      // Doubt text
      if (doubt) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = doubt.split(" ");
        let line = "";
        let y = centerY - 100;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Grip indicator
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${grip}/10`, centerX, centerY + 80);

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Timer text during sit
      if (phase === "sit") {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${String(mins).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`, centerX, centerY);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, doubt, grip, truth, seconds, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const SIT_SECONDS = 90;