// MirrorDuelCanvas — animated mirror with reflective surfaces and dual-voice visualization
"use client";

import { useEffect, useRef } from "react";

interface MirrorDuelCanvasProps {
  phase: "intro" | "duel" | "verdict" | "integrate";
  rounds: Array<{ round: number; you: string; mirror: string; latencyMs: number }>;
  currentPrompt: string;
  lastMirror: string;
  breathEnvelope: number;
}

export default function MirrorDuelCanvas({
  phase,
  rounds,
  currentPrompt,
  lastMirror,
  breathEnvelope,
}: MirrorDuelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const mirrorDepthRef = useRef(0);

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
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 3, 8, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Mirror depth animation
      if (phase === "duel") {
        mirrorDepthRef.current = Math.min(1, mirrorDepthRef.current + dt * 0.3);
      } else if (phase === "verdict" || phase === "integrate") {
        mirrorDepthRef.current = Math.max(0, mirrorDepthRef.current - dt * 0.1);
      }

      // Draw recursive mirror frames
      const frameCount = 3 + Math.floor(mirrorDepthRef.current * 6);
      for (let i = frameCount; i >= 1; i--) {
        const scale = 1 - i * 0.12;
        const alpha = 0.06 * (1 - i * 0.15) * mirrorDepthRef.current;
        const frameRadius = size * 0.35 * scale;

        ctx.beginPath();
        ctx.arc(centerX, centerY, frameRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner glow
        if (i === 1) {
          const glowGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, frameRadius);
          glowGrad.addColorStop(0, `rgba(165, 180, 252, ${0.15 * mirrorDepthRef.current})`);
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, frameRadius * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spawn particles when new round starts
      if (phase === "duel" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
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
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Central mirror surface
      const mirrorPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.5);
      const mirrorRadius = size * 0.3 * (0.8 + mirrorPulse * 0.2);

      // Mirror surface reflection
      ctx.beginPath();
      ctx.arc(centerX, centerY, mirrorRadius, 0, Math.PI * 2);
      const mirrorGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, mirrorRadius);
      mirrorGrad.addColorStop(0, `rgba(165, 180, 252, ${0.3 + mirrorDepthRef.current * 0.2})`);
      mirrorGrad.addColorStop(0.5, `rgba(120, 140, 220, ${0.2 + mirrorDepthRef.current * 0.1})`);
      mirrorGrad.addColorStop(1, "rgba(80, 100, 180, 0.4)");
      ctx.fillStyle = mirrorGrad;
      ctx.fill();

      // Mirror frame
      ctx.beginPath();
      ctx.arc(centerX, centerY, mirrorRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(165, 180, 252, ${0.5 + mirrorDepthRef.current * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Reflection line across the mirror
      const reflectY = centerY + mirrorRadius * 0.1;
      ctx.beginPath();
      ctx.moveTo(centerX - mirrorRadius * 0.8, reflectY);
      ctx.lineTo(centerX + mirrorRadius * 0.8, reflectY);
      ctx.strokeStyle = `rgba(165, 180, 252, ${0.4 + Math.sin(timeRef.current * 3) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dual-voice indicator bars
      const voiceBarY = centerY - mirrorRadius - 40;
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

      // Spawn particles during duel
      if (phase === "duel" && Math.random() < 0.1) {
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
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Phase text
      const phaseLabels = { intro: "MIRROR DUEL", duel: "ROUND", verdict: "VERDICT", integrate: "REST" };
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phaseLabels[phase], size / 2, size * 0.9);

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