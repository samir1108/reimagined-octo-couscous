// ShraddhaVesselCanvas — animated vessel with leak/expand visualization
"use client";

import { useEffect, useRef } from "react";

interface ShraddhaVesselCanvasProps {
  phase: "intro" | "receiving" | "vessel" | "leak" | "widen" | "integrate";
  receiving: string;
  vessel: number;
  leak: string;
  widen: string;
  breathEnvelope: number;
}

export default function ShraddhaVesselCanvas({
  phase,
  receiving,
  vessel,
  leak,
  widen,
  breathEnvelope,
}: ShraddhaVesselCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    type: "rain" | "leak" | "widen";
  }>>([]);
  const vesselFillRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(20, 15, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 3, 2, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Vessel animation
      const targetFill = vessel / 10;
      vesselFillRef.current += (targetFill - vesselFillRef.current) * 0.05;

      // Vessel shape (cup)
      const vesselX = centerX;
      const vesselY = centerY + 30;
      const vesselWidth = maxRadius * 0.6;
      const vesselHeight = maxRadius * 1.2;

      // Vessel background
      ctx.beginPath();
      ctx.moveTo(vesselX - vesselWidth / 2, vesselY);
      ctx.lineTo(vesselX - vesselWidth / 2, vesselY + vesselHeight);
      ctx.quadraticCurveTo(vesselX, vesselY + vesselHeight + 20, vesselX + vesselWidth / 2, vesselY + vesselHeight);
      ctx.lineTo(vesselX + vesselWidth / 2, vesselY);
      ctx.closePath();

      const vesselGrad = ctx.createLinearGradient(vesselX - vesselWidth / 2, 0, vesselX + vesselWidth / 2, 0);
      vesselGrad.addColorStop(0, "rgba(120, 80, 30, 0.3)");
      vesselGrad.addColorStop(0.5, "rgba(180, 140, 60, 0.2)");
      vesselGrad.addColorStop(1, "rgba(120, 80, 30, 0.3)");
      ctx.fillStyle = vesselGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Liquid fill
      const fillHeight = vesselHeight * vesselFillRef.current;
      if (vesselFillRef.current > 0) {
        ctx.beginPath();
        ctx.moveTo(vesselX - vesselWidth / 2 + 4, vesselY + vesselHeight - fillHeight);
        ctx.lineTo(vesselX - vesselWidth / 2 + 4, vesselY + vesselHeight);
        ctx.lineTo(vesselX + vesselWidth / 2 - 4, vesselY + vesselHeight);
        ctx.lineTo(vesselX + vesselWidth / 2 - 4, vesselY + vesselHeight - fillHeight);
        ctx.closePath();

        const liquidGrad = ctx.createLinearGradient(vesselX, vesselY + vesselHeight - fillHeight, vesselX, vesselY + vesselHeight);
        liquidGrad.addColorStop(0, "rgba(125, 211, 252, 0.6)");
        liquidGrad.addColorStop(1, "rgba(165, 180, 252, 0.8)");
        ctx.fillStyle = liquidGrad;
        ctx.fill();
      }

      // Leak visualization
      if (phase === "leak" || phase === "widen" || phase === "integrate") {
        if (leak && Math.random() < 0.15) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
          const speed = 30 + Math.random() * 50;
          particlesRef.current.push({
            x: centerX,
            y: centerY + 30,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 2,
            color: "251, 113, 133",
            life: 0,
            maxLife: 2 + Math.random() * 1.5,
            type: "leak",
          });
        }
      }

      // Widen particles
      if (phase === "widen" || phase === "integrate") {
        if (widen && Math.random() < 0.1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 20 + Math.random() * 40;
          particlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 20,
            size: 2 + Math.random() * 3,
            color: "110, 231, 183",
            life: 0,
            maxLife: 3 + Math.random() * 2,
            type: "widen",
          });
        }
      }

      // Rain particles when receiving
      if (phase === "receiving" || phase === "vessel") {
        if (Math.random() < 0.15) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
          const speed = 50 + Math.random() * 100;
          particlesRef.current.push({
            x: centerX + (Math.random() - 0.5) * 80,
            y: centerY - maxRadius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 2,
            color: "125, 211, 252",
            life: 0,
            maxLife: 2 + Math.random() * 1.5,
            type: "rain",
          });
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += p.type === "rain" ? 200 * dt : p.type === "leak" ? 100 * dt : -50 * dt;

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // Receiving text
      if (receiving) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(125, 211, 252, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = receiving.split(" ");
        let line = "";
        let y = centerY - maxRadius - 40;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 16;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Leak text
      if (leak) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.2;
        const words = leak.split(" ");
        let line = "";
        let y = centerY + maxRadius + 40;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxRadius && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 16;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Widen text
      if (widen) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = widen.split(" ");
        let line = "";
        let y = centerY + maxRadius + 50;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxRadius * 1.2 && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Vessel size indicator
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${vessel}/10`, centerX, centerY - maxRadius - 20);

      // Progress indicator
      const phaseOrder = ["intro", "receiving", "vessel", "leak", "widen", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 5;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.85, 60, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Breath envelope
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
  }, [phase, receiving, vessel, leak, widen, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}