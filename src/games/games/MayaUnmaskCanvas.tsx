// MayaUnmaskCanvas — animated veil visualization with gap measurement
"use client";

import { useEffect, useRef } from "react";

interface MayaUnmaskCanvasProps {
  phase: "intro" | "appearance" | "believed" | "actual" | "gap" | "verdict" | "integrate";
  appearance: string;
  believed: string;
  actual: string;
  gap: number;
  breathEnvelope: number;
}

export default function MayaUnmaskCanvas({
  phase,
  appearance,
  believed,
  actual,
  gap,
  breathEnvelope,
}: MayaUnmaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const veilOpacityRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(15, 10, 25, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Veil opacity based on phase
      const targetOpacity = phase === "appearance" || phase === "believed" ? 0.6 : 0;
      veilOpacityRef.current += (targetOpacity - veilOpacityRef.current) * 0.03;

      // Veil layer
      if (veilOpacityRef.current > 0.05) {
        const veilGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.2);
        veilGrad.addColorStop(0, `rgba(120, 80, 180, ${veilOpacityRef.current * 0.15})`);
        veilGrad.addColorStop(0.5, `rgba(180, 120, 220, ${veilOpacityRef.current * 0.08})`);
        veilGrad.addColorStop(1, "transparent");
        ctx.fillStyle = veilGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spawn particles when typing
      if ((phase === "appearance" || phase === "believed" || phase === "actual") && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "165, 180, 252",
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

      // Central orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.2 * (0.8 + orbPulse * 0.3);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(165, 180, 252, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(180, 200, 255, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(165, 180, 252, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 200, 255, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 150, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Two circles: appearance (left) and actual (right)
      const leftX = centerX - 80;
      const rightX = centerX + 80;
      const circleRadius = 60;

      // Appearance circle (left) - always visible when filled
      if (appearance.trim().length > 0) {
        ctx.beginPath();
        ctx.arc(centerX - 80, centerY, circleRadius * 0.6, 0, Math.PI * 2);
        const appGrad = ctx.createRadialGradient(centerX - 80, centerY, 0, centerX - 80, centerY, circleRadius * 0.6);
        appGrad.addColorStop(0, "rgba(165, 180, 252, 0.6)");
        appGrad.addColorStop(0.5, "rgba(120, 140, 220, 0.4)");
        appGrad.addColorStop(1, "rgba(80, 100, 180, 0.2)");
        ctx.fillStyle = appGrad;
        ctx.fill();
      }

      // Actual circle (right) - appears when filled
      if (actual.trim().length > 0) {
        ctx.beginPath();
        ctx.arc(centerX + 80, centerY, circleRadius * 0.6, 0, Math.PI * 2);
        const actGrad = ctx.createRadialGradient(centerX + 80, centerY, 0, centerX + 80, centerY, circleRadius * 0.6);
        actGrad.addColorStop(0, "rgba(110, 231, 183, 0.6)");
        actGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.4)");
        actGrad.addColorStop(1, "rgba(20, 100, 80, 0.2)");
        ctx.fillStyle = actGrad;
        ctx.fill();
      }

      // Gap visualization - arrow between circles
      if (gap > 0) {
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX + 20, centerY);
        ctx.strokeStyle = `rgba(165, 180, 252, ${gap / 10 * 0.6})`;
        ctx.lineWidth = 3 + gap * 0.5;
        ctx.lineCap = "round";
        ctx.stroke();

        // Gap number
        ctx.font = "bold 18px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(165, 180, 252, ${0.8})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${gap}/10`, centerX, centerY);
      }

      // Labels
      if (appearance) {
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("APPEARANCE", centerX - 80, centerY - 90);
      }

      if (actual) {
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ACTUAL", centerX + 80, centerY - 90);
      }

      // Text content display
      if (appearance) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(165, 180, 252, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = 150;
        const words = appearance.split(" ");
        let line = "";
        let y = centerY - 80 - 60;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 150 && line !== "") {
            ctx.fillText(line, centerX - 80, y);
            line = word + " ";
            y += 16;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX - 80, y);
      }

      if (believed) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(180, 150, 220, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = believed.split(" ");
        let line = "";
        let y = centerY - 80;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 150 && line !== "") {
            ctx.fillText(line, centerX - 80, y);
            line = word + " ";
            y += 16;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX - 80, y);
      }

      if (actual) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = actual.split(" ");
        let line = "";
        let y = centerY - 80;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 150 && line !== "") {
            ctx.fillText(line, centerX + 80, y);
            line = word + " ";
            y += 16;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX + 80, y);
      }

      // Spawn particles
      if ((phase === "appearance" || phase === "believed" || phase === "actual") && Math.random() < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "165, 180, 252",
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

      // Gap indicator
      if (gap > 0) {
        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(165, 180, 252, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${gap}/10`, centerX, centerY + 100);
      }

      // Progress indicator
      const phaseOrder = ["intro", "appearance", "believed", "actual", "gap", "verdict", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 6;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.85, 60, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(165, 180, 252, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Phase labels
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(165, 180, 252, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const labels = { appearance: "APPEARANCE", believed: "BELIEVED", actual: "ACTUAL", gap: "GAP" };
      if (labels[phase]) {
        ctx.fillText(labels[phase], centerX, size * 0.95);
      }

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 180, 252, ${breathEnvelope * 0.3})`;
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
  }, [phase, appearance, believed, actual, gap, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}