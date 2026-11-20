// LoopMirrorCanvas — animated mirror with recursive reflections
"use client";

import { useEffect, useRef } from "react";

interface LoopMirrorCanvasProps {
  phase: "settle" | "speak" | "process" | "hear" | "integrate";
  live: string;
  rewrite: string;
  breathEnvelope: number;
}

export default function LoopMirrorCanvas({
  phase,
  live,
  rewrite,
  breathEnvelope,
}: LoopMirrorCanvasProps) {
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
      const maxRadius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(15, 10, 25, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 2, 8, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Mirror depth animation
      if (phase === "process" || phase === "hear") {
        mirrorDepthRef.current = Math.min(1, mirrorDepthRef.current + dt * 0.3);
      } else {
        mirrorDepthRef.current = Math.max(0, mirrorDepthRef.current - dt * 0.2);
      }

      // Draw recursive mirror frames
      const frameCount = 5 + Math.floor(mirrorDepthRef.current * 8);
      for (let i = frameCount; i >= 1; i--) {
        const scale = 1 - i * 0.12;
        const alpha = 0.08 * (1 - i * 0.15) * mirrorDepthRef.current;
        const frameRadius = maxRadius * scale;

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

      // Spawn particles when speaking or processing
      if ((phase === "speak" || phase === "process") && Math.random() < 0.15) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
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

      // Central mirror orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * (0.3 + orbPulse * 0.1 + breathEnvelope * 0.2);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 1.8);
      orbGrad.addColorStop(0, `rgba(165, 180, 252, ${0.3 + mirrorDepthRef.current * 0.2})`);
      orbGrad.addColorStop(0.5, `rgba(120, 140, 220, ${0.1 + mirrorDepthRef.current * 0.1})`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(196, 181, 253, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(165, 180, 252, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 200, 0.2)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Mirror surface reflection line
      ctx.beginPath();
      ctx.moveTo(centerX - orbRadius * 0.8, centerY + orbRadius * 0.1);
      ctx.lineTo(centerX + orbRadius * 0.8, centerY + orbRadius * 0.1);
      ctx.strokeStyle = `rgba(165, 180, 252, ${0.5 + orbPulse * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Phase text
      const phaseLabels = { settle: "LOOP MIRROR", speak: "SPEAK", process: "MIRRORING", hear: "HEAR IT BACK", integrate: "REST" };
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(196, 181, 253, 0.8)";
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
  }, [phase, live, rewrite, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}