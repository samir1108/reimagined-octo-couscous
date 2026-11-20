// EnvyCompassCanvas — animated compass with direction needles
"use client";

import { useEffect, useRef } from "react";

interface EnvyCompassCanvasProps {
  phase: "intro" | "row" | "verdict" | "integrate";
  rows: Array<{ who: string; quality: string; unlived: string }>;
  breathEnvelope: number;
}

export default function EnvyCompassCanvas({
  phase,
  rows,
  breathEnvelope,
}: EnvyCompassCanvasProps) {
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
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(5, 15, 15, 0.05)");
      bgGrad.addColorStop(1, "rgba(2, 5, 5, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Compass circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Compass cardinal directions
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      directions.forEach((dir, i) => {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxRadius * 0.95;
        const y = centerY + Math.sin(angle) * maxRadius * 0.95;
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(45, 212, 191, 0.5)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(dir, x, y);
      });

      // Needle for each row (pointing to the "unlived" direction)
      rows.forEach((row, i) => {
        const angle = (i / Math.max(1, rows.length)) * Math.PI * 2 - Math.PI / 2;
        const needleLength = maxRadius * 0.7;
        const needleX = centerX + Math.cos(angle) * needleLength;
        const needleY = centerY + Math.sin(angle) * needleLength;

        // Needle line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.3 + (i / rows.length) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Needle tip
        ctx.beginPath();
        ctx.arc(needleX, needleY, 4, 0, Math.PI * 2);
        const tipGrad = ctx.createRadialGradient(needleX - 2, needleY - 2, 0, needleX, needleY, 4);
        tipGrad.addColorStop(0, "rgba(45, 212, 191, 0.9)");
        tipGrad.addColorStop(1, "rgba(20, 100, 80, 0.6)");
        ctx.fillStyle = tipGrad;
        ctx.fill();
      });

      // Central compass hub
      const hubPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const hubRadius = 12 * (0.8 + hubPulse * 0.2);

      // Hub glow
      const hubGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, hubRadius * 2);
      hubGrad.addColorStop(0, "rgba(45, 212, 191, 0.3)");
      hubGrad.addColorStop(1, "transparent");
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, hubRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Hub core
      ctx.beginPath();
      ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - hubRadius * 0.3, centerY - hubRadius * 0.3, 0, centerX, centerY, hubRadius);
      coreGrad.addColorStop(0, "rgba(45, 212, 191, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.5)");
      coreGrad.addColorStop(1, "rgba(20, 100, 80, 0.2)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Dual-voice indicator bars
      const voiceBarY = centerY - maxRadius - 40;
      const barWidth = 120;
      const barHeight = 6;

      // User voice (left)
      ctx.beginPath();
      ctx.roundRect(centerX - barWidth - 20, voiceBarY, barWidth, barHeight, 3);
      const userGrad = ctx.createLinearGradient(centerX - barWidth - 20, 0, centerX - 20, 0);
      userGrad.addColorStop(0, "rgba(165, 180, 252, 0.6)");
      userGrad.addColorStop(1, "rgba(165, 180, 252, 0.2)");
      ctx.fillStyle = userGrad;
      ctx.fill();

      // Mirror voice (right)
      ctx.beginPath();
      ctx.roundRect(centerX + 20, voiceBarY, barWidth, barHeight, 3);
      const voiceMirrorGrad = ctx.createLinearGradient(centerX + 20, 0, centerX + barWidth + 20, 0);
      voiceMirrorGrad.addColorStop(0, "rgba(251, 113, 133, 0.6)");
      voiceMirrorGrad.addColorStop(1, "rgba(251, 113, 133, 0.2)");
      ctx.fillStyle = voiceMirrorGrad;
      ctx.fill();

      // Voice labels
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOU", centerX - barWidth / 2 - 20, voiceBarY - 15);

      ctx.fillStyle = "rgba(251, 113, 133, 0.8)";
      ctx.fillText("MIRROR", centerX + barWidth / 2 + 20, voiceBarY - 15);

      // Spawn particles during row
      if (phase === "row" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: size / 2 + (Math.random() - 0.5) * 100,
          y: size / 2 + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: `hsl(${260 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`,
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

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Phase text
      const phaseLabels = { intro: "ENVY COMPASS", row: "READING", verdict: "VERDICT", integrate: "INTEGRATE" };
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(45, 212, 191, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phaseLabels[phase], centerX, centerY + maxRadius + 40);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [rows, phase, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}