// AnasaktiTestCanvas — animated grip/release visualization
"use client";

import { useEffect, useRef } from "react";

interface AnasaktiTestCanvasProps {
  phase: "intro" | "action" | "fruit" | "grip" | "release" | "verdict" | "integrate";
  action: string;
  fruit: string;
  release: string;
  gripBefore: number;
  gripAfter: number;
  breathEnvelope: number;
}

export default function AnasaktiTestCanvas({
  phase,
  action,
  fruit,
  release,
  gripBefore,
  gripAfter,
  breathEnvelope,
}: AnasaktiTestCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; life: number; maxLife: number;
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

      // Action visualization (left side) - the action persists
      const leftX = centerX - 100;
      const rightX = centerX + 100;

      // Action orb (left) - always present
      const actionPulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.2);
      const actionRadius = 50 * (0.6 + actionPulse * 0.2);

      // Action orb glow
      const actionGrad = ctx.createRadialGradient(centerX - 100, centerY, 0, centerX - 100, centerY, actionRadius * 1.5);
      actionGrad.addColorStop(0, "rgba(251, 191, 36, 0.4)");
      actionGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.2)");
      actionGrad.addColorStop(1, "transparent");
      ctx.fillStyle = actionGrad;
      ctx.beginPath();
      ctx.arc(centerX - 100, centerY, actionRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Action core
      ctx.beginPath();
      ctx.arc(centerX - 100, centerY, actionRadius, 0, Math.PI * 2);
      const actionCoreGrad = ctx.createRadialGradient(centerX - 100, centerY, 0, centerX - 100, centerY, actionRadius);
      actionCoreGrad.addColorStop(0, "rgba(251, 191, 36, 0.9)");
      actionCoreGrad.addColorStop(0.5, "rgba(240, 140, 60, 0.6)");
      actionCoreGrad.addColorStop(1, "rgba(120, 50, 20, 0.3)");
      ctx.fillStyle = actionCoreGrad;
      ctx.fill();

      // Fruit orb (right) - shrinks when released
      const fruitPhase = phase === "release" || phase === "verdict" || phase === "integrate" ? 1 : 0;
      const fruitProgress = Math.min(1, (phase === "release" || phase === "verdict" || phase === "integrate") ? 1 : 0);
      const fruitRadius = 40 * (0.5 + (1 - gripAfter / 10) * 0.5) * (1 - fruitProgress * 0.8);

      if (fruitRadius > 5) {
        // Fruit orb glow
        const fruitGrad = ctx.createRadialGradient(centerX + 100, centerY, 0, centerX + 100, centerY, fruitRadius * 1.5);
        fruitGrad.addColorStop(0, "rgba(251, 113, 133, 0.3)");
        fruitGrad.addColorStop(0.5, "rgba(251, 113, 133, 0.15)");
        fruitGrad.addColorStop(1, "transparent");
        ctx.fillStyle = fruitGrad;
        ctx.beginPath();
        ctx.arc(centerX + 100, centerY, fruitRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Fruit core
        ctx.beginPath();
        ctx.arc(centerX + 100, centerY, fruitRadius, 0, Math.PI * 2);
        const fruitCoreGrad = ctx.createRadialGradient(centerX + 100 - fruitRadius * 0.3, centerY - fruitRadius * 0.3, 0, centerX + 100, centerY, fruitRadius);
        fruitCoreGrad.addColorStop(0, "rgba(251, 113, 133, 0.7)");
        fruitCoreGrad.addColorStop(0.5, "rgba(251, 113, 133, 0.4)");
        fruitCoreGrad.addColorStop(1, "rgba(180, 50, 70, 0.2)");
        ctx.fillStyle = fruitCoreGrad;
        ctx.fill();
      }

      // Arrow between action and fruit (grip)
      if (phase !== "intro" && phase !== "action") {
        ctx.beginPath();
        ctx.moveTo(centerX - 50, centerY);
        ctx.lineTo(centerX + 50, centerY);
        const gripGrad = ctx.createLinearGradient(centerX - 50, 0, centerX + 50, 0);
        gripGrad.addColorStop(0, "rgba(251, 191, 36, 0.5)");
        gripGrad.addColorStop(0.5, "rgba(251, 113, 133, 0.3)");
        gripGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = gripGrad;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Grip indicators
      // Before grip (left of fruit)
      ctx.beginPath();
      ctx.arc(centerX + 100, centerY - 70, 25, 0, Math.PI * 2);
      const beforeGrad = ctx.createRadialGradient(centerX + 100, centerY - 70, 0, centerX + 100, centerY - 70, 25);
      beforeGrad.addColorStop(0, `rgba(251, 113, 133, ${gripBefore / 10 * 0.4})`);
      beforeGrad.addColorStop(1, "rgba(251, 113, 133, 0.1)");
      ctx.fillStyle = beforeGrad;
      ctx.fill();

      ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${gripBefore}/10`, centerX + 100, centerY - 70);

      ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 113, 133, 0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GRIP BEFORE", centerX + 100, centerY - 45);

      // After grip (right of fruit)
      if (phase === "verdict" || phase === "integrate") {
        ctx.beginPath();
        ctx.arc(centerX + 160, centerY - 70, 25, 0, Math.PI * 2);
        const afterGrad = ctx.createRadialGradient(centerX + 160, centerY - 70, 0, centerX + 160, centerY - 70, 25);
        afterGrad.addColorStop(0, `rgba(110, 231, 183, ${gripAfter / 10 * 0.4})`);
        afterGrad.addColorStop(1, "rgba(110, 231, 183, 0.1)");
        ctx.fillStyle = afterGrad;
        ctx.fill();

        ctx.font = "bold 14px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.9)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${gripAfter}/10`, centerX + 160, centerY - 70);

        ctx.font = "italic 10px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("GRIP AFTER", centerX + 160, centerY - 45);
      }

      // Delta visualization
      if (phase === "verdict" || phase === "integrate") {
        const delta = gripBefore - gripAfter;
        if (delta > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX + 100, centerY - 70);
          ctx.lineTo(centerX + 160, centerY - 70);
          ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.stroke();

          ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
          ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`Δ ${delta}`, centerX + 130, centerY - 85);
        }
      }

      // Spawn particles
      if (phase === "grip" || phase === "release") {
        if (Math.random() < 0.1) {
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

      // Action text
      if (action) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const maxWidth = 180;
        const words = action.split(" ");
        let line = "";
        let y = centerY + 150;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 180 && line !== "") {
            ctx.fillText(line, centerX - 100, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX - 100, y);
      }

      // Fruit text
      if (fruit) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(251, 113, 133, 0.7)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = fruit.split(" ");
        let line = "";
        let y = centerY + 180;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 180 && line !== "") {
            ctx.fillText(line, centerX + 100, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX + 100, y);
      }

      // Release text
      if (release) {
        ctx.font = "italic 12px 'Cormorant Garamond', Georgia, serif";
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = release.split(" ");
        let line = "";
        let y = centerY + 220;
        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 360 && line !== "") {
            ctx.fillText(line, centerX, y);
            line = word + " ";
            y += 18;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, centerX, y);
      }

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
      const phaseOrder = ["intro", "action", "fruit", "grip", "release", "verdict", "integrate"];
      const progress = phaseOrder.indexOf(phase) / 6;
      ctx.beginPath();
      ctx.arc(centerX, size * 0.9, 60, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.stroke();

      // Labels
      ctx.font = "bold 10px 'Cormorant Garamond', Georgia, serif";
      ctx.fillStyle = "rgba(251, 191, 36, 0.8)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ACTION", centerX - 100, centerY + 70);

      ctx.fillStyle = "rgba(251, 113, 133, 0.8)";
      ctx.fillText("FRUIT", centerX + 100, centerY + 70);

      if (phase === "verdict" || phase === "integrate") {
        ctx.fillStyle = "rgba(110, 231, 183, 0.8)";
        ctx.fillText("RELEASED", centerX, centerY + 70);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [phase, gripBefore, gripAfter]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}