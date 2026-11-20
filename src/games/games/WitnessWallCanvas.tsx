// WitnessWallCanvas — animated wall with urge particles
"use client";

import { useEffect, useRef } from "react";

interface WitnessWallCanvasProps {
  phase: "settle" | "sit" | "reveal" | "words" | "integrate";
  touches: number;
  tiltAvg: number;
  breathEnvelope: number;
  progress: number;
}

export default function WitnessWallCanvas({
  phase,
  touches,
  tiltAvg,
  breathEnvelope,
  progress,
}: WitnessWallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const wallLineRef = useRef(0);

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

      ctx.clearRect(0, 0, size, size);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, "rgba(30, 40, 50, 0.05)");
      grad.addColorStop(0.5, "rgba(15, 20, 25, 0.03)");
      grad.addColorStop(1, "rgba(30, 40, 50, 0.05)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);

      // Wall line (vertical)
      const wallX = centerX;
      const wallHeight = size * 0.7;
      const wallTop = centerY - wallHeight / 2;
      const wallBottom = centerY + wallHeight / 2;

      // Wall glow
      const wallGrad = ctx.createLinearGradient(wallX - 60, 0, wallX + 60, 0);
      wallGrad.addColorStop(0, "transparent");
      wallGrad.addColorStop(0.5, `rgba(125, 211, 252, ${0.15 + breathEnvelope * 0.2})`);
      wallGrad.addColorStop(1, "transparent");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(wallX - 60, wallTop, 120, wallHeight);

      // Wall core line
      ctx.beginPath();
      ctx.moveTo(wallX, wallTop);
      ctx.lineTo(wallX, wallBottom);
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.6 + breathEnvelope * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Breath pulse on wall
      const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      ctx.beginPath();
      ctx.moveTo(wallX, wallTop);
      ctx.lineTo(wallX, wallBottom);
      ctx.strokeStyle = `rgba(125, 211, 252, ${0.3 + pulse * 0.2})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Spawn urge particles when tilt or touches
      if (phase === "sit") {
        const spawnRate = 0.05 + tiltAvg * 2 + touches * 0.01;
        if (Math.random() < spawnRate) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const y = wallTop + Math.random() * wallHeight;
          particlesRef.current.push({
            x: wallX + side * (20 + Math.random() * 60),
            y: y,
            vx: side * (5 + Math.random() * 15),
            vy: (Math.random() - 0.5) * 10,
            size: 2 + Math.random() * 3,
            color: `hsl(${200 + Math.random() * 30}, 70%, ${50 + Math.random() * 20}%)`,
            life: 0,
            maxLife: 2 + Math.random() * 2,
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
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Touch impact rings
      if (touches > 0) {
        for (let i = 0; i < Math.min(touches, 12); i++) {
          const angle = (i / 12) * Math.PI * 2;
          const ringRadius = 80 + Math.sin(timeRef.current * 0.5 + i) * 15;
          const x = wallX + Math.cos(angle) * ringRadius;
          const y = centerY + Math.sin(angle) * ringRadius * 0.3;

          ctx.beginPath();
          ctx.arc(x, y, 8 + Math.sin(timeRef.current * 2 + i) * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 113, 133, ${0.3 + Math.sin(timeRef.current * 3 + i) * 0.2})`;
          ctx.fill();
        }
      }

      // Tilt visualization - wobble line
      if (tiltAvg > 0.1) {
        const wobble = Math.sin(timeRef.current * 5) * tiltAvg * 20;
        ctx.beginPath();
        ctx.moveTo(wallX, wallTop);
        for (let y = wallTop; y <= wallBottom; y += 10) {
          const t = (y - wallTop) / wallHeight;
          const offset = Math.sin(timeRef.current * 3 + t * 4) * wobble * (1 - t * 0.5);
          ctx.lineTo(wallX + offset, y);
        }
        ctx.strokeStyle = `rgba(251, 113, 133, ${Math.min(0.5, tiltAvg * 2)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Progress indicator
      const progressBarY = size * 0.92;
      const progressBarWidth = size * 0.6;
      const progressBarX = centerX - progressBarWidth / 2;

      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(progressBarX, progressBarY - 2, progressBarWidth, 4);

      ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
      ctx.fillRect(progressBarX, progressBarY - 2, progressBarWidth * progress, 4);

      // Timer text
      const remaining = Math.max(0, Math.ceil((1 - progress) * 90));
      ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${remaining}s`, centerX, centerY);

      // Phase label
      ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(125, 211, 252, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phase === "sit" ? "SITTING" : "WITNESS", centerX, centerY + 40);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, touches, tiltAvg, breathEnvelope, progress]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}