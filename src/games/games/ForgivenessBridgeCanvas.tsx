// ForgivenessBridgeCanvas — animated bridge visualization with three pass visualization
"use client";

import { useEffect, useRef } from "react";

interface ForgivenessBridgeCanvasProps {
  phase: "intro" | "who" | "write" | "rate" | "verdict" | "integrate";
  who: string;
  before: number;
  after: number;
  currentPass: number;
  drafts: Record<string, string>;
  breathEnvelope: number;
}

export default function ForgivenessBridgeCanvas({
  phase,
  who,
  before,
  after,
  currentPass,
  drafts,
  breathEnvelope,
}: ForgivenessBridgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    pass: "anger" | "their_carry" | "release";
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

    const passColors = {
      anger: "251, 113, 133",
      their_carry: "251, 191, 36",
      release: "110, 231, 183",
    };

    const passOrder = ["anger", "their_carry", "release"] as const;

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
      bgGrad.addColorStop(0, "rgba(15, 15, 30, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 10, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Bridge visualization - three arches
      const bridgeY = size * 0.55;
      const archWidth = size * 0.35;
      const archHeight = size * 0.25;
      const gap = size * 0.15;

      // Draw three arches (passes)
      passOrder.forEach((pass, i) => {
        const x = centerX + (i - 1) * (archWidth + gap);
        const color = passColors[pass];
        const isCompleted = drafts[pass] && drafts[pass].length > 0;
        const isCurrent = i === 0 ? false : i === 0 ? false : true; // simplified

        // Arch path
        const archTopY = bridgeY - archHeight * 0.8;
        ctx.beginPath();
        ctx.moveTo(x - archWidth / 2, bridgeY);
        ctx.quadraticCurveTo(x, bridgeY - archHeight, x + archWidth / 2, bridgeY);
        
        const grad = ctx.createLinearGradient(x - archWidth / 2, bridgeY, x + archWidth / 2, bridgeY - archHeight);
        const c = passColors[pass];
        if (drafts[pass] && drafts[pass].length > 0) {
          grad.addColorStop(0, `rgba(${c}, 0.3)`);
          grad.addColorStop(0.5, `rgba(${c}, 0.6)`);
          grad.addColorStop(1, `rgba(${c}, 0.3)`);
        } else {
          grad.addColorStop(0, `rgba(${c}, 0.1)`);
          grad.addColorStop(0.5, `rgba(${c}, 0.2)`);
          grad.addColorStop(1, `rgba(${c}, 0.1)`);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Completed glow
        if (drafts[pass] && drafts[pass].length > 0) {
          ctx.beginPath();
          ctx.moveTo(x - archWidth / 2, bridgeY);
          ctx.quadraticCurveTo(x, bridgeY - archHeight, x + archWidth / 2, bridgeY);
          ctx.strokeStyle = `rgba(${passColors[pass]}, 0.4)`;
          ctx.lineWidth = 8;
          ctx.setLineDash([10, 5]);
          ctx.lineDashOffset = -timeRef.current * 20;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Pass label
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(${passColors[pass]}, ${drafts[pass] && drafts[pass].length > 0 ? 0.8 : 0.4})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const label = pass === "anger" ? "ANGER" : pass === "their_carry" ? "THEIR CARRY" : "RELEASE";
        ctx.fillText(label, centerX + (i - 1) * (archWidth + gap), bridgeY + 25);
      });

      // Bridge base line
      ctx.beginPath();
      ctx.moveTo(centerX - archWidth * 1.5 - gap, bridgeY);
      ctx.lineTo(centerX + archWidth * 1.5 + gap, bridgeY);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spawn particles when writing
      if (phase === "write" && Math.random() < 0.1) {
        const currentPass = "anger" as const; // simplified
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 200,
          y: bridgeY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          size: 3 + Math.random() * 3,
          color: "251, 113, 133",
          life: 0,
          maxLife: 3 + Math.random() * 2,
          pass: "anger",
        });
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life += dt;
        if (p.life >= p.maxLife) return false;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 10 * dt; // gravity

        const progress = p.life / p.maxLife;
        const alpha = (1 - progress) * 0.7;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        return true;
      });

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Grip indicators
      // Before grip (left)
      ctx.beginPath();
      ctx.arc(centerX - 120, centerY - 80, 30, 0, Math.PI * 2);
      const beforeGrad = ctx.createRadialGradient(centerX - 120, centerY - 80, 0, centerX - 120, centerY - 80, 30);
      beforeGrad.addColorStop(0, `rgba(251, 113, 133, ${before / 10 * 0.4})`);
      beforeGrad.addColorStop(1, "rgba(251, 113, 133, 0.1)");
      ctx.fillStyle = beforeGrad;
      ctx.fill();

      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${before}/10`, centerX - 120, centerY - 80);

      ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GRIP BEFORE", centerX - 120, centerY - 50);

      // After grip (right)
      if (phase === "verdict" || phase === "integrate") {
        ctx.beginPath();
        ctx.arc(centerX + 120, centerY - 80, 30, 0, Math.PI * 2);
        const afterGrad = ctx.createRadialGradient(centerX + 120, centerY - 80, 0, centerX + 120, centerY - 80, 30);
        afterGrad.addColorStop(0, `rgba(110, 231, 183, ${after / 10 * 0.4})`);
        afterGrad.addColorStop(1, "rgba(110, 231, 183, 0.1)");
        ctx.fillStyle = afterGrad;
        ctx.fill();

        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${after}/10`, centerX + 120, centerY - 80);

        ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GRIP AFTER", centerX + 120, centerY - 50);
      }

      // Who name
      if (who) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`for ${who}`, centerX, size * 0.15);
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(125, 211, 252, ${breathEnvelope * 0.3})`;
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
  }, [phase, who, before, after, drafts, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}