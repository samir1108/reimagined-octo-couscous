// RefusalEngineCanvas — animated refusal engine with boundary visualization
"use client";

import { useEffect, useRef } from "react";

interface RefusalEngineCanvasProps {
  phase: "intro" | "refuse" | "rate" | "verdict" | "integrate";
  round: number;
  refusal: string;
  ask: string;
  softenerCount: number;
  breathEnvelope: number;
}

export default function RefusalEngineCanvas({
  phase,
  round,
  refusal,
  ask,
  softenerCount,
  breathEnvelope,
}: RefusalEngineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    type: "softener" | "boundary";
  }>>([]);
  const boundaryStrengthRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(20, 20, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Boundary strength based on refusal quality
      const refusalLength = refusal.length;
      const targetStrength = Math.min(1, (refusalLength / 50) * (1 - Math.min(1, (window as any).SOFTENERS_COUNT || 0) * 0.3));
      boundaryStrengthRef.current += (targetStrength - boundaryStrengthRef.current) * 0.05;

      // Draw boundary rings
      const numRings = 5;
      for (let i = 1; i <= numRings; i++) {
        const ringProgress = i / numRings;
        const isInside = ringProgress <= boundaryStrengthRef.current;
        
        const ringRadius = maxRadius * ringProgress;
        const alpha = isInside ? 0.15 : 0.03;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isInside ? `rgba(110, 231, 183, ${alpha})` : `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = isInside ? 2 : 1;
        ctx.setLineDash(isInside ? [] : [8, 4]);
        ctx.lineDashOffset = -timeRef.current * 10;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Spawn particles when typing refusal
      if (phase === "refuse" && refusal.length > 0 && Math.random() < 0.15) {
        const isSoftener = Math.random() < 0.3;
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: isSoftener ? 4 : 2 + Math.random() * 3,
          color: isSoftener ? "251, 113, 133" : "110, 231, 183",
          life: 0,
          maxLife: 3 + Math.random() * 2,
          type: isSoftener ? "softener" : "boundary",
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

      // Central boundary orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * (0.3 + boundaryStrengthRef.current * 0.3 + orbPulse * 0.1);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 1.8);
      orbGrad.addColorStop(0, `rgba(110, 231, 183, ${0.3 + boundaryStrengthRef.current * 0.2})`);
      orbGrad.addColorStop(0.5, `rgba(148, 163, 184, ${0.1 + boundaryStrengthRef.current * 0.1})`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, `rgba(110, 231, 183, ${0.9 - 0.5 * (1 - boundaryStrengthRef.current)})`);
      coreGrad.addColorStop(0.5, "rgba(148, 163, 184, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 140, 0.2)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Softener indicator
      const softenerCount = (refusal.match(/\b(sorry|maybe|actually|kind of|kinda|just|only|really|i mean|i guess|but|however|if that's okay|if you don't mind|hopefully|hope that's fine|no offense)\b/gi) || []).length;
      if (softenerCount > 0) {
        for (let i = 0; i < Math.min(softenerCount, 5); i++) {
          const angle = (i / 5) * Math.PI * 2 + timeRef.current * 0.5;
          const r = maxRadius * 0.8;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 113, 133, ${0.4 + Math.sin(timeRef.current * 3 + i) * 0.2})`;
          ctx.fill();
        }
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Round indicator
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`ASK ${round + 1} / 7`, centerX, size * 0.9);

      // Refusal text preview
      if (refusal.trim().length > 0) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = refusal.split(" ");
        let line = "";
        let y = size * 0.85;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, round, refusal, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}