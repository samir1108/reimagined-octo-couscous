// IstaDevataChooseCanvas — animated form visualization with body vote visualization
"use client";

import { useEffect, useRef } from "react";

interface IstaDevataChooseCanvasProps {
  phase: "intro" | "three" | "sit" | "choose" | "ask" | "integrate";
  candidates: string[];
  sitIdx: number;
  sitLeft: number;
  chosen: string;
  ask: string;
  breathEnvelope: number;
}

export default function IstaDevataChooseCanvas({
  phase,
  candidates,
  sitIdx,
  sitLeft,
  chosen,
  ask,
  breathEnvelope,
}: IstaDevataChooseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const candidatesRef = useRef(candidates);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);

  candidatesRef.current = candidates;

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

      // Current form visualization
      const currentForm = candidatesRef.current[sitIdx] || "";
      const isCurrent = phase === "sit" || phase === "choose";

      // Central form orb
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.3 * (0.8 + orbPulse * 0.2);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(251, 191, 36, ${0.3})`);
      orbGrad.addColorStop(0.5, `rgba(251, 140, 60, ${0.15})`);
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(255, 220, 150, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.6)");
      coreGrad.addColorStop(1, "rgba(120, 50, 20, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Current form label
      if (currentForm) {
        ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(currentForm, centerX, centerY - maxRadius * 0.6);
      }

      // Progress ring (3 forms × 30s = 90s total)
      const totalSitTime = 90;
      const elapsedInSit = (2 - sitIdx) * 30 + (30 - sitLeft);
      const sitProgress = Math.min(1, elapsedInSit / 90);

      if (phase === "sit" || phase === "choose") {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 0.8, -Math.PI / 2, -Math.PI / 2 + sitProgress * Math.PI * 2);
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Form selection indicators
      if (phase === "three" || phase === "sit" || phase === "choose") {
        const formNames = candidatesRef.current.filter(Boolean);
        formNames.forEach((form, i) => {
          const angle = (i / Math.max(1, formNames.length)) * Math.PI * 2 - Math.PI / 2;
          const radius = maxRadius * 0.6;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const isActive = i === sitIdx && phase === "sit";
          const isChosen = i === formNames.indexOf(chosen);

          // Circle
          ctx.beginPath();
          ctx.arc(x, y, isActive ? 12 : 10, 0, Math.PI * 2);
          if (isChosen) {
            ctx.fillStyle = "rgba(110, 231, 183, 0.6)";
            ctx.fill();
          } else if (isActive) {
            const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 2);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, isActive ? 15 : 12);
            grad.addColorStop(0, `rgba(251, 191, 36, ${0.5 + pulse * 0.2})`);
            grad.addColorStop(1, "rgba(251, 191, 36, 0.2)");
            ctx.fillStyle = grad;
            ctx.fill();
          } else {
            ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Label
          ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
          ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(formNames[i].substring(0, 12), x, y + 25);
        });
      }

      // Spawn particles when sitting
      if (phase === "sit" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 15 + Math.random() * 30;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "251, 191, 36",
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

      // Timer display during sit phase
      if (phase === "sit") {
        const mins = Math.floor(sitLeft / 60);
        const secs = sitLeft % 60;
        ctx.font = "bold 28px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${String(Math.floor(sitLeft / 60)).padStart(2, "0")}:${String(sitLeft % 60).padStart(2, "0")}`, centerX, centerY);
      }

      // Chosen form display
      if (chosen && (phase === "choose" || phase === "ask" || phase === "integrate")) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(chosen, centerX, centerY);
      }

      // Ask display
      if (ask && (phase === "ask" || phase === "integrate")) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = ask.split(" ");
        let line = "";
        let y = centerY + 80;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 280 && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 20;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Breath envelope ring
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * 1.1 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${breathEnvelope * 0.3})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.lineDashOffset = -timeRef.current * 15;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Progress indicator
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${3 - sitIdx} forms left`, centerX, size * 0.9);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, candidates, sitIdx, chosen, ask, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}