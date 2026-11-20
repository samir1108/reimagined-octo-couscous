// GunaSnapshotCanvas — animated triadic guna visualization
"use client";

import { useEffect, useRef } from "react";

interface GunaSnapshotCanvasProps {
  phase: "intro" | "rate" | "shift" | "verdict" | "integrate";
  reading: Record<"body" | "mind" | "relationships", { tamas: number; rajas: number; sattva: number }>;
  domainIdx: number;
  norm: { tamas: number; rajas: number; sattva: number };
  shift: string;
  breathEnvelope: number;
}

export default function GunaSnapshotCanvas({
  phase,
  reading,
  domainIdx,
  norm,
  shift,
  breathEnvelope,
}: GunaSnapshotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    guna: "tamas" | "rajas" | "sattva";
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

    const gunaColors = {
      tamas: "120, 130, 150",
      rajas: "255, 160, 60",
      sattva: "110, 231, 183",
    };

    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      timeRef.current += dt;

      const size = canvas.width / (window.devicePixelRatio || 1);
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size * 0.35;

      ctx.clearRect(0, 0, size, size);

      // Background
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
      bgGrad.addColorStop(0, "rgba(10, 12, 15, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 5, 8, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Triadic guna circles (three overlapping circles)
      const circleRadius = radius * 0.6;
      const circleOffset = radius * 0.4;
      const centers = [
        { x: centerX, y: centerY - circleOffset, color: gunaColors.sattva, guna: "sattva", weight: norm.sattva }, // top
        { x: centerX - circleOffset * 0.866, y: centerY + circleOffset * 0.5, color: gunaColors.rajas, guna: "rajas", weight: norm.rajas }, // bottom-left
        { x: centerX + circleOffset * 0.866, y: centerY + circleOffset * 0.5, color: gunaColors.tamas, guna: "tamas", weight: norm.tamas }, // bottom-right
      ];

      // Draw overlapping circles
      centers.forEach((c, i) => {
        const r = circleRadius * (0.5 + c.weight / 200);
        
        // Glow
        const glowGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 1.5);
        glowGrad.addColorStop(0, `rgba(${c.color}, ${0.1 + c.weight / 1000})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Main circle
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        const circleGrad = ctx.createRadialGradient(c.x - r * 0.3, c.y - r * 0.3, 0, c.x, c.y, r);
        circleGrad.addColorStop(0, `rgba(${c.color}, 0.6)`);
        circleGrad.addColorStop(0.5, `rgba(${c.color}, 0.3)`);
        circleGrad.addColorStop(1, `rgba(${c.color}, 0.1)`);
        ctx.fillStyle = circleGrad;
        ctx.fill();

        // Weight label
        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${c.color}, 0.9)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${c.weight}%`, c.x, c.y);

        // Label
        ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${c.color}, 0.6)`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = i === 0 ? "SATTVA" : i === 1 ? "RAJAS" : "TAMAS";
        ctx.fillText(label, c.x, c.y + r + 20);
      });

      // Center overlap region highlight
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
      const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30);
      centerGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      centerGrad.addColorStop(1, "transparent");
      ctx.fillStyle = centerGrad;
      ctx.fill();

      // Spawn particles based on dominant guna
      if (phase === "rate" && Math.random() < 0.1) {
        const weights = [
          { guna: "sattva", weight: norm.sattva, color: gunaColors.sattva },
          { guna: "rajas", weight: norm.rajas, color: gunaColors.rajas },
          { guna: "tamas", weight: norm.tamas, color: gunaColors.tamas },
        ];
        const total = weights.reduce((a, b) => a + b.weight, 0);
        let rand = Math.random() * total;
        let chosen = weights[0];
        for (const w of weights) {
          rand -= w.weight;
          if (rand <= 0) { chosen = w; break; }
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: chosen.color,
          life: 0,
          maxLife: 3 + Math.random() * 2,
          guna: chosen.guna,
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
        ctx.arc(centerX, centerY, radius * 1.2 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Domain indicator
      const domainLabels = ["BODY", "MIND", "RELATIONSHIPS"];
      ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(domainLabels[domainIdx], centerX, size * 0.9);

      // Shift text preview
      if (shift && phase !== "intro" && phase !== "rate") {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Wrap text
        const maxWidth = size * 0.7;
        const words = shift.split(" ");
        let line = "";
        let y = size * 0.95;
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
  }, [phase, reading, domainIdx, norm, shift, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}