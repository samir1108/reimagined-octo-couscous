// GuruDakshinaCanvas — animated offering visualization with seal animation
"use client";

import { useEffect, useRef } from "react";

interface GuruDakshinaCanvasProps {
  phase: "intro" | "received" | "offering" | "when" | "seal" | "integrate";
  received: string;
  offering: string;
  when: "24h" | "week" | "month";
  breathEnvelope: number;
}

export default function GuruDakshinaCanvas({
  phase,
  received,
  offering,
  when,
  breathEnvelope,
}: GuruDakshinaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
  }>>([]);
  const sealProgressRef = useRef(0);

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

      // Seal progress animation
      if (phase === "seal" || phase === "integrate") {
        sealProgressRef.current = Math.min(1, sealProgressRef.current + dt * 0.8);
      } else {
        sealProgressRef.current = Math.max(0, sealProgressRef.current - dt * 0.2);
      }

      // Draw offering text as scroll
      if (offering.trim().length > 0) {
        ctx.font = "italic 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + sealProgressRef.current * 0.3})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = offering.split(" ");
        let line = "";
        let y = centerY - 30;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 22;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

      // Seal visualization
      if (sealProgressRef.current > 0) {
        // Wax seal
        const sealRadius = maxRadius * 0.5 * sealProgressRef.current;
        
        // Seal glow
        const sealGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sealRadius * 1.5);
        sealGrad.addColorStop(0, `rgba(251, 191, 36, ${0.3 * sealProgressRef.current})`);
        sealGrad.addColorStop(1, "transparent");
        ctx.fillStyle = sealGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sealRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Seal ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, sealRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.6 * sealProgressRef.current})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Seal center
        ctx.beginPath();
        ctx.arc(centerX, centerY, sealRadius * 0.4, 0, Math.PI * 2);
        const sealCoreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sealRadius * 0.4);
        sealCoreGrad.addColorStop(0, "rgba(251, 191, 36, 0.9)");
        sealCoreGrad.addColorStop(1, "rgba(200, 120, 30, 0.6)");
        ctx.fillStyle = sealCoreGrad;
        ctx.fill();

        // Seal text
        ctx.font = "bold 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.9 * sealProgressRef.current})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("SEALED", centerX, centerY);
      }

      // Spawn particles when phase changes
      if (phase === "seal" && Math.random() < 0.1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 60;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 4,
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

      // Received text display
      if (received.trim().length > 0) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = received.split(" ");
        let line = "";
        let y = centerY - maxRadius - 30;
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

      // Offering text
      if (offering && phase !== "intro" && phase !== "received") {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + sealProgressRef.current * 0.3})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = size * 0.7;
        const words = offering.split(" ");
        let line = "";
        let y = centerY - 50;
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

      // When deadline
      if (phase !== "intro" && phase !== "received") {
        const windowLabels = { "24h": "WITHIN 24 HOURS", "week": "THIS WEEK", "month": "THIS MONTH" };
        ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = `rgba(251, 191, 36, ${sealProgressRef.current > 0 ? 0.8 : 0.4})`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(windowLabels[when], centerX, centerY + maxRadius + 30);
      }

      // Spawn particles
      if ((phase === "offering" || phase === "when" || phase === "seal") && Math.random() < 0.08) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 40;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
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

      // Progress indicator
      const phaseOrder = ["intro", "received", "offering", "when", "seal", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 5;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.85, 60, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Phase label
      const phaseLabels = { intro: "DAKṢIṆĀ", received: "RECEIVED", offering: "OFFERING", when: "DEADLINE", seal: "SEALED", integrate: "REST" };
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(phaseLabels[phase], centerX, size * 0.9);

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
  }, [phase, received, offering, when, breathEnvelope]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}

const WINDOWS = [
  { key: "24h",   label: "within 24 hours" },
  { key: "week",  label: "this week" },
  { key: "month", label: "this month" },
] as const;

const windowLabels = { "24h": "WITHIN 24 HOURS", "week": "THIS WEEK", "month": "THIS MONTH" };
const phaseLabels = { intro: "DAKṢIṆĀ", received: "RECEIVED", offering: "OFFERING", when: "DEADLINE", seal: "SEALED", integrate: "REST" };