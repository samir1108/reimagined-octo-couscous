// SannyasaRehearsalCanvas — animated letting-go visualization with particle flow
"use client";

import { useEffect, useRef } from "react";

interface SannyasaRehearsalCanvasProps {
  phase: "intro" | "name" | "for" | "setdown" | "watch" | "integrate";
  carried: string;
  wasFor: string;
  duration: 1 | 3 | 7 | null;
  absenceTeaches: string;
  breathEnvelope: number;
}

export default function SannyasaRehearsalCanvas({
  phase,
  carried,
  wasFor,
  duration,
  absenceTeaches,
  breathEnvelope,
}: SannyasaRehearsalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const releaseProgressRef = useRef(0);

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
      bgGrad.addColorStop(0, "rgba(15, 15, 20, 0.05)");
      bgGrad.addColorStop(1, "rgba(5, 5, 8, 0.08)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Release progress
      const targetRelease = phase === "setdown" ? 0.3 : phase === "watch" ? 0.6 : phase === "integrate" ? 1 : 0;
      releaseProgressRef.current += (targetRelease - releaseProgressRef.current) * 0.02;

      // Central orb (the thing carried)
      const orbPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const orbRadius = maxRadius * 0.25 * (0.8 + releaseProgressRef.current * 0.4);

      // Orb glow
      const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, orbRadius * 2);
      orbGrad.addColorStop(0, `rgba(148, 163, 184, ${0.3 + releaseProgressRef.current * 0.2})`);
      orbGrad.addColorStop(0.5, "rgba(180, 180, 200, 0.1)");
      orbGrad.addColorStop(1, "transparent");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(centerX - orbRadius * 0.3, centerY - orbRadius * 0.3, 0, centerX, centerY, orbRadius);
      coreGrad.addColorStop(0, "rgba(148, 163, 184, 0.9)");
      coreGrad.addColorStop(0.5, "rgba(120, 130, 150, 0.6)");
      coreGrad.addColorStop(1, "rgba(80, 90, 110, 0.3)");
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Release animation - particles drifting away
      if (releaseProgressRef.current > 0.1 && Math.random() < releaseProgressRef.current * 0.15) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 50;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          color: "148, 163, 184",
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

      // Carried text (fades as released)
      if (carried && releaseProgressRef.current < 0.8) {
        const fadeAlpha = 1 - releaseProgressRef.current;
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(148, 163, 184, ${fadeAlpha * 0.7})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = carried.split(" ");
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

      // Purpose text
      if (wasFor) {
        ctx.font = "italic 11px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = wasFor.split(" ");
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

      // Absence hypothesis text
      if (absenceTeaches) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = maxRadius * 1.5;
        const words = absenceTeaches.split(" ");
        let line = "";
        let y = centerY + maxRadius + 40;
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

      // Duration indicator
      if (duration) {
        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${duration} day${duration > 1 ? "s" : ""}`, centerX, centerY + maxRadius + 30);
      }

      // Spawn particles when releasing
      if (phase === "setdown" || phase === "watch" || phase === "integrate") {
        if (Math.random() < releaseProgressRef.current * 0.1) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 20 + Math.random() * 40;
          particlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 3,
            color: "148, 163, 184",
            life: 0,
            maxLife: 3 + Math.random() * 2,
          });
        }
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

      // Progress indicator
      const phaseOrder = ["intro", "name", "for", "setdown", "watch", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 5;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.85, 60, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Breath envelope
      if (breathEnvelope > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4 + breathEnvelope * 50, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${breathEnvelope * 0.3})`;
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
  }, [phase, carried, wasFor, duration, absenceTeaches, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}