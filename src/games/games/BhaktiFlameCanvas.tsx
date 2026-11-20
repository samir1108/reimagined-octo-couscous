// BhaktiFlameCanvas — animated flame with warmth visualization and locus mapping
"use client";

import { useEffect, useRef } from "react";

interface BhaktiFlameCanvasProps {
  phase: "intro" | "pick" | "sit" | "locate" | "ask" | "integrate";
  ishta: string | null;
  remain: number;
  locus: string;
  asking: string;
  breathEnvelope: number;
}

export default function BhaktiFlameCanvas({
  phase,
  ishta,
  remain,
  locus,
  asking,
  breathEnvelope,
}: BhaktiFlameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const flamePulseRef = useRef(0);

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

      // Flame visualization
      const flamePulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2.5);
      flamePulseRef.current = flamePulse;

      // Spawn flame particles
      if (phase === "sit" || phase === "locate" || phase === "ask") {
        if (Math.random() < 0.15) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
          const speed = 30 + Math.random() * 60;
          particlesRef.current.push({
            x: centerX,
            y: centerY + 40,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            color: `hsl(${20 + Math.random() * 30}, 80%, ${50 + Math.random() * 20}%)`,
            life: 0,
            maxLife: 1.5 + Math.random() * 1.5,
          });
        }
      }

      // Update and draw flame particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 30 * dt; // gravity upward (flame rises)

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace("hsl", "hsla").replace("%)", `%, ${alpha})`);
        ctx.fill();

        return true;
      });

      // Flame base glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY + 20, 0, centerX, centerY + 20, 120);
      glowGrad.addColorStop(0, `rgba(251, 191, 36, ${0.2 + flamePulse * 0.15})`);
      glowGrad.addColorStop(0.5, `rgba(240, 140, 60, ${0.1 + flamePulse * 0.1})`);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 20, 120, 0, Math.PI * 2);
      ctx.fill();

      // Flame shape
      const flameHeight = 120 + flamePulse * 30;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 80);
      ctx.quadraticCurveTo(centerX - 30, centerY + 20, centerX, centerY + 20 - flameHeight);
      ctx.quadraticCurveTo(centerX + 30, centerY + 20, centerX, centerY + 80);
      
      const flameGrad = ctx.createLinearGradient(centerX, centerY + 80, centerX, centerY + 20 - flameHeight);
      flameGrad.addColorStop(0, "rgba(251, 191, 36, 0.5)");
      flameGrad.addColorStop(0.3, "rgba(240, 140, 60, 0.7)");
      flameGrad.addColorStop(0.7, "rgba(255, 100, 40, 0.8)");
      flameGrad.addColorStop(1, "rgba(255, 200, 100, 0.4)");
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Ishta indicator
      if (ishta) {
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = ishta === "form" ? "FORM" : ishta === "guru" ? "GURU" : ishta === "beloved" ? "BELOVED" : ishta === "nature" ? "NATURE" : "NAMELESS";
        ctx.fillText(label, centerX, size * 0.08);
      }

      // Locus display
      if (locus && (phase === "locate" || phase === "ask" || phase === "integrate")) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = locus.split(" ");
        let line = "";
        let y = centerY - 60;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 280 && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);

        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("LOCI", centerX, centerY - 40);
      }

      // Asking display
      if (asking && (phase === "ask" || phase === "integrate")) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = asking.split(" ");
        let line = "";
        let y = centerY + 80;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 320 && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);

        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("LOVE IS ASKING", centerX, centerY + 55);
      }

      // Timer display during sit phase
      if (phase === "sit") {
        ctx.font = "bold 48px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(remain), centerX, centerY);
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${breathEnvelope * 0.3})`;
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
  }, [phase, ishta, remain, locus, asking, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}