// AncestorLetterCanvas — animated chain visualization with particle flow
"use client";

import { useEffect, useRef } from "react";

interface AncestorLetterCanvasProps {
  phase: "intro" | "ancestor" | "descendant" | "verdict" | "integrate";
  ancestor: string;
  descendant: string;
  breathEnvelope: number;
}

export default function AncestorLetterCanvas({
  phase,
  ancestor,
  descendant,
  breathEnvelope,
}: AncestorLetterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
    type: "ancestor" | "descendant";
  }>>([]);
  const chainProgressRef = useRef(0);

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

      // Chain progress animation
      if (phase === "ancestor") {
        chainProgressRef.current = Math.min(1, chainProgressRef.current + dt * 0.5);
      } else if (phase === "descendant") {
        chainProgressRef.current = Math.min(1, chainProgressRef.current + dt * 0.5);
      } else if (phase === "verdict" || phase === "integrate") {
        chainProgressRef.current = 1;
      } else {
        chainProgressRef.current = Math.max(0, chainProgressRef.current - dt * 0.2);
      }

      // Draw chain links (vertical)
      const linkCount = 12;
      const linkHeight = size * 0.7 / linkCount;
      const topY = size * 0.15;
      const bottomY = size * 0.85;

      // Chain line
      ctx.beginPath();
      ctx.moveTo(centerX, topY);
      ctx.lineTo(centerX, bottomY);
      const chainGrad = ctx.createLinearGradient(centerX, topY, centerX, bottomY);
      chainGrad.addColorStop(0, `rgba(251, 191, 36, ${0.3 + chainProgressRef.current * 0.4})`);
      chainGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.1 + chainProgressRef.current * 0.3})`);
      chainGrad.addColorStop(1, `rgba(110, 231, 183, ${0.3 + chainProgressRef.current * 0.4})`);
      ctx.strokeStyle = chainGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Links
      for (let i = 0; i < linkCount; i++) {
        const y = topY + i * linkHeight + linkHeight / 2;
        const isFilled = (i / linkCount) < chainProgressRef.current;
        
        ctx.beginPath();
        ctx.arc(centerX, y, 8, 0, Math.PI * 2);
        if (isFilled) {
          const linkGrad = ctx.createRadialGradient(centerX, y, 0, centerX, y, 8);
          linkGrad.addColorStop(0, "rgba(251, 191, 36, 0.8)");
          linkGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.6)");
          linkGrad.addColorStop(1, "rgba(120, 50, 20, 0.4)");
          ctx.fillStyle = linkGrad;
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Spawn particles when writing
      if ((phase === "ancestor" || phase === "descendant") && Math.random() < 0.1) {
        const isAncestor = phase === "ancestor";
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: isAncestor ? "251, 191, 36" : "110, 231, 183",
          life: 0,
          maxLife: 3 + Math.random() * 2,
          type: isAncestor ? "ancestor" : "descendant",
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

      // Ancestor text (top)
      if (ancestor.trim().length > 0) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.5 + chainProgressRef.current * 0.4})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = ancestor.split(" ");
        let line = "";
        let y = size * 0.2;
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

      // Descendant text (bottom)
      if (descendant.trim().length > 0) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(110, 231, 183, ${0.5 + chainProgressRef.current * 0.4})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = descendant.split(" ");
        let line = "";
        let y = size * 0.75;
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

      // Labels
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ANCESTOR", centerX, size * 0.1);

      ctx.fillStyle = "rgba(110, 231, 183, 0.7)";
      ctx.fillText("DESCENDANT", centerX, size * 0.9);

      // Progress indicator
      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${Math.round(chainProgressRef.current * 100)}%`, centerX, centerY);

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
  }, [phase, ancestor, descendant, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}