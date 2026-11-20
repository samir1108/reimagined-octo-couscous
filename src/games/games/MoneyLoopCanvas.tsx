// MoneyLoopCanvas — animated money loop visualization with belief transformation
"use client";

import { useEffect, useRef } from "react";

interface MoneyLoopCanvasProps {
  phase: "intro" | "belief" | "from" | "act" | "swap" | "integrate";
  belief: string;
  from: string;
  act: string;
  swap: string;
  breathEnvelope: number;
}

export default function MoneyLoopCanvas({
  phase,
  belief,
  from,
  act,
  swap,
  breathEnvelope,
}: MoneyLoopCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const beliefProgressRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(10, 20, 10, 0.05)");
      bgGrad.addColorStop(1, "rgba(3, 8, 3, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Belief progression indicator
      const phaseOrder = ["intro", "belief", "from", "act", "swap", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 5;

      // Central money loop orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.5);
      const orbRadius = maxRadius * 0.25 * (0.7 + orbPulse * 0.3);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(110, 231, 183, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(180, 255, 200, 0.1)`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(110, 231, 183, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(180, 255, 200, 0.5)");
      coreGrad.addColorStop(1, "rgba(100, 120, 130, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Money loop - circular flow
      if (phase !== "intro") {
        // Outer loop
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.85, 0, Math.PI * 2);
        const loopGrad = ctx.createLinearGradient(centerX - maxRadius * 0.85, centerY, centerX + maxRadius * 0.85, centerY);
        loopGrad.addColorStop(0, "rgba(110, 231, 183, 0.2)");
        loopGrad.addColorStop(0.5, "rgba(251, 191, 36, 0.1)");
        loopGrad.addColorStop(1, "rgba(110, 231, 183, 0.2)");
        ctx.strokeStyle = loopGrad;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.lineDashOffset = -timeRef.current * 30;
        ctx.stroke();
        ctx.setLineDash([]);

        // Progress along the loop
        const loopProgress = beliefProgressRef.current;
        const loopAngle = -Math.PI / 2 + loopProgress * Math.PI * 2;
        const loopX = centerX + Math.cos(loopAngle) * maxRadius * 0.85;
        const loopY = centerY + Math.sin(loopAngle) * maxRadius * 0.85;

        // Progress indicator on loop
        ctx.beginPath();
        ctx.arc(loopX, loopY, 8, 0, Math.PI * 2);
        const indicatorGrad = ctx.createRadialGradient(loopX - 3, loopY - 3, 0, loopX, loopY, 8);
        indicatorGrad.addColorStop(0, "rgba(110, 231, 183, 0.9)");
        indicatorGrad.addColorStop(0.5, "rgba(45, 212, 191, 0.7)");
        indicatorGrad.addColorStop(1, "rgba(20, 100, 80, 0.5)");
        ctx.fillStyle = indicatorGrad;
        ctx.fill();

        // Update belief progress
        if (phase === "belief" || phase === "from" || phase === "act" || phase === "swap") {
          beliefProgressRef.current = Math.min(1, beliefProgressRef.current + dt * 0.25);
        }
      }

      // Spawn particles
      if ((phase === "belief" || phase === "from" || phase === "act" || phase === "swap") && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "110, 231, 183",
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

      // Belief text
      if (belief) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = belief.split(" ");
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

      // From text
      if (from && (phase === "from" || phase === "act" || phase === "swap" || phase === "integrate")) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = from.split(" ");
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

      // Act text
      if (act && (phase === "act" || phase === "swap" || phase === "integrate")) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = act.split(" ");
        let line = "";
        let y = centerY + 80;
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

      // Swap text
      if (swap && (phase === "swap" || phase === "integrate")) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = swap.split(" ");
        let line = "";
        let y = centerY + maxRadius + 30;
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

      // Spawn particles
      if ((phase === "belief" || phase === "from" || phase === "act" || phase === "swap") && Math.random() < 0.05) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "110, 231, 183",
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

      // Progress ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.75, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Phase indicator
      const phaseLabels = { intro: "MONEY LOOP", belief: "BELIEF", from: "ORIGIN", act: "ACT", swap: "REWRITE", integrate: "INTEGRATE" };
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phaseLabels[phase], centerX, size * 0.9);

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(110, 231, 183, ${breathEnvelope * 0.3})`;
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
  }, [phase, belief, from, act, swap, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const BELIEFS = [
  "there's never enough",
  "if i have it, i'll lose it",
  "money is dirty · money is safety",
  "i shouldn't want it",
  "i must earn every rupee twice",
  "someone else decides my worth",
];

const phaseLabels = { intro: "MONEY LOOP", belief: "BELIEF", from: "ORIGIN", act: "ACT", swap: "REWRITE", integrate: "INTEGRATE" };